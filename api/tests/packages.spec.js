const { expect } = require('chai');
const { api } = require('../support/client');
const { getAuthToken } = require('../support/helpers');

describe('Packages API', () => {
  let token;

  before(async () => {
    token = await getAuthToken();
  });

  it('GET /packages returns 200', async () => {
    const res = await api
      .get('/packages')
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json');

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('data');
  });

  it('GET /packages filters by type=local', async () => {
    const res = await api
      .get('/packages?type=local&page=1&limit=5')
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json');

    expect(res.status).to.equal(200);
    expect(res.body.data).to.be.an('array');
  });
});
