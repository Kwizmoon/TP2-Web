<?php
$travailId = trim($_GET['id'] ?? '');

if ($travailId === '') {
    header('Location: index.php');
    exit();
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Travail</title>
    <link rel="stylesheet" href="style.css">
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
</head>
<body>

    <?php include 'header.php'; ?>

    <main id="app">
        <div v-if="loading">Chargement du travail...</div>
        <div v-if="error" class="error">{{ error }}</div>

        <template v-if="!loading && travail">
            <!-- Informations du travail -->
            <section class="travail-bloc">
                <h1>{{ travail.titre || travail.travail_titre }}</h1>
                <p class="travail-type">{{ travail.type }}</p>
                <p class="travail-description">{{ travail.description }}</p>
                <p class="travail-date">Remise : {{ formaterDate(travail.remise) }}</p>
            </section>

            <!-- Liste des créneaux -->
            <section class="creneau-bloc">
                <h2>Créneaux</h2>

                <p v-if="creneaux.length === 0">Aucun créneau pour ce travail.</p>

                <ul v-else>
                    <li v-for="creneau in creneaux" :key="creneau.id || creneau.id_creneau">
                        <p :class="(Number(creneau.nombre_eleve) || 0) === maxEleves && maxEleves > 0 ? 'creneau-max' : 'creneau-normal'">
                            Du {{ formaterDate(creneau.debut) }} au {{ formaterDate(creneau.fin) }}
                            ({{ Number(creneau.nombre_eleve) || 0 }} {{ (Number(creneau.nombre_eleve) || 0) <= 1 ? 'étudiant' : 'étudiants' }})
                        </p>
                        <small v-if="creneau.liste_etudiant" class="liste-etudiant">
                            {{ creneau.liste_etudiant }}
                        </small>
                    </li>
                </ul>
            </section>

            <!-- Formulaire de disponibilités -->
            <section class="formulaire-bloc">
                <h2>Indiquer mes disponibilités</h2>

                <form @submit.prevent="soumettreDisponibilites" novalidate>
                    <div class="form-group">
                        <label for="nom">Nom :</label><br>
                        <input type="text" id="nom" name="nom" v-model.trim="nom">
                        <span v-if="erreurs.nom" class="error">{{ erreurs.nom }}</span>
                    </div>

                    <div class="form-group">
                        <label for="matricule">Matricule :</label><br>
                        <input
                            type="text"
                            id="matricule"
                            name="matricule"
                            v-model.trim="matricule"
                            @change="chargerDisponibilitesEtudiant"
                        >
                        <span v-if="erreurs.matricule" class="error">{{ erreurs.matricule }}</span>
                    </div>

                    <div class="form-group">
                        <label>Créneaux disponibles :</label><br>

                        <div v-if="creneaux.length === 0">Aucun créneau disponible.</div>

                        <label v-for="creneau in creneaux" :key="creneau.id || creneau.id_creneau">
                            <input
                                type="checkbox"
                                :value="creneau.id || creneau.id_creneau"
                                v-model="creneauxSelectionnes"
                            >
                            De {{ formaterDate(creneau.debut) }} à {{ formaterDate(creneau.fin) }}
                        </label><br>

                        <span v-if="erreurs.creneaux" class="error">{{ erreurs.creneaux }}</span>
                    </div>

                    <button type="submit" :disabled="enCoursEnvoi">
                        {{ enCoursEnvoi ? 'Envoi...' : 'Envoyer' }}
                    </button>
                </form>
            </section>
        </template>
    </main>

    <?php include 'footer.php'; ?>

    <script>
        window.TRAVAIL_ID = <?= json_encode($travailId) ?>;
    </script>

    <script type="module" src="js/travail.js"></script>
</body>
</html>