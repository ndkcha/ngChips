import { ChipsPage } from './app.po';

describe('chips App', () => {
  let page: ChipsPage;

  beforeEach(() => {
    page = new ChipsPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!');
  });
});
