<?php
// On récupère le filtre de cours initial depuis l'URL (si présent)
$coursInitial = $_GET['cours'] ?? '';
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Liste des travaux</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>

    <?php include 'header.php'; ?>

    <main id="app">
        <h1>Travaux</h1>

        <!-- Formulaire de filtrage par cours -->
        <form @submit.prevent>
            <label for="cours">Filtrer par cours : </label>
            <select name="cours" id="cours" v-model="coursSelectionne" @change="chargerTravaux">
                <option value="">-- Tous les cours --</option>
                <option v-for="c in listCours" :key="c.id" :value="c.id">
                    {{ c.titre }}
                </option>
            </select>
        </form>

        <hr>

        <!-- Messages de chargement ou d'erreur -->
        <div v-if="loading">Chargement des travaux...</div>
        <div v-if="error" class="error">{{ error }}</div>

        <!-- Affichage des travaux -->
        <div v-if="!loading">
            <p v-if="Object.keys(travailParCours).length === 0">Aucun travail ouvert trouvé.</p>

            <!-- Boucle sur chaque cours -->
            <div v-for="(listeTravail, nomCours) in travailParCours" :key="nomCours" class="cours-bloc">
                <h2>{{ nomCours }}</h2>

                <!-- Boucle sur les travaux de ce cours -->
                <div v-for="travail in listeTravail" :key="travail.id" class="travail-card">
                    <a :href="'travail.php?id=' + travail.id" class="card-link">
                        <h3 class="card-titre">{{ travail.titre }}</h3>
                        <p class="card-type">{{ travail.type }}</p>
                        <p class="card-date">Remise : {{ formaterDate(travail.remise) }}</p>
                    </a>
                </div>
            </div>
        </div>
    </main>

    <?php include 'footer.php'; ?>

    <!-- Injection propre de la variable PHP vers le JS -->
    <script>
        window.COURS_INITIAL = "<?= htmlspecialchars($coursInitial) ?>";
    </script>

    
    <script type="module" src="js/index.js"></script>
</body>
</html>