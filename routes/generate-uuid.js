var express = require('express');
var router = express.Router();
const {v4 : uuidv4} = require('uuid')

router.get('/', async function(req, res, next) {
    const uuid = uuidv4();
    res.json(uuid);
});

module.exports = router;