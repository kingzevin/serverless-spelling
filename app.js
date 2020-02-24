/*
* Author: Zevin
* Project: toServerless
*/
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
const HealthCheckController = require('./app/js/HealthCheckController')

function test(params = {}) {
  const operation = params.operation || "learn";

  if (operation === "check")
    return SpellingAPIController.zCheck(params);
  else if(operation === "learn")
    return SpellingAPIController.zLearn(params);
  else return undefined;
}

exports.main = test

if (!module.parent) {
  test().then(result => console.log(result));
}