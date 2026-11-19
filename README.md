# Dex

**Dex** est une application web permettant aux étudiants de consulter les travaux d'un cours et d'indiquer leurs disponibilités sur différents créneaux horaires. Elle offre également aux enseignants et aux administrateurs une interface dédiée à la gestion des travaux et des créneaux.

---

## Fonctionnalités

### Côté étudiant

- **Consultation des travaux (`index.php`)** : affichage des travaux disponibles, filtrage par cours et accès à la page détaillée d'un travail.
- **Consultation des créneaux (`travail.php`)** : affichage des informations du travail, des créneaux disponibles, du nombre d'étudiants inscrits par créneau ainsi que de la liste des noms.
- **Mise en évidence** : le ou les créneaux ayant le plus grand nombre de disponibilités sont mis en évidence.
- **Enregistrement et modification des disponibilités** : saisie du nom et du matricule, sélection d'un ou plusieurs créneaux et mise à jour des choix en soumettant à nouveau le formulaire.
- **Persistance locale (`localStorage`)** : après un enregistrement réussi, le nom et le matricule sont conservés dans `localStorage`. Ces informations permettent de préremplir les champs lors des visites suivantes et de cocher automatiquement les créneaux déjà choisis pour ce matricule sur le travail consulté.

### Côté administration (`admin.php`)

- **Connexion par jeton (`sessionStorage`)** : affichage d'un formulaire de connexion (identifiant et mot de passe) tant qu'aucun jeton valide n'est présent. Après connexion, le jeton est conservé dans `sessionStorage` et automatiquement effacé à la fermeture de l'onglet.
- **Liste des travaux** : affichage des travaux rattachés aux cours de l'utilisateur connecté.
- **Déconnexion** : possibilité de fermer la session administrateur.
- **Modification d'un travail** : mise à jour des propriétés suivantes :
  - `titre` : chaîne non vide, maximum 150 caractères ;
  - `description` : chaîne non vide ;
  - `type` : `individuel` ou `equipe` ;
  - `ouvert` : valeur booléenne.
- **Gestion des créneaux** :
  - Ajout d'un nouveau créneau à partir d'une heure de début et d'une heure de fin.
  - Modification des heures d'un créneau existant.
  - Suppression d'un créneau avec confirmation indiquant le nombre de réponses qui seront supprimées.

  Exemple de confirmation :

  > Ce créneau a 3 réponses. Elles seront supprimées. Continuer ?

---

## Prérequis

Avant de démarrer le projet, assurez-vous d'avoir installé les éléments suivants :

- **PHP** avec les extensions `PDO` et `pdo_mysql`.
- **Apache** pour héberger les pages PHP (par exemple avec XAMPP).
- **MySQL / MariaDB** pour la base de données.
- **Node.js** et **npm** pour exécuter l'API.

---

## Mise en place

### 1. Initialisation de la base de données

1. Démarrez MySQL et Apache depuis XAMPP.
2. Exécutez le fichier `init.sql` afin de créer la base de données, les tables et les données de départ.

**Option A : En ligne de commande**

```bash
mysql -u root -p < init.sql
```

**Option B : Avec phpMyAdmin**

1. Ouvrez [http://localhost/phpmyadmin](http://localhost/phpmyadmin).
2. Sélectionnez ou créez la base de données prévue dans `init.sql`.
3. Accédez à l'onglet **Importer**.
4. Sélectionnez le fichier `init.sql`.
5. Cliquez sur **Importer** pour exécuter le script.

### 2. Installation et démarrage de l'API

1. Ouvrez un terminal dans le dossier du projet.
2. Accédez au dossier de l'API :

```bash
cd api
```

3. Installez les dépendances :

```bash
npm install
```


5. Démarrez l'API :

```bash
npm start
```

Selon les scripts définis dans `package.json`, vous pouvez également utiliser :

```bash
npm run dev
```

**Important :** vérifiez que la constante `API_URL` dans `js/api.js` correspond à l'adresse et au port de l'API démarrée.

### 3. Accès à l'application

1. Placez le dossier du projet dans le répertoire web de votre serveur local, par exemple :

```text
C:\xampp\htdocs\Dex
```

2. Démarrez Apache et MySQL depuis XAMPP.
3. Démarrez l'API Node.js.
4. Ouvrez l'application dans votre navigateur.

**Application principale :**

[http://localhost/Dex/](http://localhost/Dex/)

**Interface d'administration :**

[http://localhost/Dex/site/admin.php](http://localhost/Dex/site/admin.php)

---

## Comptes de démonstration

Les comptes de démonstration sont créés automatiquement lors de l'exécution du fichier `init.sql`.

Consultez les requêtes `INSERT` de la table des utilisateurs dans ce fichier pour obtenir les identifiants exacts.

| Rôle | Identifiant | Mot de passe | Utilisation |
|---|---|---|---|
| Enseignant / Admin | Voir `init.sql` | Voir `init.sql` | Connexion à `admin.php` et gestion des travaux et créneaux |
| Étudiant | Aucun compte requis | Aucun mot de passe requis | Saisie du nom et du matricule dans `travail.php` |

---

## Structure du projet

```text
Dex-TP2/
│
├── README.md
├── init.sql
├── .gitignore
│
├── api/
│   ├── package.json
│   ├── package-lock.json
│   ├── server.js
│   │
│   ├── config/
│   │   └── database.js
│   │
│   ├── routes/
│   │   ├── cours.js
│   │   ├── travaux.js
│   │   ├── admin.js
│   │   └── auth.js
│   │
│   ├── middleware/
│   │   └── authentification.js
│   │
│   └── controllers/
│       ├── coursController.js
│       ├── travauxController.js
│       └── creneauxController.js
|       └── adminController.js
│
└── site/
    │
    ├── index.php
    ├── travail.php
    ├── admin.php
    ├── header.php
    ├── footer.php
    ├── style.css
    │
    └── js/
        ├── config.js
        ├── api.js
        ├── index.js
        ├── travail.js
        └── admin.js

```
---

## Technologies utilisées

| Catégorie | Technologies |
|---|---|
| Frontend | HTML5, CSS3, JavaScript (ES Modules) |
| Framework JavaScript | Vue 3 |
| Bibliothèque de notifications | SweetAlert2 |
| Backend / API | Node.js |
| Base de données | MySQL |
| Accès aux données PHP | PDO |
| Stockage local | localStorage, sessionStorage |
| Environnement de développement | XAMPP |
| Gestion des dépendances | npm |

---

## Auteur

Mohamed Banwan
