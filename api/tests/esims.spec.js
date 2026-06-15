const { expect } = require('chai');
const { getAuthToken, submitOrder, getEsim } = require('../support/helpers');

describe('GET /esims — order-to-esim flow', () => {
  let token;
  let iccids;
  const QUANTITY = 6;
  const PACKAGE_ID = 'moshi-moshi-7days-1gb';

  before(async () => {
    token = await getAuthToken();
    const orderRes = await submitOrder(token, PACKAGE_ID, QUANTITY);
    iccids = orderRes.body.data.sims.map((e) => e.iccid);
  });

  it('order produces the expected number of iccids', () => {
    expect(iccids).to.have.lengthOf(QUANTITY);
    iccids.forEach((iccid) => {
      expect(iccid).to.be.a('string').with.length.greaterThan(0);
    });
  });

  it('each eSIM is retrievable and has all required fields', async () => {
    for (const iccid of iccids) {
      const res = await getEsim(token, iccid);
      const esim = res.body.data;

      expect(res.status).to.equal(200);
      expect(res.body.meta.message).to.equal('success');
      expect(esim).to.have.property('iccid', iccid);
      expect(esim).to.have.property('lpa');
      expect(esim).to.have.property('matching_id');
      expect(esim).to.have.property('qrcode');
    }
  });
});
