import { API_URL } from './config.js';

// ------------------- AUTHENTIFICATION (Admin) -------------------

// Connecte l'administrateur et retourne le token.
export async function connecterAdmin(identifiant, motDePasse) {
    const response = await fetch(`${API_URL}/connexion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({identifiant, motDePasse})
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error);
    }
    return data; // ex: {success: true, token: ...}
}

// Deconnecte l'admin en invalidant le token
export async function deconnecterAdmin(token) {
    const response = await fetch(`${API_URL}/deconnexion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error);
    }
    return data;
}


// ------------------- PARTIE ÉTUDIANT (Routes publiques) -------------------

// Recupere tous les cours
export async function getCours() {
    const response = await fetch(`${API_URL}/cours`);
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error);
    }
    return data;
}

// Recupere les travaux ouverts, coursId optionnel ( ex: 420-244-AH )
export async function getTravauxOuverts(coursId = '') {
    let url = `${API_URL}/travaux`;
    // si un id de cours est fourni en param
    if (coursId) {
        url += `?cours=${encodeURIComponent(coursId)}`; // encodeURIComponent encode la valeur pour éviter les bugs avec les caractères spéciaux.
    }
    const response = await fetch(url);
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error)
    }
    return data;
}

//Recupere un travail et ses creneaux
export async function getTravailId(id) {
    const response = await fetch(`${API_URL}/travaux/${id}`);
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error);
    }
    return data;
}

// Recupere disponibilités agrégées : pour chaque créneau, le nombre d’étudiants disponibles et leurs noms.
export async function getDisponibilites(id) {
    const response = await fetch(`${API_URL}/travaux/${id}/disponibilites`);
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error);
    }
    return data;
}

// Modifie la disponibilite de l'etudiant
export async function updateDisponibilites(idTravail, matricule, nom, creneaux) {
    const response = await fetch(`${API_URL}/travaux/${idTravail}/disponibilites/${matricule}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({nom, creneaux})
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error);
    }
    return data;
}


//------------------- PARTIE ADMIN (Routes prive) -------------------

// Recupere les travaux des cours de l'enseignant connecter
export async function getAdminTravaux(token) {
    const response = await fetch(`${API_URL}/admin/travaux`, {
        method: 'GET',
        headers: {'Authorization': `Bearer ${token}`}
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error);
    }
    return data;
}

// Modifer un travail
export async function updateTravail(token, idTravail, travailData) {
    const response = await fetch(`${API_URL}/travaux/${idTravail}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
        body: JSON.stringify(travailData)
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error);
    }
    return data;
}

// Ajouter un creneau au travail
export async function ajouterCreneau(token, idTravail, debut, fin) {
    const response = await fetch(`${API_URL}/travaux/${idTravail}/creneaux`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
        body: JSON.stringify({debut,fin})
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error);
    }
    return data;
}

// Modifier un creneau
export async function updateCreneau(token, idCreneau, debut, fin) {
    const response = await fetch(`${API_URL}/creneaux/${idCreneau}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
        body: JSON.stringify({debut,fin})
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error);
    }
    return data;
}

// Suppression d'un creneau
export async function deleteCreneau(token, idCreneau) {
    const response = await fetch(`${API_URL}/creneaux/${idCreneau}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`}
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error);
    }
    return data;
}