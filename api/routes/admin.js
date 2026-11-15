const express = require('express');
const router = express.Router();
const { 
    getAdminTravaux, 
    updateTravail,
    ajouterCreneau,
    updateCreneau,
    deleteCreneau
 }  = require('../controllers/adminController');
const verifierToken = require('../middleware/authentification');

// Route proteger, necessite le token valide de l'enseignant
router.get('/admin/travaux', verifierToken, getAdminTravaux);         // GET    /api/admin/travaux
router.put('/travaux/:id', verifierToken, updateTravail);             // PUT    /api/travaux/:id
router.post('/travaux/:id/creneaux', verifierToken, ajouterCreneau);  // POST   /api/travaux/:id/creneaux
router.put('/creneaux/:id', verifierToken, updateCreneau);            // PUT    /api/creneaux/:id
router.delete('/creneaux/:id', verifierToken, deleteCreneau);         // DELETE /api/creneaux/:id

module.exports = router;