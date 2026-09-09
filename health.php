<?php
/**
 * health.php
 * Petit endpoint pour vérifier que le serveur PHP et la base de données répondent.
 * Ouvrir dans le navigateur: http://localhost:8000/health.php
 */

require_once "config.php";

$resultat = mysqli_query($conn, "SELECT 1");

echo json_encode([
    "status" => $resultat ? "ok" : "erreur",
    "database" => DB_NAME
]);

mysqli_close($conn);
