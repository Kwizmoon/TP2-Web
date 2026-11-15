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
