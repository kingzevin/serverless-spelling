/*
 * Author: Zevin
 * Project: toServerless
 * Version: v0.1 - initial version - purely check the words locally
 */

const SpellingAPIController = require('./app/js/SpellingAPIController')
const express = require('express')
const server = express()
const bodyParser = require('body-parser')

server.use(bodyParser.json({ limit: '2mb' }))

server.post('/user/:user_id/check', SpellingAPIController.check)
server.get('/status', (req, res) => res.send({ status: 'spelling api is up' }))

const host = 'localhost'
const port = 3005

// if (!module.parent) {
// application entry point, called directly
server.listen(port, host, function (error) {
  if (error != null) {
    throw error
  }
})
// }

function test(params) {
  // SpellingAPIController.check
  const words = params.words || ["yess"];
  var request = require('request');

  async function makeSynchronousRequest() {
    var flag = false;
    let response_body = await request.post(
      'http://localhost:3005/user/5dea50e08912bd02137651c2/check',
      { json: { "language": "en", "words": words, "token": "5dea50e08912bd02137651c2" } },
      function (error, response, body) {
        flag = true;
        return body;
      }
    );
    while (flag == false) {
      await sleep(1);
    }
    console.log({ flag: flag, response_body_response: response_body.response });
    let body = response_body.response.body;
    let results = {};
    if (body && body.misspellings) {
      for (let index = 0; index < body.misspellings.length; index++) {
        let word = words[body.misspellings[index].index];
        let suggestion = body.misspellings[index].suggestions
        results[word] = suggestion;
      }
    }
    return results;
  }

  return (async function () {
    response_body = await makeSynchronousRequest();
    return response_body;
  })();

}

exports.main = test

async function init() {
  console.log(1);
  await sleep(1000);
  console.log(2);
  return test({});
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

if (module.parent == null)
  init();