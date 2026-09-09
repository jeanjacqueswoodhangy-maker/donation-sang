<?php
/**
 * requests.php
 * Endpoint pour les demandes de sang.
 *   GET    /requests.php            -> liste des demandes
 *   POST   /requests.php            -> ajoute une demande (JSON ou multipart)
 *   PATCH  /requests.php?id=X       -> met à jour le statut d'une demande
 *   DELETE /requests.php            -> supprime toutes les demandes
 */

require_once "config.php";

$methode = $_SERVER["REQUEST_METHOD"];

// ----- GET : liste des demandes -----
if ($methode === "GET") {
    $resultat = mysqli_query($conn, "SELECT * FROM demandes_sang ORDER BY date_creation DESC");
    if (!$resultat) {
        repondreErreur("Impossible de charger les demandes: " . mysqli_error($conn));
    }
    $demandes = [];
    while ($ligne = mysqli_fetch_assoc($resultat)) {
        $demandes[] = $ligne;
    }
    echo json_encode($demandes);
    mysqli_close($conn);
    exit;
}

// ----- PATCH : mise à jour du statut -----
if ($methode === "PATCH") {
    // Récupérer l'ID et le nouveau statut depuis les données JSON ou les paramètres
    parse_str(file_get_contents("php://input"), $patchData);
    $id = $patchData['id'] ?? $_GET['id'] ?? null;
    $status = $patchData['status'] ?? $_GET['status'] ?? null;

    if (!$id || !in_array($status, ['pending', 'validated', 'rejected'])) {
        http_response_code(400);
        echo json_encode(["message" => "ID ou statut invalide."]);
        exit;
    }

    $stmt = mysqli_prepare($conn, "UPDATE demandes_sang SET status = ? WHERE id = ?");
    if (!$stmt) {
        repondreErreur("Impossible de préparer la validation: " . mysqli_error($conn));
    }
    mysqli_stmt_bind_param($stmt, "si", $status, $id);
    if (!mysqli_stmt_execute($stmt)) {
        repondreErreur("Impossible de valider la demande: " . mysqli_stmt_error($stmt));
    }

    if (mysqli_stmt_affected_rows($stmt) > 0) {
        echo json_encode(["success" => true, "id" => $id, "status" => $status]);
    } else {
        http_response_code(404);
        echo json_encode(["message" => "Demande introuvable ou statut identique."]);
    }
    mysqli_stmt_close($stmt);
    mysqli_close($conn);
    exit;
}

// ----- DELETE : suppression totale -----
if ($methode === "DELETE") {
    if (!mysqli_query($conn, "DELETE FROM demandes_sang")) {
        repondreErreur("Impossible de supprimer les demandes: " . mysqli_error($conn));
    }
    echo json_encode(["deleted" => true, "scope" => "all"]);
    mysqli_close($conn);
    exit;
}

