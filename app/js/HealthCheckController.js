const request = require('request')
const logger = require('logger-sharelatex')
const settings = require('settings-sharelatex')
const SpellingAPIController = require('./app/js/SpellingAPIController')

module.exports = {
  healthCheck() {
    let params = { words: ['helllo'] };
    let result = SpellingAPIController.zCheck(params);
    result = result.result;
    if (result.error) {
      logger.err({ params }, 'health check failed');
      return { result: { error: true, message: "health check failed" } };
    }
    const misspellings = result.misspellings ? result.misspellings[0] : undefined;
    const numberOfSuggestions = misspellings && misspellings.suggestions ? misspellings.suggestions.length : 0;

    if (numberOfSuggestions > 10) {
      logger.log('health check passed');
      return { result: { message: "passed" } };
    }
    else {
      logger.err({ params, numberOfSuggestions }, 'health check failed');
      return { result: { error: true, message: "health check failed" } };
    }

  }
}
