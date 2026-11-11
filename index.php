<?php

session_start();
require_once 'init.php';


$requeteCours = $pdo->prepare('SELECT id, titre FROM cours ORDER BY titre ASC');
$requeteCours->execute();
$listCours = $requeteCours->fetchAll(PDO::FETCH_ASSOC);

/*foreach ($cours as $c) {
    echo htmlspecialchars($c['titre']) . ' : ';
}
*/

//Recupere le filtre choisi dans l'URL
$coursFiltrer = $_GET['cours'] ?? '';

if (!empty($coursFiltrer)) {
    $requeteTravail = $pdo->prepare(
        'SELECT 
         t.id AS travail_id,
         t.titre AS travail_titre, 
         t.type, 
         t.remise, 
         c.id AS cours_id,
         c.titre AS cours_titre
         FROM travaux t
         JOIN cours c ON t.cours_id = c.id
         WHERE t.ouvert = 1 AND c.id = :cours_id
         ORDER BY c.titre ASC, t.remise ASC'
         );
    
    $requeteTravail->execute(['cours_id' => $coursFiltrer]);
} else {
    $requeteTravail = $pdo->prepare(
        'SELECT 
         t.id AS travail_id,
         t.titre AS travail_titre, 
         t.type, 
         t.remise, 
         c.id AS cours_id,
         c.titre AS cours_titre
         FROM travaux t
         JOIN cours c ON t.cours_id = c.id
         WHERE t.ouvert = :open
         ORDER BY c.titre ASC, t.remise ASC'
         );
    $requeteTravail->execute(['open' => 1]);
}

$travaux = $requeteTravail->fetchAll(PDO::FETCH_ASSOC);

// Travaux par cours

$travailParCours = [];
foreach ($travaux as $travail) {
    $travailParCours[$travail['cours_titre']][] = $travail;   
}
/*
foreach ($travailParCours as $coursNom => $listTravail) {
    echo htmlspecialchars($coursNom) . ' : ';
    foreach ($listTravail as $travail){
        echo htmlspecialchars($travail['travail_titre']);
    }
}
*/

?>

<!DOCTYPE html>
<html lang="fr">
    <head>
        <meta charset="UTF-8">
        <title>Liste des travaux</title>
        <link rel="stylesheet" href="style.css">
    </head>
    <body>

        <?php include 'header.php'?>
        
        <h1>Travaux</h1>

        <form method="GET" action="index.php">
            <label for="cours">Filtrer par cours : </label>
            <select name="cours" id="cours" onchange="this.form.submit()">
                <option value="">-- Tous les cours --</option>
                <?php foreach ($listCours as $cours): ?>
                    <option value="<?= htmlspecialchars($cours['id']) ?>" 
                        <?= ($coursFiltrer == $cours['id']) ? 'selected' : '' ?>>
                        <?= htmlspecialchars($cours['titre']) ?>
                    </option>
                <?php endforeach; ?>
            </select>
            
        </form>

        <hr>
        <main>
            <?php if (empty($travailParCours)): ?>
                <p>Aucun cours trouvé.</p>
            <?php else: ?>
            <?php foreach ($travailParCours as $nomCours => $listeTravail): ?>
                <div class="cours-bloc">
                    <h2><?= htmlspecialchars($nomCours) ?></h2>

                    <?php foreach ($listeTravail as $travail): ?>
                        <a href="travail.php?id=<?= htmlspecialchars($travail['travail_id'])?>" class="card-link">
                            <div class="travail-card">
                                <h3 class="card-titre"><?= htmlspecialchars($travail['travail_titre']) ?></h3>
                                <p class="card-type"><?= htmlspecialchars($travail['type']) ?></p>
                                <p class="card-date">Remise : <?= htmlspecialchars($travail['remise']) ?></p>
                                <a href=""></a>
                            </div>
                        </a>
                    <?php endforeach; ?>
                </div>
            <?php endforeach; ?>
            <?php endif; ?>
 
        </main>

        <?php include 'footer.php'?>
        



    </body>
</html>