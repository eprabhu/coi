import { BusinessRuleModule } from './business-rule.module';

describe('BusinessRuleModule', () => {
  let businessRuleModule: BusinessRuleModule;

  beforeEach(() => {
    businessRuleModule = new BusinessRuleModule();
  });

  it('should create an instance', () => {
    expect(businessRuleModule).toBeTruthy();
  });
});
