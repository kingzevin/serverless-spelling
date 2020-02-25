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

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

module.exports = {
  async zCheck(params) {
    metrics.inc('spelling-check', 0.1)
    const { token, wordCount } = extractCheckRequestData(params)
    logger.info({ token, wordCount }, 'running check')

    let doneFlag = false;
    let errorFlag = false;
    let misspellings = null;
    SpellingAPIManager.runRequest(
      token, params, function (error, result) {
        if (error != null) {
          logger.err({ err: error, user_id: token, wordCount }, "error processing spelling request");
          errorFlag = true;
        }
        misspellings = result.misspellings ? result.misspellings : null;
        doneFlag = true;
      });

    while (doneFlag === false) {
      await sleep(1);
    }

    if (errorFlag === true) {
      return { result: { error: true, words: params.words, message: "error processing spelling request" } };
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

    let doneFlag = false;
    let errorFlag = false;

    SpellingAPIManager.learnWord(token, params, function (error) {
      if (error != null) {
        logger.err({ err: error, user_id: token }, "error processing spelling request");
        errorFlag = true;
      }
      doneFlag = true;
    });

    while (doneFlag === false) {
      await sleep(1);
    }

    if (errorFlag === true) {
      return { result: { error: true, word, message: "error processing spelling request" } };
    } else {
      return { result: { message: "passed", code: 204 } };
    }
  },

  async zUnlearn(params) {
    metrics.inc('spelling-unlearn', 0.1)
    const { token, word } = extractLearnRequestData(params)
    logger.info({ token, word }, 'unlearning word')

    let doneFlag = false;
    let errorFlag = false;

    SpellingAPIManager.unlearnWord(token, params, function (error) {
      if (error != null) {
        logger.err({ err: error, user_id: token }, "error processing spelling request");
        errorFlag = true;
      }
      doneFlag = true;
    })

    while (doneFlag === false) {
      await sleep(1);
    }

    if (errorFlag === true) {
      return { result: { error: true, word, message: "error processing spelling request" } };
    } else {
      return { result: { message: "passed", code: 204 } };
    }
  },

  async zDeleteDic(params) {
    const { token, word } = extractLearnRequestData(params)
    logger.log({ token, word }, 'deleting user dictionary')

    let doneFlag = false;
    let errorFlag = false;

    SpellingAPIManager.deleteDic(token, function (error) {
      if (error != null) {
        logger.err({ err: error, user_id: token }, "error processing spelling request");
        errorFlag = true;
      }
      doneFlag = true;
    })

    while (doneFlag === false) {
      await sleep(1);
    }

    if (errorFlag === true) {
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

    let doneFlag = false;
    let errorFlag = false;
    let learnedWords = [];

    SpellingAPIManager.getDic(token, function (error, words) {
      if (error != null) {
        logger.err({ err: error, user_id: token }, "error processing spelling request");
        errorFlag = true;
      }
      learnedWords = words;
      doneFlag = true;
    })

    while (doneFlag === false) {
      await sleep(1);
    }

    if (errorFlag === true) {
      return { result: { error: true, message: "error processing spelling request" } };
    } else {
      return { result: { message: "passed", words: learnedWords } };
    }
  }
}

