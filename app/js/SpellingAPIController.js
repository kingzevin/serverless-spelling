/*
 * Author: Zevin
 * Project: toServerless
 */
const SpellingAPIManager = require('./SpellingAPIManager')
const logger = require('logger-sharelatex')
const metrics = require('metrics-sharelatex')

module.exports = {
  async zCheck(params) {
    metrics.inc('spelling-check', 0.1)
    params.words = params.words || ["yess", "zevina"];
    const token = params.user_id || "5dea50e08912bd02137651c2";

    let wordCount = params.words.length;
    logger.info({ token, wordCount }, 'running check')

    let doneFlag = false;
    let errorFlag = false;
    let misspellings = null;
    SpellingAPIManager.runRequest(
      token, params, function (error, result) {
        doneFlag = true;
        if (error != null) {
          logger.err({ err: error, user_id: token, wordCount }, "error processing spelling request");
          errorFlag = true;
          return;
        }
        misspellings = result.misspellings;
      });

    while (doneFlag === false) {
      await sleep(1);
    }

    if (errorFlag === true) {
      return { error: true, words: params.words, message: "error processing spelling request" };
    }

    let results = [];
    for (let index = 0; index < misspellings.length; index++) {
      results.push({ index: index, word: params.words[misspellings[index].index], suggestions: misspellings[index].suggestions });
    }
    return { misspellings: results };
  },

  // one word each time
  async zLearn(params) {
    metrics.inc('spelling-learn', 0.1);
    params.word = params.word || "yess";
    const token = params.user_id || "5dea50e08912bd02137651c2";
    word = params.word;
    logger.info({ token, word }, 'learning word')

    let doneFlag = false;
    let errorFlag = false;

    SpellingAPIManager.learnWord(token, params, function (error) {
      doneFlag = true;
      if (error != null) {
        logger.err({ err: error, user_id: token, wordCount }, "error processing spelling request");
        errorFlag = true;
      }
    });

    while (doneFlag === false) {
      await sleep(1);
    }

    if (errorFlag === true) {
      return { error: true, word: params.word, message: "error processing spelling request" };
    } else {
      return { error: false, message: "succeeded" };
    }
  },
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
