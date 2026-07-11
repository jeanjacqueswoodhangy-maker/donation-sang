create database if not exists donation_sang
  character set utf8mb4
  collate utf8mb4_unicode_ci;

use donation_sang;

create table if not exists donneurs (
  id int primary key auto_increment,
  nom varchar(150) not null,
  telephone varchar(30) not null,
  groupe_sanguin enum('A+','A-','B+','B-','AB+','AB-','O+','O-','Je ne sais pas') not null,
  ville varchar(100) not null,
  disponibilite text,
  date_creation timestamp default current_timestamp
);

create table if not exists demandes_sang (
  id int primary key auto_increment,
  nom_demandeur varchar(150) not null,
  telephone varchar(30) not null,
  groupe_recherche enum('A+','A-','B+','B-','AB+','AB-','O+','O-','Je ne sais pas') not null,
  urgence varchar(80) not null,
  hopital varchar(150) not null,
  ville varchar(100) not null,
  details text,
  mode_paiement varchar(80),
  montant decimal(10,2),
  reference_transaction varchar(120),
  statut enum('ouverte','en_cours','terminee','annulee') default 'ouverte',
  date_creation timestamp default current_timestamp
);
