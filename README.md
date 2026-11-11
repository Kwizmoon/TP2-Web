# Dex

## Mise en place

1. Démarrer **MySQL** et **Apache** avec XAMPP.
2. Placer le projet dans le dossier `htdocs`.
3. Vérifier que les informations de connexion dans `init.php` correspondent à votre configuration MySQL.
4. Exécuter `init.php` afin de créer et initialiser la base de données **DexBD**.

La base de données et les tables nécessaires sont créées automatiquement avec les données initiales.

Ensuite, ouvrir l'application dans un navigateur :

```text
http://localhost/Dex/
```

## Utilisation

Sur la page principale, il est possible de :

* consulter les travaux disponibles;
* filtrer les travaux par cours;
* sélectionner un travail pour consulter ses informations et ses créneaux.

Pour un travail, l'utilisateur peut entrer son nom et son matricule, puis sélectionner un ou plusieurs créneaux où il est disponible.

Les disponibilités enregistrées sont visibles par les autres utilisateurs. Le ou les créneaux ayant le plus de disponibilités sont mis en évidence.


### Disponibilités

Pour chaque travail, l'utilisateur peut :

* entrer son nom et son matricule;
* sélectionner un ou plusieurs créneaux;
* consulter le nombre d'étudiants disponibles pour chaque créneau;
* voir les étudiants ayant sélectionné chaque créneau.

Les créneaux ayant le plus grand nombre de disponibilités sont mis en évidence.

Un étudiant peut également modifier ses disponibilités en soumettant à nouveau le formulaire.


## Structure principale

```text
Dex/
├── index.php       # Liste des travaux
├── travail.php     # Détails et disponibilités
├── init.php        # Initialisation de la base de données
├── header.php      # En-tête
├── footer.php      # Pied de page
└── style.css       # Styles
```

## Technologies

* PHP
* MySQL
* PDO
* HTML/CSS
* JavaScript
* SweetAlert2
* XAMPP
