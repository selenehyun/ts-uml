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
