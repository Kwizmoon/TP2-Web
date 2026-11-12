const pool = require('../config/database');

// Recuperer tous les cours
const getCours = async (req, res) => {
    try {
        // [rows] : Déstructuration pour ne récupérer que les résultats (les lignes) retournés par la requête SQL
        const [rows] = await pool.query('SELECT * FROM cours');
        res.json(rows);
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur de récupération des cours" });
    }
}

// importer cette fonction avec require() dans les fichiers de routes
module.exports = { getCours };