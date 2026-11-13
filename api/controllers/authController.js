const pool = require('../config/database');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

// POST /api/connexion
const connexion = async (req, res) => {
    try {
        const { identifiant, motDePasse } = req.body;

        // Chercher le utilisateur par identifiant
        const [rows] = await pool.query('SELECT * FROM utilisateurs WHERE identifiant = ?', [identifiant]);

        if (rows.length === 0){
            return res.status(401).json({error: "Identifiant ou mot de passe invalide"});
        }
        
        const utilisateur = rows[0];

        // Verifier le mdp hacher avec bcrypt
        const mdpCorrect = await bcrypt.compare(motDePasse, utilisateur.mot_de_passe);

        if (!mdpCorrect){
            return res.status(401).json({error: "Identifiant ou mot de passe invalide"});
        }

        // Generer un jeton 
        const token = crypto.randomBytes(32).toString('hex');

        // Enregistrer le jeton dans la bd pour cet utilisateur
        await pool.query('UPDATE utilisateurs SET token = ? WHERE id = ?', [token, utilisateur.id]);

        // Renvoyer le jeton au client
        res.json({ success: true, token });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};