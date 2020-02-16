/*
* Author: Zevin
* Project: toServerless
*/

const SpellingAPIController = require('./app/js/SpellingAPIController')


// if (!module.parent) {
//   const bodyParser = require('body-parser')
//   // application entry point, called directly
//   const express = require('express');
//   const server = express();

//   server.use(bodyParser.json({ limit: '2mb' }));

//   server.post('/user/:user_id/check', SpellingAPIController.check)
//   server.get('/status', (req, res) => res.send({ status: 'spelling api is up' }));

//   const host = 'localhost';
//   const port = 3005;
//   server.listen(port, host, function (error) {
//     if (error != null) {
//       throw error
//     }
//   })
// }

function test(params) {
  // SpellingAPIController.check
  const operation = params.operation || "check";
  const version = params.version || 0.2;


  async function makeSynchronousRequest() {
    const words = params.words || ["yess"];
    var request = require('request');
    const token = params.user_id || "5dea50e08912bd02137651c2";
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

  async function makeSynchronousCheck() {
    return SpellingAPIController.zCheck(params);
  }

  if (version - 0.1 < 1e-6) {
    return (async function () {
      let response_body = await makeSynchronousRequest();
      return response_body;
    })();
  }
  else {
    if (operation == "check")
      return (async function () {
        let response_body = await makeSynchronousCheck();
        console.log(response_body);
        return response_body;
      })();
    else return undefined;
  }
}

exports.main = test

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

if (!module.parent)
  test({});