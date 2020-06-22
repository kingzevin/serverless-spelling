const request = require('request')
const { promisify } = require('util')
const metrics = require('metrics-sharelatex')
metrics.initialize('spelling')

const Settings = require('settings-sharelatex')
const logger = require('logger-sharelatex')
logger.initialize('spelling')
if ((Settings.sentry != null ? Settings.sentry.dsn : undefined) != null) {
  logger.initializeErrorReporting(Settings.sentry.dsn)
}
metrics.memory.monitor(logger)

const SpellingAPIController = require('./app/js/SpellingAPIController')
const express = require('express')
const server = express()
metrics.injectMetricsRoute(server)
const bodyParser = require('body-parser')
const HealthCheckController = require('./app/js/HealthCheckController')

server.use(bodyParser.json({ limit: '2mb' }))
server.use(metrics.http.monitor(logger))



server.del('/user/:user_id', SpellingAPIController.deleteDic)
server.get('/user/:user_id', SpellingAPIController.getDic)
server.post('/user/:user_id/check', SpellingAPIController.check)
server.post('/user/:user_id/learn', SpellingAPIController.learn)
server.post('/user/:user_id/unlearn', SpellingAPIController.unlearn)
server.get('/status', (req, res) => res.send({ status: 'spelling api is up' }))

server.get('/health_check', HealthCheckController.healthCheck)

const settings =
  Settings.internal && Settings.internal.spelling
    ? Settings.internal.spelling
    : undefined
const host = settings && settings.host ? settings.host : 'localhost'
const port = settings && settings.port ? settings.port : 3005

server.listen(port, host, function (error) {
  if (error != null) {
    throw error
  }
  return logger.info(`spelling starting up, listening on ${host}:${port}`)
})

function test(params = {}) {
  // params e.g.: {
  //  url: '/user/5dea50e08912bd02137651c2/check',
  //  method: 'post',
  //  words: ["yess", "sharelatex"],
  //  language: 'en'
  // }
  const url = params.__ow_path || '/user/5ec7b3d14857fc00a946704b/check';
  const method = params.__ow_method || 'post';
  params.words = params.words || ["yess", "zevina"];
  params.word = params.word || "yess";

  const reqPromise = promisify(request[method]);
  return (async () => {
    let result = await reqPromise({
      url: `http://${host}:${port}${url}`,
      json: params
    })
    return result;
  })();
}

if (!module.parent) {
  console.log(test());
}

exports.main = test
