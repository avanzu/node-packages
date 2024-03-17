const app = require('../../src/app');

describe('\'parallel\' service', () => {
  it('registered the service', () => {
    const service = app.service('parallel');
    expect(service).toBeTruthy();
  });
});
