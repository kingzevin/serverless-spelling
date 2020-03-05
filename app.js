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
  const operation = params.operation || "getDic";
  const user_id = params.user_id || "5dea50e08912bd02137651c2";
  const word = params.word || "yess";
  const words = params.words || ["yess", "zevina"];

  const opts = { timeout: 1000 * 20 }

  if (operation === "check") {
    opts.json = { words, language: 'en' };
    opts.url = `http://localhost:3005/user/${user_id}/check`;
    const postReq = promisify(request.post);

    return (async () => {
      let result = await postReq(opts);
      let statusCode = result.statusCode;
      if (statusCode == 500) {
        return { result: { message: `error processing ${operation} request`, status: "failed" } };
      }
      let misspellings = result.body.misspellings;
      let results = [];
      for (let index = 0; index < misspellings.length; index++) {
        results.push({ index: index, word: words[misspellings[index].index], suggestions: misspellings[index].suggestions });
      }
      return { result: { misspellings: results, status: "passed" } };
    })();
  }
  else if (operation === "learn") {
    opts.json = { word, language: 'en' };
    opts.url = `http://localhost:3005/user/${user_id}/learn`;
    const postReq = promisify(request.post);

    return (async () => {
      let result = await postReq(opts);
      let statusCode = result.statusCode;
      if (statusCode == 500) {
        return { result: { message: `error processing ${operation} request`, status: "failed", statusCode } };
      }
      return { result: { word, message: "learning passed", status: "passed", statusCode } };
    })();
  }
  else if (operation === "unlearn") {
    opts.json = { word, language: 'en' };
    opts.url = `http://localhost:3005/user/${user_id}/unlearn`;
    const postReq = promisify(request.post);

    return (async () => {
      let result = await postReq(opts);
      let statusCode = result.statusCode;
      if (statusCode == 500) {
        return { result: { message: `error processing ${operation} request`, status: "failed", statusCode } };
      }
      return { result: { word, message: "unlearning passed", status: "passed", statusCode } };
    })();
  }
  else if (operation === "getDic") {
    opts.url = `http://localhost:3005/user/${user_id}`;
    const getReq = promisify(request.get);

    return (async () => {
      let result = await getReq(opts);
      let statusCode = result.statusCode;
      if (statusCode == 500) {
        return { result: { message: `error processing ${operation} request`, status: "failed" }, statusCode };
      }
      // return {result: {words:result.body}}
      return { result: { words:result.body, message: "got dic", status: "passed", statusCode } };
    })();
  }
  else if (operation === "deleteDic") {
    opts.url = `http://localhost:3005/user/${user_id}`;
    const delReq = promisify(request.del);

    return (async () => {
      let result = await delReq(opts);
      let statusCode = result.statusCode;
      if (statusCode == 500) {
        return { result: { message: `error processing ${operation} request`, status: "failed" }, statusCode };
      }
      return { result: { message: "got dic", status: "passed", statusCode } };
    })();
  }
  else if (operation === "status") {
    opts.url = `http://localhost:3005/status`;
    const getReq = promisify(request.get);

    return (async () => {
      let result = await getReq(opts);
      let statusCode = result.statusCode;
      if (statusCode == 500) {
        return { result: { message: `error processing ${operation} request`, status: "failed" }, statusCode };
      }
      return { result: { message: "up", status: "passed", statusCode } };
    })();
  }
  else if (operation === "healthCheck") {
    opts.url = `http://localhost:3005/health_check`;
    const getReq = promisify(request.get);

    return (async () => {
      let result = await getReq(opts);
      let statusCode = result.statusCode;
      if (statusCode == 500) {
        return { result: { message: "health check failed", status: "failed", statusCode } };
      }
      return { result: { message: "health check passed", status: "passed", statusCode } };
    })();
  }


}

if (!module.parent) {
  test().then(result => console.log(result));
}

exports.main = test
