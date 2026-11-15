const express = require('express');
const router = express.Router();
const { connexion, deconnexion } = require('../controllers/authController');

router.post('/connexion', connexion);     // POST /api/connexion
router.post('/deconnexion', deconnexion); // POST /api/deconnexion

module.exports = router; // importer dans server.js