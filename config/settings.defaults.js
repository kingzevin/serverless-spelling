const Path = require('path')

module.exports = {
  mongo: {
    url: // config here should be automatically passed in
      `mongodb://172.17.0.1:27018/sharelatex`
  },

  cacheDir: Path.resolve('cache'),

  healthCheckUserId: '53c64d2fd68c8d000010bb5f',

  sentry: {
    dsn: process.env.SENTRY_DSN
  }
}
