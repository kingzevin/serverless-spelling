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

const runMiddleware = require('run-middleware');
runMiddleware(server);

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

if (!module.parent) {
  (async ()=>{
    let a = await test();
    console.log(a);
  })();
}

exports.main = pure

function pure(params = {}) {
  function invoke(url, bodyJSON) {
    return new Promise((resolve, reject) => {
      server.runMiddleware(url, bodyJSON, (code, data) => {
        if (code == 200)
          resolve({ body: data });
        else
          reject({ body: { code, data } })
      })
    });
  }

  return (async () => {
    let result = await invoke(params.url, { method: params.__ow_method, body: params });
    return result
  })();
}


function test(params = {}) {
  // params e.g.: {
  //  url: '/user/5dea50e08912bd02137651c2/check',
  //  method: 'post',
  //  words: ["yess", "sharelatex"],
  //  language: 'en'
  // }

  const url = params.url || '/user/5dea50e08912bd02137651c2/check';
  const method = params.__ow_method || 'post';
  params.words = params.words || ["yess", "zevina"];
  params.word = params.word || "yess";

  function invoke(url, bodyJSON) {
    return new Promise((resolve, reject) => {
      server.runMiddleware(url, bodyJSON, (code, data) => {
        if(code == 200)
          resolve({body:data });
        else 
          reject({body: {code, data}})
      })
    });
  }

  return (async () => {
    let result = await invoke(url, { method, body: params });
    return result
  })();
}