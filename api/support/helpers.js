const { api } = require('./client');
const config = require('../../api.config');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let cachedToken = null;

async function getAuthToken() {
  if (cachedToken) return cachedToken;

  const res = await api
    .post('/token')
    .set('Accept', 'application/json')
    .send({
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      grant_type: process.env.OAUTH_GRANT_TYPE,
    });

  if (res.status !== 200) {
    throw new Error(`Token fetch failed: ${res.status} ${JSON.stringify(res.body)}`);
  }

  cachedToken = res.body.data.access_token;
  return cachedToken;
}

async function submitOrder(token, packageId, quantity, attempt = 0) {
  const res = await api
    .post('/orders')
    .set('Authorization', `Bearer ${token}`)
    .set('Accept', 'application/json')
    .send({ package_id: packageId, quantity });

  if (res.status === 429 && attempt < config.retries) {
    const delay = res.headers['retry-after'] ? parseInt(res.headers['retry-after']) * 1000 : config.retryDelay;
    await sleep(delay);
    return submitOrder(token, packageId, quantity, attempt + 1);
  }

  return res;
}

async function getEsim(token, iccid, attempt = 0) {
  await sleep(500);

  const res = await api
    .get(`/sims/${iccid}`)
    .set('Authorization', `Bearer ${token}`)
    .set('Accept', 'application/json');

  if (res.status === 429 && attempt < config.retries) {
    const delay = res.headers['retry-after'] ? parseInt(res.headers['retry-after']) * 1000 : config.retryDelay;
    await sleep(delay);
    return getEsim(token, iccid, attempt + 1);
  }

  return res;
}

module.exports = { getAuthToken, submitOrder, getEsim };
