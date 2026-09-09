# Backend PHP — Don de Sang Solidaire

Backend classique en PHP + MySQL (mysqli), sans framework.

## Fichiers

- `config.php` — connexion à la base de données (à modifier avec tes identifiants) + réglages communs (CORS, JSON).
- `donors.php` — endpoint des donneurs (GET liste, POST créer, DELETE tout supprimer).
- `requests.php` — endpoint des demandes de sang (GET liste, POST créer, DELETE tout supprimer).
- `health.php` — vérifie que le serveur et la base de données répondent.
- `database.sql` — script pour créer la base et les tables.

## Installation

1. Créer la base de données en important `database.sql` (phpMyAdmin, ou en ligne de commande) :

```bash
mysql -u root -p < database.sql
```

2. Ouvrir `config.php` et mettre tes identifiants MySQL :

```php
define("DB_HOST", "localhost");
define("DB_USER", "root");
define("DB_PASSWORD", "ton_mot_de_passe");
define("DB_NAME", "donation_sang");
```

3. Lancer le serveur PHP intégré depuis le dossier du projet :

```bash
php -S localhost:8000
```

(Si tu utilises XAMPP/WAMP à la place, mets simplement le dossier du projet dans `htdocs`/`www` et adapte l'URL dans `script.js`.)

## Test

Ouvrir dans le navigateur :

```
http://localhost:8000/health.php
```

Tu dois voir `{"status":"ok","database":"donation_sang"}`.

## Lien avec le frontend

Dans `script.js`, `CONFIG.apiUrl` pointe vers `.` pour appeler les endpoints PHP du même dossier (`./donors.php`, `./requests.php`). Si tu héberges l'API ailleurs, mets à jour cette valeur.