// ----- POST : ajout d'une demande (JSON ou multipart) -----
if ($methode === "POST") {
    // Déterminer si la requête est en multipart/form-data (avec fichier) ou en JSON
    $contentType = $_SERVER["CONTENT_TYPE"] ?? '';
    $isMultipart = strpos($contentType, 'multipart/form-data') !== false;

    if ($isMultipart) {
        // Traitement multipart
        $nomDemandeur = $_POST['requesterName'] ?? '';
        $telephone = $_POST['requesterPhone'] ?? '';
        $groupeRecherche = $_POST['neededBloodType'] ?? '';
        $urgence = $_POST['urgency'] ?? '';
        $hopital = $_POST['hospital'] ?? '';
        $ville = $_POST['requestCity'] ?? '';
        $details = $_POST['requestDetails'] ?? '';
        $modePaiement = $_POST['paymentMethod'] ?? '';
        $montant = isset($_POST['paymentAmount']) && is_numeric($_POST['paymentAmount']) ? floatval($_POST['paymentAmount']) : null;
        $referenceTransaction = $_POST['paymentReference'] ?? '';

        // Gestion du fichier screenshot
        $screenshot = null;
        if (isset($_FILES['screenshot']) && $_FILES['screenshot']['error'] === UPLOAD_ERR_OK) {
            $uploadDir = 'uploads/'; // Assurez-vous que ce dossier existe et est accessible en écriture
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }
            $ext = strtolower(pathinfo($_FILES['screenshot']['name'], PATHINFO_EXTENSION));
            $allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
            if (in_array($ext, $allowed)) {
                $newName = 'demande_' . time() . '_' . uniqid() . '.' . $ext;
                if (move_uploaded_file($_FILES['screenshot']['tmp_name'], $uploadDir . $newName)) {
                    $screenshot = $newName;
                }
            }
        }
    } else {
        // Traitement JSON (ancien comportement)
        $donnees = lireCorpsJson();
        $nomDemandeur = champObligatoire($donnees, ["requesterName", "nom_demandeur"], "Nom du demandeur");
        $telephone = champObligatoire($donnees, ["requesterPhone", "telephone"], "Téléphone");
        $groupeRecherche = champObligatoire($donnees, ["neededBloodType", "groupe_recherche"], "Groupe recherché");
        $urgence = champObligatoire($donnees, ["urgency", "urgence"], "Urgence");
        $hopital = champObligatoire($donnees, ["hospital", "hopital"], "Hôpital");
        $ville = champObligatoire($donnees, ["requestCity", "ville"], "Ville");
        $details = champOptionnel($donnees, ["requestDetails", "details"]);
        $modePaiement = champOptionnel($donnees, ["paymentMethod", "mode_paiement"]);
        $montant = champOptionnel($donnees, ["paymentAmount", "montant"]);
        $montant = ($montant !== null && is_numeric($montant)) ? floatval($montant) : null;
        $referenceTransaction = champOptionnel($donnees, ["paymentReference", "reference_transaction"]);
        $screenshot = champOptionnel($donnees, ["screenshot"]); // si envoyé en JSON
    }

    // Validation basique
    if (empty($nomDemandeur) || empty($telephone) || empty($groupeRecherche) || empty($urgence) || empty($hopital) || empty($ville)) {
        http_response_code(400);
        echo json_encode(["message" => "Tous les champs obligatoires doivent être remplis."]);
        exit;
    }

    $status = 'pending';

    $stmt = mysqli_prepare($conn, "INSERT INTO demandes_sang 
        (nom_demandeur, telephone, groupe_recherche, urgence, hopital, ville, details, mode_paiement, montant, reference_transaction, screenshot, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    if (!$stmt) {
        repondreErreur("Impossible de préparer l'enregistrement: " . mysqli_error($conn));
    }
    mysqli_stmt_bind_param(
        $stmt,
        "ssssssssdsss",
        $nomDemandeur,
        $telephone,
        $groupeRecherche,
        $urgence,
        $hopital,
        $ville,
        $details,
        $modePaiement,
        $montant,
        $referenceTransaction,
        $screenshot,
        $status
    );
    if (!mysqli_stmt_execute($stmt)) {
        repondreErreur("Impossible d'enregistrer la demande: " . mysqli_stmt_error($stmt));
    }

    $newId = mysqli_insert_id($conn);
    mysqli_stmt_close($stmt);

    http_response_code(201);
    echo json_encode([
        "id" => $newId,
        "nom_demandeur" => $nomDemandeur,
        "telephone" => $telephone,
        "groupe_recherche" => $groupeRecherche,
        "urgence" => $urgence,
        "hopital" => $hopital,
        "ville" => $ville,
        "details" => $details,
        "mode_paiement" => $modePaiement,
        "montant" => $montant,
        "reference_transaction" => $referenceTransaction,
        "screenshot" => $screenshot,
        "status" => $status
    ]);
    mysqli_close($conn);
    exit;
}

// Méthode non supportée
http_response_code(405);
echo json_encode(["message" => "Méthode non autorisée."]);
