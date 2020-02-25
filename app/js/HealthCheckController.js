const logger = require('logger-sharelatex')
const SpellingAPIController = require('./SpellingAPIController')
const settings = require('settings-sharelatex')

module.exports = {
  async healthCheck() {
    let params = { words: ['helllo'], user_id: settings.healthCheckUserId, language: 'en' };
    let result = await SpellingAPIController.zCheck(params);
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
