<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Administration - Dex</title>
    <link rel="stylesheet" href="style.css">
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
</head>
<body>

    <header class="site-header">
        <a href="index.php" class="logo">Dex</a>
        <a href="admin.php" class="btn-connexion">connexion</a>
    </header>

    <main id="app" class="admin-main">
        <!-- VUE 1 : Formulaire de connexion -->
        <section v-if="vue === 'login'">
            <h1>Connexion administrateur</h1>

            <form @submit.prevent="seConnecter" novalidate>
                <div>
                    <label for="identifiant">Identifiant</label>
                    <input
                        type="text"
                        id="identifiant"
                        name="identifiant"
                        v-model.trim="identifiant"
                        :class="{ 'input-erreur': erreursLogin.identifiant }"
                        autocomplete="username"
                        required
                    >
                    <span v-if="erreursLogin.identifiant" class="erreur">{{ erreursLogin.identifiant }}</span>
                </div>

                <div>
                    <label for="motDePasse">Mot de passe</label>
                    <input
                        type="password"
                        id="motDePasse"
                        name="motDePasse"
                        v-model="motDePasse"
                        :class="{ 'input-erreur': erreursLogin.motDePasse }"
                        autocomplete="current-password"
                        required
                    >
                    <span v-if="erreursLogin.motDePasse" class="erreur">{{ erreursLogin.motDePasse }}</span>
                </div>

                <p v-if="erreursLogin.global" class="erreur">{{ erreursLogin.global }}</p>

                <button type="submit" :disabled="chargement">
                    {{ chargement ? 'Connexion...' : 'Se connecter' }}
                </button>
            </form>
        </section>

        <!-- VUE 2 : Liste des travaux de l'administrateur -->
        <section v-else-if="vue === 'liste'">
            <div class="toolbar">
                <h1>Mes travaux</h1>
                <div class="toolbar-actions">
                    <button type="button" class="btn" @click="chargerTravaux" :disabled="chargement">
                        Actualiser
                    </button>
                    <button type="button" class="btn-supprimer" @click="seDeconnecter" :disabled="enCoursAction">
                        Déconnexion
                    </button>
                </div>
            </div>

            <p v-if="chargement">Chargement des travaux...</p>
            <p v-else-if="erreurGlobale" class="erreur">{{ erreurGlobale }}</p>
            <p v-else-if="travaux.length === 0">Aucun travail trouvé pour vos cours.</p>

            <ul v-else class="liste-travaux">
                <li
                    v-for="item in travaux"
                    :key="getTravailId(item)"
                    class="travail-item"
                    @click="ouvrirTravail(item)"
                >
                    <div>
                        <strong>{{ item.titre || item.travail_titre }}</strong>
                        <p class="travail-meta">
                            Type : {{ item.type || '—' }}
                            <span v-if="item.remise"> · Remise : {{ formaterDateInput(item.remise) }}</span>
                        </p>
                    </div>
                    <span class="btn">Ouvrir</span>
                </li>
            </ul>
        </section>

        <!-- VUE 3 : Détails, modification du travail et gestion des créneaux -->
        <section v-else-if="vue === 'detail'">
            <div class="toolbar">
                <button type="button" class="btn" @click="retourListe">
                    ← Retour aux travaux
                </button>
                <button type="button" class="btn-supprimer" @click="seDeconnecter" :disabled="enCoursAction">
                    Déconnexion
                </button>
            </div>

            <p v-if="chargement">Chargement du travail...</p>
            <p v-else-if="erreurGlobale" class="erreur">{{ erreurGlobale }}</p>

            <template v-else-if="travailCourant">
                <h1>{{ travailCourant.titre || travailCourant.travail_titre }}</h1>

                <!-- Modification des informations du travail -->
                <form @submit.prevent="enregistrerTravail" class="bloc-section" novalidate>
                    <h2>Informations du travail</h2>

                    <div>
                        <label for="titreTravail">Titre</label>
                        <input
                            type="text"
                            id="titreTravail"
                            v-model.trim="formTravail.titre"
                            maxlength="150"
                            required
                        >
                    </div>

                    <div>
                        <label for="typeTravail">Type</label>
                        <select id="typeTravail" v-model="formTravail.type" required>
                            <option value="individuel">individuel</option>
                            <option value="equipe">equipe</option>
                        </select>
                    </div>

                    <div>
                        <label for="descriptionTravail">Description</label>
                        <textarea
                            id="descriptionTravail"
                            class="input-description"
                            v-model="formTravail.description"
                            required
                        ></textarea>
                    </div>

                    <div>
                        <label for="ouvertTravail">
                            <input
                                type="checkbox"
                                id="ouvertTravail"
                                v-model="formTravail.ouvert"
                            >
                            Ouvert
                        </label>
                    </div>

                    <div>
                        <label for="remiseTravail">Date de remise</label>
                        <input
                            type="datetime-local"
                            id="remiseTravail"
                            v-model="formTravail.remise"
                        >
                    </div>

                    <button type="submit" :disabled="enCoursAction">
                        {{ enCoursAction ? 'Enregistrement...' : 'Enregistrer les modifications' }}
                    </button>
                </form>

                <!-- Gestion des créneaux -->
                <div class="bloc-section">
                    <h2>Créneaux</h2>

                    <!-- Ajouter un créneau -->
                    <form @submit.prevent="ajouterNouveauCreneau" class="ajout-creneau-form" novalidate>
                        <h3>Ajouter un créneau</h3>

                        <div>
                            <label for="nouveauDebut">Début</label>
                            <input
                                type="datetime-local"
                                id="nouveauDebut"
                                v-model="nouveauCreneau.debut"
                                required
                            >
                        </div>

                        <div>
                            <label for="nouvelleFin">Fin</label>
                            <input
                                type="datetime-local"
                                id="nouvelleFin"
                                v-model="nouveauCreneau.fin"
                                required
                            >
                        </div>

                        <button type="submit" class="btn" :disabled="enCoursAction">
                            Ajouter le créneau
                        </button>
                    </form>

                    <!-- Liste des créneaux existants -->
                    <p v-if="creneaux.length === 0">Aucun créneau pour ce travail.</p>

                    <div
                        v-for="creneau in creneaux"
                        :key="getCreneauId(creneau)"
                        class="creneau-carte"
                    >
                        <div>
                            <label>Début</label>
                            <input
                                type="datetime-local"
                                v-model="creneau.debutEdit"
                            >
                        </div>

                        <div>
                            <label>Fin</label>
                            <input
                                type="datetime-local"
                                v-model="creneau.finEdit"
                            >
                        </div>

                        <p class="creneau-reponses">
                            Réponses : <strong>{{ compterReponses(creneau) }}</strong>
                        </p>

                        <div class="creneau-actions">
                            <button
                                type="button"
                                class="btn"
                                :disabled="enCoursAction"
                                @click="modifierHeuresCreneau(creneau)"
                            >
                                Modifier les heures
                            </button>
                            <button
                                type="button"
                                class="btn-supprimer"
                                :disabled="enCoursAction"
                                @click="confirmerEtSupprimerCreneau(creneau)"
                            >
                                Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            </template>
        </section>
    </main>

    <script type="module" src="js/admin.js"></script>
</body>
</html>