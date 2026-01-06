import { NotificationEngineModule } from './notification-engine.module';

describe('NotificationEngineModule', () => {
  let notificationEngineModule: NotificationEngineModule;

  beforeEach(() => {
    notificationEngineModule = new NotificationEngineModule();
  });

  it('should create an instance', () => {
    expect(notificationEngineModule).toBeTruthy();
  });
});
