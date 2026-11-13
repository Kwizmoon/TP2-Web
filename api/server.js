const express = require('express');
const cors = require('cors');

const app = express();


app.use(cors()); // Permet au frontend (PHP / Vue.js) de communiquer avec l'API
app.use(express.json()); // Permet de lire le JSON envoyé dans le req.body (pour les PUT / POST)

// Import des routes
const coursRoutes = require('./routes/cours');
const travauxRoutes = require('./routes/travaux');

// Utilisation des routes
app.use('/api/cours', coursRoutes);
app.use('/api/travaux', travauxRoutes);


// Demarrer serveur
app.listen(3000, () => {
    console.log(`API démarrée sur http://localhost:${3000}`);
});