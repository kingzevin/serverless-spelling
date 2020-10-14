'use strict'
// environment variables specified by the user
process.env["MONGO_CONNECTION_STRING"] = `mongodb://172.17.0.1:27017/sharelatex`; // spelling.config.url
// the user should specify the express listener
const expressListener = require('./app.js') // spelling.express.file

const owServerlessExpress = require('./owServerlessExpress.js')

exports.main = function(params){ // spelling.handler.function
  return owServerlessExpress(expressListener, params)
}