import { extract } from './extract';

describe('Extract UML JSON Schema from tiny code', () => {
  it('should work', () => {
    expect(
      extract(`
// Project 1
export class UserService {
  async getSelf(): Promise<OutputType[]> {
    // any
  }

  @EventHandler(UserRegisteredEvent, {
    eventId: 'uuid-user-registered-event',
    description: '사용자 가입 후 필요한 처리를 담당한다.',
  })
  @Transactional()
  async onUserRegisteredEvent(userRegisteredEvent: UserRegisteredEvent) {
    // any
  }
}

// Project 2
export class PromotionService {
  @EventHandler(UserRegisteredEvent, {
    eventId: 'uuid-user-registered-event',
    description: '신규 회원 가입 프로모션에 대한 로직을 담당한다.',
  })
  @Transactional()
  async onUserRegisteredEvent(userRegisteredEvent: UserRegisteredEvent) {
    // any
  }
}
`)
    ).toEqual({
      $schema: 'http://json-schema.org/draft/2019-09/schema',
      title: 'UserRegisteredEvent',
      description: 'uuid-user-registered-event',
      type: 'object',
      properties: {
        'UserService@onUserRegisteredEvent': {
          type: 'object',
          description: '사용자 가입 후 필요한 처리를 담당한다.',
        },
        'PromotionService@onUserRegisteredEvent': {
          type: 'object',
          description: '신규 회원 가입 프로모션에 대한 로직을 담당한다.',
        },
      },
    });
  });
});
