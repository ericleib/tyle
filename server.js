
var express = require('express');
var serveIndex = require('./js/express/serve-index.js');
var app = express();

app.use(function(req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  return next();
});
app.use(express.static(__dirname));
app.use('/', serveIndex(__dirname));

app.listen(8080);
