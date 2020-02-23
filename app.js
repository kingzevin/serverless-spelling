/*
* Author: Zevin
* Project: toServerless
*/

const SpellingAPIController = require('./app/js/SpellingAPIController')

function test(params = {}) {
  const operation = params.operation || "check";

  if (operation == "check")
    return SpellingAPIController.zCheck(params);
  else return undefined;
}

exports.main = test

if (!module.parent) {
  test().then(result => console.log(result));
}