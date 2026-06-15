const supertest = require('supertest');
const config = require('../../api.config');

const api = supertest(config.baseURL);

module.exports = { api };
