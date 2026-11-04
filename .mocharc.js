module.exports = {
  spec: 'test/**/*.spec.js',
  timeout: 10000,
  require: ['dotenv/config'],
  reporter: 'mochawesome',
  'reporter-option': [
    'reportDir=reports/mochawesome',
    'reportFilename=index',
    'html=true',
    'json=true',
    'overwrite=true',
  ],
};
