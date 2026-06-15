const { expect } = require('chai');
const { getAuthToken, submitOrder } = require('../support/helpers');

describe('POST /orders', () => {
  const QUANTITY = 6;
  const PACKAGE_ID = 'moshi-moshi-7days-1gb';
  let token;
  let orderRes;

  before(async () => {
    token = await getAuthToken();
    orderRes = await submitOrder(token, PACKAGE_ID, QUANTITY);
  });

  it('returns 200 with success and correct order fields', () => {
    const { data } = orderRes.body;

    expect(orderRes.status).to.equal(200);
    expect(orderRes.body.meta.message).to.equal('success');
    expect(data).to.include({ package_id: PACKAGE_ID, quantity: QUANTITY });
    expect(data).to.have.property('id');
    expect(data).to.have.property('code');
  });

  it('sims array matches quantity and each has a valid iccid', () => {
    const { sims } = orderRes.body.data;

    expect(sims).to.be.an('array').with.lengthOf(QUANTITY);
    sims.forEach((sim) => {
      expect(sim.iccid).to.be.a('string').with.length.greaterThan(0);
    });
  });

  it('returns 4xx for invalid package_id', async () => {
    const res = await submitOrder(token, 'invalid-package-xyz', QUANTITY);
    expect(res.status).to.be.at.least(400);
  });
});
