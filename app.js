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
  const operation = params.operation || "check";
  params.user_id = params.user_id || "5dea50e08912bd02137651c2";
  params.word = params.word || "yess";
  params.words = params.words || ["yess", "zevina"];

  if (operation === "check")
    return SpellingAPIController.zCheck(params);
  else if(operation === "learn")
    return SpellingAPIController.zLearn(params);
  else if(operation === "unlearn")
    return SpellingAPIController.zUnlearn(params);
  else if(operation === "getDic")
    return SpellingAPIController.zGetDic(params);
  else if(operation === "deleteDic")
    return SpellingAPIController.zDeleteDic(params);
  else if(operation === "status")
    return { result: { message: "passed", status: "up" } };
  else if(operation === "healthCheck")
    return HealthCheckController.healthCheck();
  else return undefined;
}

if (!module.parent) {
  test().then(result => console.log(result));
}

exports.main = test