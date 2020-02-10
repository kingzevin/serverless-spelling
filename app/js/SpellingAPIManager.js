/*
 * Author: Zevin
 * Project: toServerless
 * Version: v0.1 - initial version - purely check the words locally
 */
const ASpell = require('./ASpell')
const { callbackify } = require('util')

// The max number of words checked in a single request
const REQUEST_LIMIT = 10000

const SpellingAPIManager = {
  whitelist: ['ShareLaTeX', 'sharelatex', 'LaTeX', 'http', 'https', 'www'],

}

const promises = {
  async runRequest(token, request) {
    // token means user_id
    if (!request.words) {
      throw new Error('malformed JSON')
    }
    const lang = request.language || 'en'

    // only the first 10K words are checked
    const wordSlice = request.words.slice(0, REQUEST_LIMIT)
    const misspellings = await ASpell.promises.checkWords(lang, wordSlice)
    return { misspellings }
  }
}

SpellingAPIManager.runRequest = callbackify(promises.runRequest)
SpellingAPIManager.promises = promises

module.exports = SpellingAPIManager
