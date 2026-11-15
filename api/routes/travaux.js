const express = require('express');
const router = express.Router();
const { 
    getTravauxOuverts, 
    getTravailId, 
    getDisponibilites, 
    updateDisponibilites 
} = require('../controllers/travauxController');

router.get('/travaux', getTravauxOuverts); // GET /api/travaux (?cours=<id>)
router.get('/travaux/:id', getTravailId); // GET /api/travaux/:id
router.get('/travaux/:id/disponibilites', getDisponibilites); // GET /api/travaux/:id/disponibilites
router.put('/travaux/:id/disponibilites/:matricule', updateDisponibilites); // PUT /api/travaux/:id/disponibilites/:matricule

// importer cette fonction avec require() dans server.js
module.exports = router;