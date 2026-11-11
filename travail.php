<?php

session_start();

require 'init.php';

$travailChoisi = $_GET['id'] ?? '';

if (!empty($travailChoisi)) {
    $requeteTravail = $pdo->prepare(
        'SELECT 
         id AS travail_id,
         titre AS travail_titre, 
         description,
         type, 
         remise
         FROM travaux
         WHERE id = :idTravail'
         );
    $requeteTravail->execute(['idTravail' => $travailChoisi]);
    $travail = $requeteTravail->fetch(PDO::FETCH_ASSOC);

    if (!$travail) {
        header('Location: index.php');
        exit();
    }

    $requeteCreneau = $pdo->prepare(
        'SELECT
            c.id AS id_creneau,
            c.debut,
            c.fin,
            t.id AS travail_id,
            COUNT(d.id) AS nombre_eleve,
            GROUP_CONCAT(d.nom ORDER BY d.nom SEPARATOR ", ") AS liste_etudiant
        FROM creneaux c
        JOIN travaux t ON c.travail_id = t.id
        LEFT JOIN disponibilites d
            ON d.creneau_id = c.id
            AND d.travail_id = t.id
        WHERE t.id = :travail_id
        GROUP BY c.id, c.debut, c.fin, t.id
        '
    );
    $requeteCreneau->execute(['travail_id' => $travailChoisi]);
    $creneaux = $requeteCreneau->fetchAll(PDO::FETCH_ASSOC);

    $requeteDisponibilites = $pdo->prepare(
        'SELECT
         d.id AS id_disponiblite,
         d.matricule,
         d.nom,
         t.id AS id_travail,
         c.id AS id_creneau
         FROM disponibilites d
         JOIN travaux t ON d.travail_id = t.id
         JOIN creneaux c ON d.creneau_id = c.id
         WHERE t.id = :travail_id
        '
    );
    $requeteDisponibilites->execute(['travail_id' => $travailChoisi]);
    $disponibilites = $requeteDisponibilites->fetchAll(PDO::FETCH_ASSOC);

} else {
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

        <?php include 'header.php'?>
        
        <div class="travail-bloc">
            <h1><?=htmlspecialchars($travail['travail_titre']) ?></h1>
            <p class="travail-type"><?=htmlspecialchars($travail['type'])?></p>
            <p class="travail-description"><?=htmlspecialchars($travail['description'])?></p>
            <p class="travail-date"><?=htmlspecialchars($travail['remise'])?></p>
        </div>

        
        <div class="creneau-bloc">
            <h2>Creneaux</h2>

            <?php if (empty($creneaux)): ?>
                <p>Aucun creneaux pour ce travail.</p>
            <?php else: ?>
                <ul>
                    <?php

                    $maxNombre = max(array_column($creneaux, "nombre_eleve"));

                    $creneauxMaxEleve = array_filter($creneaux, function($creneau) use($maxNombre) {
                        return $creneau['nombre_eleve'] == $maxNombre;
                    })
                    
                    ?>
                    <?php foreach ($creneaux as $creneau): ?>
                        <?php $etudiant = $creneau['nombre_eleve'] <=1  ? "étudiant" : "étudiants"?>
                        <?php if ($creneau["nombre_eleve"] == $maxNombre): ?>
                            <li>
                                <p class="creneau-max">Du <?=htmlspecialchars($creneau['debut'])?>  au  <?=htmlspecialchars($creneau['fin'])?>  (<?= htmlspecialchars($creneau['nombre_eleve'])?> <?= $etudiant?>)</p>
                            </li>
                        <?php else: ?>

                            <li>
                                <p class="creneau-normal">Du <?=htmlspecialchars($creneau['debut'])?>  au  <?=htmlspecialchars($creneau['fin'])?>  (<?= htmlspecialchars($creneau['nombre_eleve'])?> <?= $etudiant?>)</p>
                            </li>
                        <?php endif; ?>
                        <small class="liste-etudiant"><?=htmlspecialchars($creneau['liste_etudiant']) ?></small>
                    <?php endforeach; ?>
                </ul>
            <?php endif; ?>
        </div>
        
        
            
        <?php

            $matricule = "";
            $nom = "";
            $creneauxCheckboxes = [];
            $erreurs = [];
            $soumis = $_SERVER["REQUEST_METHOD"] === "POST";

            $sessionNom = $_SESSION['nom'] ?? "";
            $sessionMatricule = $_SESSION['matricule'] ?? "";

            if($soumis){
                
                $matricule = trim($_POST["matricule"] ?? "");
                $nom = trim($_POST["nom"] ?? "");
                $creneauxCheckboxes = $_POST["creneauxCheckboxes"] ?? [];
                
                if (!is_array($creneauxCheckboxes)) { //Assure que creneauxCheckboxes est toujours un array
                    $creneauxCheckboxes = [$creneauxCheckboxes];
                }

                if ($nom === "") {
                    $erreurs["nom"] = "Le nom est obligatoire.";
                }
                
                if (!(ctype_digit($matricule) && strlen($matricule) > 0 && strlen($matricule) <= 20)) {
                    $erreurs["matricule"] = "Le matricule doit etre un numero 20 characters max.";
                }

                if (empty($creneauxCheckboxes)) {
                    $erreurs["creneauxCheckboxes"] = "Veuillez selectionner au moins un creneau";
                } 
                else { // vérifier que chaque identifiant de créneau reçu existe et appartient bien au travail courant
                    $validIds = array_column($creneaux, 'id_creneau');
                    foreach ($creneauxCheckboxes as $idCreneau) {
                        if (!in_array($idCreneau, $validIds)) {
                            $erreurs["creneauxCheckboxes"] = "Créneau invalide sélectionné.";
                            break;
                        }
                    }
                }

                if(empty($erreurs)) {
                    
                    
                    if (count($creneauxCheckboxes) > 1) {
                        $_SESSION['success_message'] = "Vos créneaux ont bien été enregistrées!";
                    } else {
                        $_SESSION['success_message'] = "Votre créneau a bien été enregistrée!";
                    }
                    
                    $_SESSION['nom'] = $nom;
                    $_SESSION['matricule'] = $matricule;





                    //remplacer les anciennes disponibilités associées à ce matricule pour ce travail par les nouvelles ;
                    $deletionDispo = $pdo->prepare(
                        'DELETE FROM disponibilites
                        WHERE matricule = :matricule
                        AND travail_id = :travail_id
                        '
                    );

                    $deletionDispo->execute([
                        'matricule' => $matricule,
                        'travail_id' => $travailChoisi
                    ]);

                    $insertionDispo = $pdo->prepare(
                        'INSERT INTO disponibilites (matricule, nom, travail_id, creneau_id)
                        VALUES (:matricule, :nom, :travail_id, :creneau_id)
                        '
                    );

                    foreach ($creneauxCheckboxes as $creneau) {
                        $insertionDispo->execute([
                            'matricule' => $matricule,
                            'nom' => $nom,
                            'travail_id' => $travailChoisi,
                            'creneau_id' => $creneau
                        ]);
                    }



                    header("Location: travail.php", true, 303);
                    exit;
                }
                
            }
        
        
        ?>
        <?php if (isset($_SESSION['success_message'])): ?>
            <script>
                Swal.mixin({
                    toast: true,
                    position: "top-end",
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                    showClass: {
                        popup: ''
                    },
                    hideClass: {
                        popup: ''
                    },
                    didOpen: (toast) => {
                        toast.onmouseenter = Swal.stopTimer;
                        toast.onmouseleave = Swal.resumeTimer;
                    }
                }).fire({
                    icon: "success",
                    title: <?= json_encode($_SESSION['success_message']) ?>
                });
            </script>
            <?php 
                // Clear the message so it disappears on the next reload/submission attempt
                unset($_SESSION['success_message']); 
            ?>
        <?php endif; ?>

        <form action="" method="POST">

            <div class="form-group">
                <label for="nom">Nom :</label><br>
                <input type="text" name="nom" id="nom" value="<?= htmlspecialchars($sessionNom); ?>">
                <?php if (isset($erreurs["nom"])): ?>
                    <span class="error"><?= $erreurs["nom"]; ?></span>
                <?php endif; ?>
            </div>

            <div class="form-group">
                <label for="matricule">Matricule: </label><br>
                <input type="text" name="matricule" id="matricule" value="<?= htmlspecialchars($sessionMatricule); ?>" >
                <?php if (isset($erreurs["matricule"])): ?>
                    <span class="error"><?= $erreurs["matricule"]; ?></span>
                <?php endif; ?>
            </div>

            <div class="form-group">
                <label>Créneaux disponibles :</label><br>
                    
                <?php foreach ($creneaux as $creneau): ?>

                    <?php
                        $id = $creneau['id_creneau'];
                        $isChecked = in_array($id, $creneauxCheckboxes) ? 'checked' : '';
                    ?>
                    
                    <label >
                        <input type="checkbox" name="creneauxCheckboxes[]" value="<?= $id; ?>" <?= $isChecked; ?>>
                        De <?=htmlspecialchars($creneau['debut'])?> à <?=htmlspecialchars($creneau['fin'])?>
                    </label><br>
                <?php endforeach; ?>

                <?php if (isset($erreurs["creneauxCheckboxes"])): ?>
                    <span class="error"><?= $erreurs["creneauxCheckboxes"]; ?></span>
                <?php endif; ?>
            </div>

            <button type="submit">Envoyer</button>
                    

        </form>
        

        

        <?php include 'footer.php'?>
    </body>

</html>