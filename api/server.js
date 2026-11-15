const express = require('express');
const cors = require('cors');

const app = express();


app.use(cors()); // Permet au frontend (PHP / Vue.js) de communiquer avec l'API
app.use(express.json()); // Permet de lire le JSON envoyé dans le req.body (pour les PUT / POST)

// Import des routes
const coursRoutes = require('./routes/cours');
const travauxRoutes = require('./routes/travaux');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');

// Utilisation des routes
app.use('/api', coursRoutes);     // Gere /api/cours
app.use('/api', travauxRoutes); // Gere /api/travaux (?cours=<id>)  /api/travaux/:id  /api/travaux/:id/disponibilites   /api/travaux/:id/disponibilites/:matricule 
app.use('/api', authRoutes);            // Gere /api/connexion et /api/deconnexion
app.use('/api', adminRoutes);           // Gere /api/admin/travaux  PUT /api/travaux/:id  POST /api/travaux/:id/creneaux  PUT /api/creneaux/:id  DELETE /api/creneaux/:id

// Demarrer serveur
app.listen(3000, () => {
    console.log(`API démarrée sur http://localhost:${3000}`);
});