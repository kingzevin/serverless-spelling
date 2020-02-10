/*
 * Author: Zevin
 * Project: toServerless
 * Version: v0.1 - initial version - purely check the words locally
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
    SpellingAPIManager.runRequest(token, req.body, function(error, result) {
      if (error != null) {
        console.log(error);
        return res.sendStatus(500)
      }
      res.send(result)
    })
  }
}
