var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send("hi there! how are you  guys !!!");
});

module.exports = router;
