-- init.sql : Base de donnÃ©es DexAppBD du TP2

CREATE DATABASE IF NOT EXISTS DexAppBD CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE DexAppBD;

-- Comptes des enseignants.
CREATE TABLE IF NOT EXISTS utilisateurs (
    id                 INT          AUTO_INCREMENT PRIMARY KEY,
    identifiant        VARCHAR(50)  NOT NULL,
    mot_de_passe_hache VARCHAR(255) NOT NULL,
    nom                VARCHAR(100) NOT NULL,
    token              VARCHAR(255) NULL,
    CONSTRAINT uq_utilisateur_identifiant UNIQUE (identifiant)
);

-- Cours geres dans l'application, chacun associe Ã un enseignant.
CREATE TABLE IF NOT EXISTS cours (
    id             VARCHAR(30)  PRIMARY KEY,
    titre          VARCHAR(100) NOT NULL,
    utilisateur_id INT          NOT NULL,
    CONSTRAINT fk_cours_utilisateurs FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs (id)
);

-- Travaux associes aux cours, avec leur description, leurs echeances et leur etat d'ouverture.
CREATE TABLE IF NOT EXISTS travaux (
    id          VARCHAR(30)  PRIMARY KEY,
    cours_id    VARCHAR(30)  NOT NULL,
    titre       VARCHAR(150) NOT NULL,
    description TEXT         NOT NULL,
    type        VARCHAR(20)  NOT NULL,
    disponible  DATE         NOT NULL,
    remise      DATETIME     NOT NULL,
    ouvert      BOOLEAN      NOT NULL,
    CONSTRAINT fk_travaux_cours FOREIGN KEY (cours_id) REFERENCES cours (id)
);

-- Creneaux horaires proposes pour les travaux.
CREATE TABLE IF NOT EXISTS creneaux (
    id         VARCHAR(30) PRIMARY KEY,
    travail_id VARCHAR(30) NOT NULL,
    debut      DATETIME    NOT NULL,
    fin        DATETIME    NOT NULL,
    CONSTRAINT fk_creneaux_travaux FOREIGN KEY (travail_id) REFERENCES travaux (id)
);

-- Disponibilites indiquees par les etudiants pour les crÃ©neaux des travaux.
CREATE TABLE IF NOT EXISTS disponibilites (
    id         INT          AUTO_INCREMENT PRIMARY KEY,
    travail_id VARCHAR(30)  NOT NULL,
    creneau_id VARCHAR(30)  NOT NULL,
    matricule  VARCHAR(20)  NOT NULL,
    nom        VARCHAR(100) NOT NULL,
    CONSTRAINT uq_disponibilite UNIQUE (travail_id, creneau_id, matricule),
    CONSTRAINT fk_disponibilites_travaux FOREIGN KEY (travail_id) REFERENCES travaux (id),
    CONSTRAINT fk_disponibilites_creneaux FOREIGN KEY (creneau_id) REFERENCES creneaux (id)
        ON DELETE CASCADE
);

-- Comptes de demonstration : prof / dex2026 et prof2 / web2026
INSERT IGNORE INTO utilisateurs (id, identifiant, mot_de_passe_hache, nom) VALUES
    (1, 'prof',  '$2a$10$UGr.YCRX6faWqtG6BPotH.UUdmzJMkIGyutRYdzqCJSY/fCWKLBOC', 'Claire Dubois'),
    (2, 'prof2', '$2a$10$OBGahrOicW672peyyFaThutgGQx2x1oocG7uH6EQNioSEayUlzO9G', 'Marc Tremblay');

INSERT IGNORE INTO cours (id, titre, utilisateur_id) VALUES
    ('420-244-AH', 'Bases de donnÃ©es applicatives', 2),
    ('420-245-AH', 'Programmation Web 1', 1),
    ('420-248-AH', 'Programmation Web 2', 1),
    ('420-253-AH', 'Projet de fin d''Ã©tudes', 2);

INSERT IGNORE INTO travaux (id, cours_id, titre, description, type, disponible, remise, ouvert) VALUES
    ('web1-tp1', '420-245-AH', 'TP1 â€” Catalogue de produits',
     'Construire une premiÃ¨re application PHP permettant d''afficher et de filtrer un catalogue.',
     'individuel', '2026-09-01', '2026-09-20 23:59:00', FALSE),
    ('web2-tp1', '420-248-AH', 'TP1 â€” Gestion de rÃ©servations',
     'DÃ©velopper une application Web transactionnelle permettant d''enregistrer et de consulter des rÃ©servations.',
     'equipe', '2026-09-21', '2026-10-18 23:59:00', TRUE),
    ('bdd-lab2', '420-244-AH', 'Laboratoire 2 â€” RequÃªtes SQL',
     'Ã‰crire et tester des requÃªtes SQL sur une base de donnÃ©es relationnelle fournie.',
     'individuel', '2026-09-28', '2026-10-12 23:59:00', TRUE),
    ('bdd-tp1', '420-244-AH', 'TP1 â€” ModÃ©lisation d''une bibliothÃ¨que',
     'Concevoir un modÃ¨le relationnel et produire le script SQL permettant de crÃ©er la base de donnÃ©es.',
     'equipe', '2026-10-05', '2026-10-25 23:59:00', TRUE),
    ('pfe-prototype', '420-253-AH', 'Prototype fonctionnel',
     'Produire une premiÃ¨re version fonctionnelle du projet et prÃ©parer une dÃ©monstration Ã  l''Ã©quipe enseignante.',
     'equipe', '2026-09-15', '2026-10-09 23:59:00', TRUE);

INSERT IGNORE INTO creneaux (id, travail_id, debut, fin) VALUES
    ('web1-tp1-01', 'web1-tp1', '2026-09-15 18:00:00', '2026-09-15 19:30:00'),
    ('web1-tp1-02', 'web1-tp1', '2026-09-16 12:00:00', '2026-09-16 13:30:00'),
    ('web1-tp1-03', 'web1-tp1', '2026-09-17 17:00:00', '2026-09-17 18:30:00'),
    ('web2-tp1-01', 'web2-tp1', '2026-10-05 18:00:00', '2026-10-05 19:30:00'),
    ('web2-tp1-02', 'web2-tp1', '2026-10-06 12:00:00', '2026-10-06 13:30:00'),
    ('web2-tp1-03', 'web2-tp1', '2026-10-07 17:00:00', '2026-10-07 18:30:00'),
    ('bdd-lab2-01', 'bdd-lab2', '2026-10-01 16:00:00', '2026-10-01 17:30:00'),
    ('bdd-lab2-02', 'bdd-lab2', '2026-10-02 12:00:00', '2026-10-02 13:30:00'),
    ('bdd-lab2-03', 'bdd-lab2', '2026-10-04 10:00:00', '2026-10-04 11:30:00'),
    ('bdd-tp1-01', 'bdd-tp1', '2026-10-13 18:00:00', '2026-10-13 19:30:00'),
    ('bdd-tp1-02', 'bdd-tp1', '2026-10-14 12:00:00', '2026-10-14 13:30:00'),
    ('bdd-tp1-03', 'bdd-tp1', '2026-10-15 17:00:00', '2026-10-15 18:30:00'),
    ('int-s1-01', 'pfe-prototype', '2026-09-29 18:00:00', '2026-09-29 20:00:00'),
    ('int-s1-02', 'pfe-prototype', '2026-09-30 17:00:00', '2026-09-30 19:00:00'),
    ('int-s1-03', 'pfe-prototype', '2026-10-01 18:00:00', '2026-10-01 20:00:00');