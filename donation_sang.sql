-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 18, 2026 at 03:07 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `donation_sang`
--

-- --------------------------------------------------------

--
-- Table structure for table `demandes_sang`
--

CREATE TABLE `demandes_sang` (
  `id` int(11) NOT NULL,
  `nom_demandeur` varchar(150) NOT NULL,
  `telephone` varchar(30) NOT NULL,
  `groupe_recherche` enum('A+','A-','B+','B-','AB+','AB-','O+','O-','Je ne sais pas') NOT NULL,
  `urgence` varchar(80) NOT NULL,
  `hopital` varchar(150) NOT NULL,
  `ville` varchar(100) NOT NULL,
  `details` text DEFAULT NULL,
  `mode_paiement` varchar(80) DEFAULT NULL,
  `montant` decimal(10,2) DEFAULT NULL,
  `reference_transaction` varchar(120) DEFAULT NULL,
  `statut` enum('ouverte','en_cours','terminee','annulee') DEFAULT 'ouverte',
  `date_creation` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` varchar(20) NOT NULL DEFAULT 'pending',
  `screenshot` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `demandes_sang`
--

INSERT INTO `demandes_sang` (`id`, `nom_demandeur`, `telephone`, `groupe_recherche`, `urgence`, `hopital`, `ville`, `details`, `mode_paiement`, `montant`, `reference_transaction`, `statut`, `date_creation`, `status`, `screenshot`) VALUES
(1, 'Paul walker', '+50937857810', 'O+', 'Dans 24-48h', 'centre hospitalier de carrefour', 'village de Dieu', '3 poches de sang', 'moncash', 10000.00, '1234', 'ouverte', '2026-08-18 10:33:04', 'validated', 'demande_1787049184_6a8434e0e026c.png');

-- --------------------------------------------------------

--
-- Table structure for table `donneurs`
--

CREATE TABLE `donneurs` (
  `id` int(11) NOT NULL,
  `nom` varchar(150) NOT NULL,
  `telephone` varchar(30) NOT NULL,
  `groupe_sanguin` enum('A+','A-','B+','B-','AB+','AB-','O+','O-','Je ne sais pas') NOT NULL,
  `ville` varchar(100) NOT NULL,
  `disponibilite` text DEFAULT NULL,
  `date_creation` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `donneurs`
--

INSERT INTO `donneurs` (`id`, `nom`, `telephone`, `groupe_sanguin`, `ville`, `disponibilite`, `date_creation`) VALUES
(1, 'paul walker', '+50937857810', 'B-', 'Marseille', 'fuck you', '2026-08-18 10:56:12');

-- --------------------------------------------------------

--
-- Table structure for table `paiements`
--

CREATE TABLE `paiements` (
  `id` int(11) NOT NULL,
  `demande_id` int(11) DEFAULT NULL,
  `nom_utilisateur` varchar(150) NOT NULL,
  `telephone` varchar(30) NOT NULL,
  `mode_paiement` enum('moncash','natcash','carte','virement') NOT NULL,
  `compte_paiement` varchar(50) NOT NULL,
  `montant` decimal(10,2) NOT NULL,
  `reference_transaction` varchar(100) NOT NULL,
  `statut` enum('en_attente','valide','echoue') DEFAULT 'en_attente',
  `date_paiement` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `demandes_sang`
--
ALTER TABLE `demandes_sang`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `donneurs`
--
ALTER TABLE `donneurs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `paiements`
--
ALTER TABLE `paiements`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `reference_transaction` (`reference_transaction`),
  ADD KEY `demande_id` (`demande_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `demandes_sang`
--
ALTER TABLE `demandes_sang`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `donneurs`
--
ALTER TABLE `donneurs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `paiements`
--
ALTER TABLE `paiements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `paiements`
--
ALTER TABLE `paiements`
  ADD CONSTRAINT `paiements_ibfk_1` FOREIGN KEY (`demande_id`) REFERENCES `demandes_sang` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
