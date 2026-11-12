const express = require('express');
const router = express.Router();
const { getCours } = require('../controllers/coursController');

// GET /api/cours
router.get('/', getCours);

// importer cette fonction avec require() dans server.js
module.exports = router;