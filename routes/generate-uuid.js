var express = require('express');
var router = express.Router();
const {v4 : uuidv4} = require('uuid')

router.get('/', async function(req, res, next) {
    res.json(uuidv4())
});

module.exports = router;
