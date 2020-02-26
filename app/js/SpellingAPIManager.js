/*
 * Author: Zevin
 * Project: toServerless
 */
const ASpell = require('./ASpell')
const LearnedWordsManager = require('./LearnedWordsManager')
const { callbackify } = require('util')

// The max number of words checked in a single request
const REQUEST_LIMIT = 10000

const SpellingAPIManager = {
  whitelist: ['ShareLaTeX', 'sharelatex', 'LaTeX', 'http', 'https', 'www'],

  learnWord(token, request) {
    if (request.word == null) {
      return new Error('malformed JSON')
    }
    if (token == null) {
      return new Error('no token provided')
    }

    return LearnedWordsManager.promises.learnWord(token, request.word)
  },

  unlearnWord(token, request) {
    if (request.word == null) {
      return new Error('malformed JSON')
    }
    if (token == null) {
      return new Error('no token provided')
    }

    return LearnedWordsManager.promises.unlearnWord(token, request.word)
  },

  deleteDic(token) {
    return LearnedWordsManager.promises.deleteUsersLearnedWords(token)
  },

  getDic(token) {
    return LearnedWordsManager.promises.getLearnedWords(token)
  }
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

    // for learned words
    if (token) {
      const learnedWords = await LearnedWordsManager.promises.getLearnedWords(
        token
      )
      const notLearntMisspellings = misspellings.filter(m => {
        const word = wordSlice[m.index]
        return (
          learnedWords.indexOf(word) === -1 &&
          SpellingAPIManager.whitelist.indexOf(word) === -1
        )
      })
      return { misspellings: notLearntMisspellings }
    } else {
      return { misspellings }
    }
  }
}

// SpellingAPIManager.runRequest = callbackify(promises.runRequest) 
// if callbackified, then runRequest will be executed asynchronously
SpellingAPIManager.runRequest = promises.runRequest
SpellingAPIManager.promises = promises

module.exports = SpellingAPIManager
