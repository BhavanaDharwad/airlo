module.exports = {
  require: ['@babel/register', './api/support/setup.js'],
  spec: ['api/tests/**/*.spec.js'],
  timeout: 30000,
  recursive: true,
  reporter: 'mochawesome',
  reporterOptions: [
    'reportDir=mochawesome-report',
    'reportFilename=index',
    'overwrite=true',
    'html=true',
    'json=true',
  ],
};
