/*
 * Author: Zevin
 * Project: toServerless
 */
const SpellingAPIManager = require('./SpellingAPIManager')
const logger = require('logger-sharelatex')
const metrics = require('metrics-sharelatex')

function extractCheckRequestData(params) {
  const token = params ? params.user_id : undefined
  const wordCount =
    params && params.words ? params.words.length : undefined
  return { token, wordCount }
}

function extractLearnRequestData(params) {
  const token = params ? params.user_id : undefined
  const word = params ? params.word : undefined
  return { token, word }
}

module.exports = {
  async zCheck(params) {
    metrics.inc('spelling-check', 0.1)
    const { token, wordCount } = extractCheckRequestData(params)
    logger.info({ token, wordCount }, 'running check')

    let misspellings = null;

    let managerResult = await SpellingAPIManager.runRequest(
      token, params);
    if (managerResult instanceof Error) {
      logger.err({ err: error, user_id: token, wordCount }, "error processing spelling request");
      return { result: { error: true, words: params.words, message: "error processing spelling request" } };
    } else {
      misspellings = managerResult.misspellings ? managerResult.misspellings : null;
    }

    let results = [];
    for (let index = 0; index < misspellings.length; index++) {
      results.push({ index: index, word: params.words[misspellings[index].index], suggestions: misspellings[index].suggestions });
    }
    return { result: { misspellings: results, message: "passed" } };
  },

  // one word each time
  async zLearn(params) {
    metrics.inc('spelling-learn', 0.1);
    const { token, word } = extractLearnRequestData(params)
    logger.info({ token, word }, 'learning word')

    let managerResult = await SpellingAPIManager.learnWord(
      token, params);
    if (managerResult instanceof Error) {
      logger.err({ err: error, user_id: token }, "error processing spelling request");
      return { result: { error: true, word, message: "error processing spelling request" } };
    } else {
      return { result: { message: "passed", code: 204 } };
    }
  },

  async zUnlearn(params) {
    metrics.inc('spelling-unlearn', 0.1)
    const { token, word } = extractLearnRequestData(params)
    logger.info({ token, word }, 'unlearning word')

    let managerResult = await SpellingAPIManager.unlearnWord(
      token, params);
    if (managerResult instanceof Error) {
      logger.err({ err: error, user_id: token }, "error processing spelling request");
      return { result: { error: true, word, message: "error processing spelling request" } };
    } else {
      return { result: { message: "passed", code: 204 } };
    }
  },

  async zDeleteDic(params) {
    const { token, word } = extractLearnRequestData(params)
    logger.log({ token, word }, 'deleting user dictionary')

    let managerResult = await SpellingAPIManager.deleteDic(token);
    if (managerResult instanceof Error) {
      logger.err({ err: error, user_id: token }, "error processing spelling request");
      return { result: { error: true, user_id: token, message: "error processing spelling request" } };
    } else {
      return { result: { message: "passed", code: 204 } };
    }
  },

  async zGetDic(params) {
    const token = params ? params.user_id : undefined
    logger.info(
      {
        token
      },
      'getting user dictionary'
    )

    let managerResult = await SpellingAPIManager.getDic(token)
    if (managerResult instanceof Error) {
      logger.err({ err: error, user_id: token }, "error processing spelling request");
      return { result: { error: true, message: "error processing spelling request" } };
    } else {
      return { result: { message: "passed", words: managerResult } };
    }
  }
}

