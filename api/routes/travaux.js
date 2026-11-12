const express = require('express');
const router = express.Router();
const { 
    getTravaux, 
    getTravailId, 
    getDisponibilites, 
    updateDisponibilites 
} = require('../controllers/travauxController');

router.get('/', getTravaux); // GET /api/travaux (?cours=<id>)
router.get('/:id', getTravailId); // GET /api/travaux/:id
router.get('/:id/disponibilites', getDisponibilites); // GET /api/travaux/:id/disponibilites
router.put('/:id/disponibilites/:matricule', updateDisponibilites); // PUT /api/travaux/:id/disponibilites/:matricule

// importer cette fonction avec require() dans server.js
module.exports = router;