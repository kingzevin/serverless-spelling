/*
 * Author: Zevin
 * Project: toServerless
 * Version: v0.1 - initial version - purely check the words locally
 */
const ASpellWorkerPool = require('./ASpellWorkerPool')
const LRU = require('lru-cache')
const fs = require('fs')
// const settings = require('settings-sharelatex')
const Path = require('path')
const { promisify } = require('util')

const OneMinute = 60 * 1000
const opts = { max: 10000, maxAge: OneMinute * 60 * 10 }
const cache = new LRU(opts)

const cacheFsPath = Path.resolve(Path.resolve('cache'), 'spell.cache')
const cacheFsPathTmp = cacheFsPath + '.tmp'

// load any existing cache
try {
  const oldCache = fs.readFileSync(cacheFsPath)
  cache.load(JSON.parse(oldCache))
} catch (error) {
  const err = error
}

// write the cache every 30 minutes
setInterval(function() {
  const dump = JSON.stringify(cache.dump())
  return fs.writeFile(cacheFsPathTmp, dump, function(err) {
    if (err != null) {
      return fs.unlink(cacheFsPathTmp)
    } else {
    }
  })
}, 30 * OneMinute)

class ASpellRunner {
  checkWords(language, words, callback) {
    if (callback == null) {
      callback = () => {}
    }
    return this.runAspellOnWords(language, words, (error, output) => {
      if (error != null) {
        return callback(error)
      }
      // output = @removeAspellHeader(output)
      const suggestions = this.getSuggestions(language, output)
      const results = []
      let hits = 0
      const addToCache = {}
      for (let i = 0; i < words.length; i++) {
        const word = words[i]
        const key = language + ':' + word
        const cached = cache.get(key)
        if (cached != null) {
          hits++
          if (cached === true) {
            // valid word, no need to do anything
            continue
          } else {
            results.push({ index: i, suggestions: cached })
          }
        } else {
          if (suggestions[key] != null) {
            addToCache[key] = suggestions[key]
            results.push({ index: i, suggestions: suggestions[key] })
          } else {
            // a valid word, but uncached
            addToCache[key] = true
          }
        }
      }

      // update the cache after processing all words, to avoid cache
      // changing while we use it
      for (let k in addToCache) {
        const v = addToCache[k]
        cache.set(k, v)
      }


      return callback(null, results)
    })
  }

  getSuggestions(language, output) {
    const lines = output.split('\n')
    const suggestions = {}
    for (let line of Array.from(lines)) {
      var parts, word
      if (line[0] === '&') {
        // Suggestions found
        parts = line.split(' ')
        if (parts.length > 1) {
          word = parts[1]
          const suggestionsString = line.slice(line.indexOf(':') + 2)
          suggestions[language + ':' + word] = suggestionsString.split(', ')
        }
      } else if (line[0] === '#') {
        // No suggestions
        parts = line.split(' ')
        if (parts.length > 1) {
          word = parts[1]
          suggestions[language + ':' + word] = []
        }
      }
    }
    return suggestions
  }

  // removeAspellHeader: (output) -> output.slice(1)

  runAspellOnWords(language, words, callback) {
    // send words to aspell, get back string output for those words
    // find a free pipe for the language (or start one)
    // send the words down the pipe
    // send an END marker that will generate a "*" line in the output
    // when the output pipe receives the "*" return the data sofar and reset the pipe to be available
    //
    // @open(language)
    // @captureOutput(callback)
    // @setTerseMode()
    // start = new Date()

    if (callback == null) {
      callback = () => {}
    }
    const newWord = {}
    for (let word of Array.from(words)) {
      if (!newWord[word] && !cache.has(language + ':' + word)) {
        newWord[word] = true
      }
    }
    words = Object.keys(newWord)

    if (words.length) {
      return WorkerPool.check(language, words, ASpell.ASPELL_TIMEOUT, callback)
    } else {
      return callback(null, '')
    }
  }
}

const ASpell = {
  // The description of how to call aspell from another program can be found here:
  // http://aspell.net/man-html/Through-A-Pipe.html
  checkWords(language, words, callback) {
    if (callback == null) {
      callback = () => {}
    }
    const runner = new ASpellRunner()
    return runner.checkWords(language, words, callback)
  },
  ASPELL_TIMEOUT: 10000
}

const promises = {
  checkWords: promisify(ASpell.checkWords)
}

ASpell.promises = promises

module.exports = ASpell

var WorkerPool = new ASpellWorkerPool()
