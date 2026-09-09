CREATE DATABASE IF NOT EXISTS donation_sang
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE donation_sang;

CREATE TABLE IF NOT EXISTS donneurs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nom VARCHAR(150) NOT NULL,
  telephone VARCHAR(30) NOT NULL,
  groupe_sanguin ENUM('A+','A-','B+','B-','AB+','AB-','O+','O-','Je ne sais pas') NOT NULL,
  ville VARCHAR(100) NOT NULL,
  disponibilite TEXT,
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS demandes_sang (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nom_demandeur VARCHAR(150) NOT NULL,
  telephone VARCHAR(30) NOT NULL,
  groupe_recherche ENUM('A+','A-','B+','B-','AB+','AB-','O+','O-','Je ne sais pas') NOT NULL,
  urgence VARCHAR(80) NOT NULL,
  hopital VARCHAR(150) NOT NULL,
  ville VARCHAR(100) NOT NULL,
  details TEXT,
  mode_paiement VARCHAR(80),
  montant DECIMAL(10,2),
  reference_transaction VARCHAR(120),
  statut ENUM('ouverte','en_cours','terminee','annulee') DEFAULT 'ouverte',
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  screenshot VARCHAR(255) DEFAULT NULL,
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE demandes_sang
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS screenshot VARCHAR(255) DEFAULT NULL;
