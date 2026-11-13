const express = require('express');
const router = express.Router();
const { connexion, deconnexion } = require('../controllers/authController');

router.post('/connexion', connexion);
router.post('/deconnexion', deconnexion);

module.exports = router; // importer dans server.js