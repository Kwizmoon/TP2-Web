const express = require('express');
const cors = require('cors');

const app = express();


app.use(cors()); // Permet au frontend (PHP / Vue.js) de communiquer avec l'API
app.use(express.json()); // Permet de lire le JSON envoyé dans le req.body (pour les PUT / POST)

// Import des routes
const coursRoutes = require('./routes/cours');
const travauxRoutes = require('./routes/travaux');
const authRoutes = require('./routes/auth');

// Utilisation des routes
app.use('/api/cours', coursRoutes); // Gere /api/cours
app.use('/api/travaux', travauxRoutes); // Gere /api/travaux (?cours=<id>)  /api/travaux/:id  /api/travaux/:id/disponibilites   /api/travaux/:id/disponibilites/:matricule 
app.use('/api/auth', authRoutes); // Gere /api/connexion et /api/deconnexion


// Demarrer serveur
app.listen(3000, () => {
    console.log(`API démarrée sur http://localhost:${3000}`);
});