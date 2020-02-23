/*
 * Author: Zevin
 * Project: toServerless
 */
const SpellingAPIManager = require('./SpellingAPIManager')

function extractCheckRequestData(req) {
  const token = req.params ? req.params.user_id : undefined
  const wordCount =
    req.body && req.body.words ? req.body.words.length : undefined
  return { token, wordCount }
}

module.exports = {
  check(req, res) {
    const { token, wordCount } = extractCheckRequestData(req)
    SpellingAPIManager.runRequest(token, req.body, function (error, result) {
      if (error != null) {
        console.log(error);
        return res.sendStatus(500)
      }
      res.send(result)
    })
  },

  async zCheck(params) {
    params.words = params.words || ["yess", "zevina"];
    const token = params.user_id || "5dea50e08912bd02137651c2";

    let misspellings = null;
    SpellingAPIManager.runRequest(
      token, params, function (error, result) {
        // console.log("1");
        misspellings = result.misspellings;
      });

    while (misspellings === null) {
      await sleep(1);
    }

    let results = [];
    for (let index = 0; index < misspellings.length; index++) {
      results.push({ index: index, word: params.words[misspellings[index].index], suggestions: misspellings[index].suggestions });
    }
    return {misspellings: results};
  }
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
