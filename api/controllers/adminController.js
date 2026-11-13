const pool = require('../config/database');

// Les travaux, ouverts et fermés, des cours de l’enseignant connecté, avec le titre de leur cours.
const getAdminTravaux = async (req, res) => {
    try {
        // Id de l'enseignant connecter vient du middleware verifierToken, stocker dans req
        const enseignantId = req.utilisateur.id;
        
        const [travaux] = await pool.query(`
            SELECT t.*, c.titre AS titre_cours 
            FROM travaux t
            JOIN cours c ON t.cours_id = c.id
            WHERE c.enseignant_id = ?
            `, [enseignantId]);
        
        res.json(travaux);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};


// Modifie un travail. Le cours d’un travail ne peut pas être changé.
const updateTravail = async (req, res) => {
    try {
        const {id} = req.params;
        const { titre, description, type, disponible, remise, ouvert } = req.body;
        const enseignantId = req.utilisateur.id;

        // Verifier que le travail existe et il appartient a un cours de l'enseignant
        const [travaux] = await pool.query(`
            SELECT t.* FROM travaux t
            JOIN cours c ON t.cours_id = c.id
            WHERE t.id = ? AND c.enseignant_id = ?
        `, [id, enseignantId]);

        if (travaux.length === 0) {
            return res.status(404).json({error: "Travail invalide"})
        }

        // Règles de validation des données d'administration

        // titre et description sont des chaînes de caractères non vides (le titre fait au plus 150 caractères)
        if (!titre || typeof titre !== 'string' || titre.trim() === '' || titre.length > 150) {
            return res.status(400).json({ error: "Titre invalide (max 150 caractères, non vide)." });
        }
        if (!description || typeof description !== 'string' || description.trim() === '') {
            return res.status(400).json({ error: "Description invalide." });
        }
        // type est limité aux valeurs suivantes : individuel et equipe
        if (!['individuel', 'equipe'].includes(type)) {
            return res.status(400).json({ error: "Le type doit être 'individuel' ou 'equipe'." });
        }
        // ouvert est un booléen
        if (typeof ouvert !== 'boolean') {
            return res.status(400).json({ error: "Le champ 'ouvert' doit être un booléen." });
        }

        const dateDispo = new Date(disponible);
        const dateRemise = new Date(remise);

        // disponible est une date valide, remise une date et heure valide, et remise est postérieure à disponible
        if (isNaN(dateDispo.getTime()) || isNaN(dateRemise.getTime()) || dateRemise <= dateDispo) {
            return res.status(400).json({ error: "Dates invalides ou 'remise' antérieure/égale à 'disponible'." });
        }

        // Mise à jour (le cours_id n'est pas modifié)
        await pool.query(`
            UPDATE travaux 
            SET titre = ?, description = ?, type = ?, disponible = ?, remise = ?, ouvert = ?
            WHERE id = ?
        `, [titre, description, type, disponible, remise, ouvert, id]);

        res.json({ success: true, message: "Travail mis à jour avec succès" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};


module.exports = { getAdminTravaux, updateTravail };