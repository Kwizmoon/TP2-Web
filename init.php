<?php

$host = 'localhost';
$username = 'root';
$password = '';
$dbname = 'DexBD';

try {
    $pdo = new PDO("mysql:host=localhost;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Creation de la base de donnee si elle n'existe pas deja
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `$dbname` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
    $pdo->exec("USE `$dbname`;");

    // Creation des tables si ils n'existent pas deja
    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS cours (
            id VARCHAR(30) PRIMARY KEY,
            titre VARCHAR(100) NOT NULL
        );
        
        CREATE TABLE IF NOT EXISTS travaux (
            id VARCHAR(30) PRIMARY KEY,
            cours_id VARCHAR(30) NOT NULL,
            FOREIGN KEY(cours_id) REFERENCES cours(id),
            titre VARCHAR(150) NOT NULL,
            description TEXT NOT NULL,
            type VARCHAR(20) NOT NULL,
            disponible DATE NOT NULL,
            remise DATETIME NOT NULL,
            ouvert BOOLEAN NOT NULL
        );

        CREATE TABLE IF NOT EXISTS creneaux (
            id VARCHAR(30) PRIMARY KEY,
            travail_id VARCHAR(30) NOT NULL,
            FOREIGN KEY(travail_id) REFERENCES travaux(id) ON DELETE CASCADE,
            debut DATETIME NOT NULL,
            fin DATETIME NOT NULL 
        ) ENGINE=InnoDB;

        CREATE TABLE IF NOT EXISTS disponibilites(
            id INT AUTO_INCREMENT PRIMARY KEY,
            travail_id VARCHAR(30) NOT NULL,
            creneau_id VARCHAR(30) NOT NULL,
            FOREIGN KEY(travail_id) REFERENCES travaux(id) ON DELETE CASCADE,
            FOREIGN KEY(creneau_id) REFERENCES creneaux(id) ON DELETE CASCADE,
            matricule VARCHAR(20) NOT NULL,
            nom VARCHAR(100) NOT NULL,
            CONSTRAINT combo UNIQUE (travail_id, creneau_id, matricule)
        ) ENGINE=InnoDB;       
        "
    );

    // Donnees initial

    $initialCours = [
        ['id' => '420-244-AH', 'titre' => 'Bases de données applicatives'],
        ['id' => '420-245-AH', 'titre' => 'Programmation Web 1'],
        ['id' => '420-248-AH', 'titre' => 'Programmation Web 2'],
        ['id' => '420-253-AH', 'titre' => 'Projet de fin d’études']
    ];

    $initialTravaux = [
        [
        'id'          => 'web1-tp1',
        'cours'       => '420-245-AH', 
        'titre'       => 'TP1 — Catalogue de produits', 
        'description' => 'Construire une première application PHP permettant d’afficher et de filtrer un catalogue.', 
        'type'        => 'individuel', 
        'disponible'  => '2026-09-01', 
        'remise'      => '2026-09-20 23:59', 
        'ouvert'      => false
    ],
    [
        'id'          => 'web2-tp1',
        'cours'       => '420-248-AH', 
        'titre'       => 'TP1 — Gestion de réservations', 
        'description' => 'Développer une application Web transactionnelle permettant d’enregistrer et de consulter des réservations.', 
        'type'        => 'equipe', 
        'disponible'  => '2026-09-21', 
        'remise'      => '2026-10-18 23:59', 
        'ouvert'      => true
    ],
    [
        'id'          => 'bdd-lab2',
        'cours'       => '420-244-AH', 
        'titre'       => 'Laboratoire 2 — Requêtes SQL', 
        'description' => 'Écrire et tester des requêtes SQL sur une base de données relationnelle fournie.', 
        'type'        => 'individuel', 
        'disponible'  => '2026-09-28', 
        'remise'      => '2026-10-12 23:59', 
        'ouvert'      => true
    ],
    [
        'id'          => 'bdd-tp1',
        'cours'       => '420-244-AH', 
        'titre'       => 'TP1 — Modélisation d’une bibliothèque', 
        'description' => 'Concevoir un modèle relationnel et produire le script SQL permettant de créer la base de données.', 
        'type'        => 'equipe', 
        'disponible'  => '2026-10-05', 
        'remise'      => '2026-10-25 23:59', 
        'ouvert'      => true
    ],
    [
        'id'          => 'pfe-prototype',
        'cours'       => '420-253-AH', 
        'titre'       => 'Prototype fonctionnel', 
        'description' => 'Produire une première version fonctionnelle du projet et préparer une démonstration à l’équipe enseignante.', 
        'type'        => 'equipe', 
        'disponible'  => '2026-09-15', 
        'remise'      => '2026-10-09 23:59', 
        'ouvert'      => true
    ]
    ];

    
    $initialCreneaux = [
    [
        'travail_id' => 'web1-tp1',
        'id' => 'web1-tp1-01',
        'debut'      => '2026-09-15 18:00',
        'fin'        => '2026-09-15 19:30'
    ],
    [
        'travail_id' => 'web1-tp1',
        'id' => 'web1-tp1-02',
        'debut'      => '2026-09-16 12:00',
        'fin'        => '2026-09-16 13:30'
    ],
    [
        'travail_id' => 'web1-tp1',
        'id' => 'web1-tp1-03',
        'debut'      => '2026-09-17 17:00',
        'fin'        => '2026-09-17 18:30'
    ],
    [
        'travail_id' => 'web2-tp1',
        'id' => 'web2-tp1-01',
        'debut'      => '2026-10-05 18:00',
        'fin'        => '2026-10-05 19:30'
    ],
    [
        'travail_id' => 'web2-tp1',
        'id' => 'web2-tp1-02',
        'debut'      => '2026-10-06 12:00',
        'fin'        => '2026-10-06 13:30'
    ],
    [
        'travail_id' => 'web2-tp1',
        'id' => 'web2-tp1-03',
        'debut'      => '2026-10-07 17:00',
        'fin'        => '2026-10-07 18:30'
    ],
    [
        'travail_id' => 'bdd-lab2',
        'id' => 'bdd-lab2-01',
        'debut'      => '2026-10-01 16:00',
        'fin'        => '2026-10-01 17:30'
    ],
    [
        'travail_id' => 'bdd-lab2',
        'id' => 'bdd-lab2-02',
        'debut'      => '2026-10-02 12:00',
        'fin'        => '2026-10-02 13:30'
    ],
    [
        'travail_id' => 'bdd-lab2',
        'id' => 'bdd-lab2-03',
        'debut'      => '2026-10-04 10:00',
        'fin'        => '2026-10-04 11:30'
    ],
    [
        'travail_id' => 'bdd-tp1',
        'id' => 'bdd-tp1-01',
        'debut'      => '2026-10-13 18:00',
        'fin'        => '2026-10-13 19:30'
    ],
    [
        'travail_id' => 'bdd-tp1',
        'id' => 'bdd-tp1-02',
        'debut'      => '2026-10-14 12:00',
        'fin'        => '2026-10-14 13:30'
    ],
    [
        'travail_id' => 'bdd-tp1',
        'id' => 'bdd-tp1-03',
        'debut'      => '2026-10-15 17:00',
        'fin'        => '2026-10-15 18:30'
    ],
    [
        'travail_id' => 'pfe-prototype',
        'id' => 'int-s1-01',
        'debut'      => '2026-09-29 18:00',
        'fin'        => '2026-09-29 20:00'
    ],
    [
        'travail_id' => 'pfe-prototype',
        'id' => 'int-s1-02',
        'debut'      => '2026-09-30 17:00',
        'fin'        => '2026-09-30 19:00'
    ],
    [
        'travail_id' => 'pfe-prototype',
        'id' => 'int-s1-03',
        'debut'      => '2026-10-01 18:00',
        'fin'        => '2026-10-01 20:00'
    ]
    ];

    //Insertion Cours
    $insertionCours = $pdo->prepare(
        "INSERT IGNORE INTO cours (id, titre)
        VALUES ( :id, :titre );
    ");
    foreach ($initialCours as $cours){
        $insertionCours->execute($cours);
    }

    //Insertion travaux
    $insertionTravaux = $pdo->prepare(
        "INSERT IGNORE INTO travaux (id, cours_id, titre, description, type, disponible, remise, ouvert)
        VALUES ( :id, :cours, :titre, :description, :type, :disponible, :remise, :ouvert )"
    );
    foreach ($initialTravaux as $travail){
        $insertionTravaux->execute($travail);
    }

    //Insertion creneaux
    $insertionCreneaux = $pdo->prepare(
        "INSERT IGNORE INTO creneaux (id, travail_id, debut, fin)
        VALUES ( :id, :travail_id, :debut, :fin )"
    );
    foreach ($initialCreneaux as $creneau){
        $insertionCreneaux->execute($creneau);
    }

//    echo "<h3 style='color: green;'>Success! Database, tables, and simulated data initialized successfully.</h3>";

    

    



} catch (PDOException $e) {
    exit('Connexion impossible : ' . $e->getMessage());
}


?>