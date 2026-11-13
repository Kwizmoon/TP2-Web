const pool = require('../config/database');

const verifierToken = async (req, res) => {
    try {
        // Recuperer l'en-tete Authorization
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({error: "Jeton manquant"});
        }

        // Extraire le token
        const token = authHeader.split(' ')[1];

        // Verifier dans la bd si l'utilisateur a ce jeton
        const [rows] = await pool.query.pool('SELECT * FROM utilisateurs WHERE token = ?', [token]);

        if (rows.length === 0) {
            return res.status(401).json({error: "Jeton invalide" });
        }

        //  Stocker l'utilisateur dans req pouracceder dans routes/controllers
        req.utilisateur = rows[0];

        // passe a la suite
        next();

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

module.exports = verifierToken;