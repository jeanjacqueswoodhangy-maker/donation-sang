<?php
ini_set("display_errors", "0");
ini_set("log_errors", "1");
mysqli_report(MYSQLI_REPORT_OFF);

define("DB_HOST", "localhost");
define("DB_USER", "root");
define("DB_PASSWORD", "jeanjacqueswoodhandy23@");
define("DB_NAME", "donation_sang");

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, ngrok-skip-browser-warning");
header("Content-Type: application/json; charset=utf-8");

set_exception_handler(function ($exception) {
    while (ob_get_level() > 0) {
        ob_end_clean();
    }
    http_response_code(500);
    echo json_encode(["message" => "Erreur serveur: " . $exception->getMessage()]);
    exit;
});

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

$conn = mysqli_connect(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME);

if (!$conn) {
    http_response_code(500);
    echo json_encode(["message" => "Connexion à la base de données impossible: " . mysqli_connect_error()]);
    exit;
}

mysqli_set_charset($conn, "utf8mb4");

function repondreErreur($message, $code = 500) {
    http_response_code($code);
    echo json_encode(["message" => $message]);
    exit;
}

function colonneExiste($conn, $table, $colonne) {
    $sql = "SELECT COUNT(*) AS total
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = ?
              AND COLUMN_NAME = ?";
    $stmt = mysqli_prepare($conn, $sql);
    if (!$stmt) {
        return false;
    }
    mysqli_stmt_bind_param($stmt, "ss", $table, $colonne);
    if (!mysqli_stmt_execute($stmt)) {
        mysqli_stmt_close($stmt);
        return false;
    }
    $resultat = mysqli_stmt_get_result($stmt);
    $ligne = $resultat ? mysqli_fetch_assoc($resultat) : null;
    $existe = $ligne && (int) $ligne["total"] > 0;
    mysqli_stmt_close($stmt);
    return $existe;
}

function ajouterColonneSiAbsente($conn, $table, $colonne, $definition) {
    if (!colonneExiste($conn, $table, $colonne)) {
        $sql = "ALTER TABLE `$table` ADD COLUMN `$colonne` $definition";
        if (!mysqli_query($conn, $sql)) {
            if ((int) mysqli_errno($conn) === 1060) {
                return;
            }
            repondreErreur("Impossible de mettre à jour la table $table: " . mysqli_error($conn));
        }
    }
}

function preparerSchema($conn) {
    $tableCheck = mysqli_query($conn, "SHOW TABLES LIKE 'demandes_sang'");
    if ($tableCheck && mysqli_num_rows($tableCheck) > 0) {
        ajouterColonneSiAbsente($conn, "demandes_sang", "status", "VARCHAR(20) NOT NULL DEFAULT 'pending'");
        ajouterColonneSiAbsente($conn, "demandes_sang", "screenshot", "VARCHAR(255) DEFAULT NULL");
    }
}

preparerSchema($conn);

function lireCorpsJson() {
    $donnees = json_decode(file_get_contents("php://input"), true);
    return is_array($donnees) ? $donnees : [];
}

function champObligatoire($donnees, $cles, $label) {
    foreach ($cles as $cle) {
        if (!empty($donnees[$cle])) {
            return trim($donnees[$cle]);
        }
    }
    http_response_code(400);
    echo json_encode(["message" => $label . " est obligatoire."]);
    exit;
}

function champOptionnel($donnees, $cles, $defaut = null) {
    foreach ($cles as $cle) {
        if (isset($donnees[$cle]) && $donnees[$cle] !== "") {
            return $donnees[$cle];
        }
    }
    return $defaut;
}
