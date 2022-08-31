import * as ts from 'typescript';

const getMetadataFromNodes = (
  nodes: Iterable<ts.Node>,
  parentNode?: ts.Node
) => {
  const metadata: Record<string, any>[] = [];
  for (const node of nodes) {
    if (ts.isClassDeclaration(node)) {
      metadata.push(...getMetadataFromNodes(node.members, node));
    } else if (
      // 1. Class 안에 있는 메서드이면서
      ts.isMethodDeclaration(node) &&
      parentNode &&
      ts.isClassDeclaration(parentNode)
    ) {
      for (const decorator of node.decorators || []) {
        // 2. 데코레이터 중 EventHandler가 선언되어 있는것을 찾는다.
        if (
          !ts.isCallExpression(decorator.expression) ||
          !ts.isIdentifier(decorator.expression.expression) ||
          decorator.expression.expression.escapedText !== 'EventHandler'
        ) {
          continue;
        }

        const subscriberTitle = `${
          parentNode.name?.escapedText || '[Anonymous]'
        }@${
          ts.isIdentifier(node.name) ? node.name.escapedText : '[Anonymous]'
        }`;
        const [eventIdentifier, eventOptionObjectLiteral] = [
          ...decorator.expression.arguments,
        ];
        const eventId = ts.isObjectLiteralExpression(eventOptionObjectLiteral)
          ? (() => {
            const eventIdInitializer = eventOptionObjectLiteral.properties.find(
              (p): p is ts.PropertyAssignment =>
                !!p.name &&
                ts.isIdentifier(p.name) &&
                p.name.escapedText === 'eventId'
            )?.initializer;
            if (!eventIdInitializer || !ts.isStringLiteral(eventIdInitializer)) {
              return 'TODO'
            }
            return eventIdInitializer.text; // TODO: getText() 테스트
          })()
          : 'uuid TODO';

        metadata.push({
          // eventId: ts.isObjectLiteralExpression(eventOptionObjectLiteral) ? eventOptionObjectLiteral.properties,
          eventTitle: ts.isIdentifier(eventIdentifier)
            ? eventIdentifier.escapedText
            : '[Anonymous]',

          // subscriber info
          subscriberTitle,
          subscriberDescription: '',
        });
        console.log(
          '@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
          subscriberTitle,
          '@@@@@@@@@',
          [...decorator.expression.arguments][1]
        );
      }
    }
  }

  return metadata;
};

const getJsonSchemaFromAST = (sourceFile: ts.SourceFile) => {
  const schemas: Record<string, any>[] = [];

  // console.log(sourceFile.statements);
  const metadata = getMetadataFromNodes(sourceFile.statements);

  return {
    $schema: 'http://json-schema.org/draft/2019-09/schema',
    // title: 'UserRegisteredEvent',
    // description: 'uuid-user-registered-event',
    // type: 'object',
    // properties: {
    //   'UserService@onUserRegisteredEvent': {
    //     type: 'object',
    //     description: '사용자 가입 후 필요한 처리를 담당한다.',
    //   },
    //   'PromotionService@onUserRegisteredEvent': {
    //     type: 'object',
    //     description: '신규 회원 가입 프로모션에 대한 로직을 담당한다.',
    //   },
    // },
  };
};

const getASTFromFile = (filename: string) => {
  const program = ts.createProgram([filename], {
    allowJs: true,
    experimentalDecorators: true,
    emitDecoratorMetadata: true,
  });
  const sourceFile = program.getSourceFile(filename);

  return sourceFile!;
};

export function extract(filename: string): Record<string, any> {
  return getJsonSchemaFromAST(
    getASTFromFile('./packages/core/test/example.ts')
  );
}
