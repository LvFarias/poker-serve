const express = require('express');

const router = express.Router();

router.use(express.json());

router.get('/', async (req, res, next) => {
  return req.success();
});

module.exports = router;
