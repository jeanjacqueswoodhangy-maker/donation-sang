<?php
/**
 * donors.php
 * Endpoint pour les donneurs.
 *   GET    /donors.php               -> liste des donneurs (filtres optionnels ?bloodType=&city=)
 *   POST   /donors.php               -> ajoute un donneur
 *   DELETE /donors.php               -> supprime tous les donneurs
 */

require_once "config.php";

$methode = $_SERVER["REQUEST_METHOD"];

if ($methode === "GET") {

    $sql = "SELECT * FROM donneurs WHERE 1=1";
    $types = "";
    $valeurs = [];

    if (!empty($_GET["bloodType"])) {
        $sql .= " AND groupe_sanguin = ?";
        $types .= "s";
        $valeurs[] = $_GET["bloodType"];
    }

    if (!empty($_GET["city"])) {
        $sql .= " AND ville LIKE ?";
        $types .= "s";
        $valeurs[] = "%" . $_GET["city"] . "%";
    }

    $sql .= " ORDER BY date_creation DESC";

    $stmt = mysqli_prepare($conn, $sql);
    if (!$stmt) {
        repondreErreur("Impossible de préparer la liste des donneurs: " . mysqli_error($conn));
    }
    if ($types !== "") {
        mysqli_stmt_bind_param($stmt, $types, ...$valeurs);
    }
    mysqli_stmt_execute($stmt);
    $resultat = mysqli_stmt_get_result($stmt);

    $donneurs = [];
    while ($ligne = mysqli_fetch_assoc($resultat)) {
        $donneurs[] = $ligne;
    }

    echo json_encode($donneurs);
    mysqli_stmt_close($stmt);

} elseif ($methode === "POST") {

    $donnees = lireCorpsJson();

    $nom = champObligatoire($donnees, ["name", "nom"], "Nom");
    $telephone = champObligatoire($donnees, ["phone", "telephone"], "Téléphone");
    $groupeSanguin = champObligatoire($donnees, ["bloodType", "groupe_sanguin"], "Groupe sanguin");
    $ville = champObligatoire($donnees, ["city", "ville"], "Ville");
    $disponibilite = champOptionnel($donnees, ["availability", "disponibilite"]);

    $stmt = mysqli_prepare($conn, "INSERT INTO donneurs (nom, telephone, groupe_sanguin, ville, disponibilite) VALUES (?, ?, ?, ?, ?)");
    if (!$stmt) {
        repondreErreur("Impossible de préparer l'enregistrement du donneur: " . mysqli_error($conn));
    }
    mysqli_stmt_bind_param($stmt, "sssss", $nom, $telephone, $groupeSanguin, $ville, $disponibilite);
    if (!mysqli_stmt_execute($stmt)) {
        repondreErreur("Impossible d'enregistrer le donneur: " . mysqli_stmt_error($stmt));
    }

    http_response_code(201);
    echo json_encode([
        "id" => mysqli_insert_id($conn),
        "nom" => $nom,
        "telephone" => $telephone,
        "groupe_sanguin" => $groupeSanguin,
        "ville" => $ville,
        "disponibilite" => $disponibilite
    ]);
    mysqli_stmt_close($stmt);

} elseif ($methode === "DELETE") {

    if (!mysqli_query($conn, "DELETE FROM donneurs")) {
        repondreErreur("Impossible de supprimer les donneurs: " . mysqli_error($conn));
    }
    echo json_encode(["deleted" => true, "scope" => "all"]);

} else {
    http_response_code(405);
    echo json_encode(["message" => "Méthode non autorisée."]);
}

mysqli_close($conn);
