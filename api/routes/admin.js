const express = require('express');
const router = express.Router();
const { getAdminTravaux, updateTravail }  = require('../controllers/adminController');
const verifierToken = require('../middleware/authentification');

// Route proteger, necessite le token valide de l'enseignant
router.get('/admin/travaux', verifierToken, getAdminTravaux);  // GET /api/admin/travaux
router.put('/travaux/:id', verifierToken, updateTravail);     // PUT /api/travaux/:id

module.exports = router;