require('dotenv').config();

module.exports = {
  baseURL: 'https://partners-api.airalo.com/v2',
  timeout: parseInt(process.env.API_TIMEOUT ?? '1000'),
  retries: 4, // Number of retries for failed requests with error 429
  retryDelay: 5000,
};
