const pool = require('../config/database');

// GET /api/travaux ouverts(filtre optionnel ?cours=<id>)
const getTravauxOuverts = async (req, res) => {
    try {
    
        const { cours } = req.query; // recuperer le parametre cours si il est dans le URL (?cours=<id>)
        let query = 'SELECT * FROM travaux WHERE ouvert = true';
        let params = [];

        // si le param cours existe, on filtre par cours et le param va dans le tableau params
        if (cours) {
            query += ' AND cours_id = ?';
            params.push(cours);
        }

        // execute la requete de facon que le param cours suit le query(remplace le ?), plus securitaire et evite les injections SQL
        const [rows] = await pool.query(query, params);
        res.json(rows)
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

// GET /api/travaux/:id (travail et ses créneaux)
const getTravailId = async (req, res) => {
    try {
        const { id } = req.params;
        const [travail] = await pool.query('SELECT w FROM travaux WHERE id = ?', [id]);

        if (travail.length === 0) {
            return res.status(404).json({ error: "Travail introuvable" });
        }

        const [creneaux] = await pool.query('SELECT * FROM creneaux WHERE travail_id = ?', [id]);

        res.json({ ...travail[0], creneaux }); // deballe toutes les proprietes de tavail[0]

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};


// GET /api/travaux/:id/disponibilites (disponibilités agrégées)
const getDisponibilites = async (req, res) => {
    try {
        const { id } = req.params;
        // Requête pour regrouper les étudiants par créneau
        const [rows] = await pool.query(`
            SELECT c.id AS creneau_id, c.date, c.heure, 
            COUNT(d.matricule) AS nb_etudiants, 
            JSON_ARRAYAGG(JSON_OBJECT('matricule', d.matricule, 'nom', d.nom)) AS etudiants
            FROM creneaux c
            LEFT JOIN disponibilites d ON c.id = d.creneau_id
            WHERE c.travail_id = ?
            GROUP BY c.id
        `, [id]);

        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};


// PUT /api/travaux/:id/disponibilites/:matricule
const updateDisponibilites = async (req, res) => {

    const { id, matricule } = req.params;
    const { nom, creneaux } = req.body;

    // On récupère une connexion dédiée pour gérer la transaction
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Supprimer les anciennes disponibilités de l'étudiant pour ce travail
        await connection.query(`
            DELETE d FROM disponibilites d
            JOIN creneaux c ON d.creneau_id = c.id
            WHERE c.travail_id = ? AND d.matricule = ?
        `, [id, matricule]);

        // Insérer les nouvelles disponibilités si le tableau n'est pas vide
        if (creneaux && creneaux.length > 0) {
            for (const creneauId of creneaux) {
                await connection.query(`
                    INSERT INTO disponibilites (creneau_id, matricule, nom) 
                    VALUES (?, ?, ?)
                `, [creneauId, matricule, nom]);
            }
        }

        // Valider la transaction
        await connection.commit();
        connection.release();

        res.json({ success: true, message: "Disponibilités mises à jour" });
    } catch (error) {
        // En cas d'erreur, on annule tout
        await connection.rollback();
        connection.release();
        
        console.error(error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

module.exports = {
    getTravaux,
    getTravailById,
    getDisponibilites,
    updateDisponibilites
};