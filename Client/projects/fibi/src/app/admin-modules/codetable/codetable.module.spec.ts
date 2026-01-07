import { CodetableModule } from './codetable.module';

describe('CodetableModule', () => {
  let codetableModule: CodetableModule;

  beforeEach(() => {
    codetableModule = new CodetableModule();
  });

  it('should create an instance', () => {
    expect(codetableModule).toBeTruthy();
  });
});
