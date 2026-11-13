const express = require('express');
const router = express.Router();
const getAdminTravaux  = require('../controllers/adminController');
const verifierToken = require('../middleware/authentification');

// Route proteger, necessite le token valide de l'enseignant
router.get('/admin/travaux', verifierToken, getAdminTravaux);  // GET /api/admin/travaux

module.exports = router;