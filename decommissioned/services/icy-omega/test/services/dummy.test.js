const app = require('../../src/app');

describe('\'dummy\' service', () => {
  it('registered the service', () => {
    const service = app.service('dummy');
    expect(service).toBeTruthy();
  });
});
