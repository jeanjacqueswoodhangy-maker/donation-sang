<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Plateforme locale pour encourager le don de sang, trouver un centre et prendre un engagement de don.">
  <meta name="theme-color" content="#b51f32">
  <meta property="og:title" content="Demander du sang - Don de Sang Solidaire">
  <meta property="og:description" content="Plateforme locale pour encourager le don de sang en Haïti.">
  <meta property="og:type" content="website">
  <title>Demander du sang - Don de Sang Solidaire</title>
  <link rel="stylesheet" href="styles.css">
  <!-- Font Awesome pour les icônes -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  <style>
    .payment-methods { display: flex; flex-wrap: wrap; gap: 10px; margin: 15px 0; }
    .payment-method-card { flex: 1 1 100px; border: 2px solid transparent; border-radius: 10px; padding: 15px 10px; text-align: center; cursor: pointer; transition: all 0.3s; background: #f9f9f9; }
    .payment-method-card:hover { border-color: #b51f32; background: #fff0f0; }
    .payment-method-card.active { border-color: #b51f32; background: #fff5f5; box-shadow: 0 0 10px rgba(181,31,50,0.2); }
    .payment-method-card h6 { margin: 8px 0 0; font-weight: bold; }
    .payment-method-card i { font-size: 2rem; color: #b51f32; }
    .payment-info-box { background: #f1f5f9; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #b51f32; }
    .payment-info-box h6 { margin-top: 0; color: #b51f32; }
    .payment-info-box .small { font-size: 0.85rem; color: #666; }
    .file-upload-wrapper { margin-bottom: 15px; }
  </style>
</head>
<body>
  <a href="#main-content" class="skip-link">Aller au contenu principal</a>

  <div class="utility-bar">
    <span>Urgence et orientation: <a href="tel:+50944842854">+509 4484 2854</a></span>
    <span>Contribution MonCash: <a href="tel:+50944842854">+509 4484 2854</a></span>
  </div>
  <header class="site-header">
      <a class="brand" href="index.php" aria-label="Don de Sang Solidaire">
        <span class="brand-mark" aria-hidden="true"></span>
        <span>Don de Sang Solidaire</span>
      </a>
      <nav class="main-nav" aria-label="Navigation principale">
        <a class="is-active" href="index.php">Accueil</a>
        <a href="pourquoi.php">Pourquoi donner</a>
        <a href="conseils.php">Conseils</a>
        <a href="conditions.php">Conditions</a>
        <a href="urgences.php">Besoins urgents</a>
        <a href="centres.php">Centres</a>
        <a href="faq.php">FAQ</a>
        <a href="demande.php">Demander du sang</a>
        <a href="contact.php">Contacts</a>
        <a href="admin.php">Admin</a>
        <a class="nav-cta" href="engagement.php">Je donne</a>
      </nav>
      <button class="language-toggle" id="languageToggle" type="button" aria-label="Changer de langue">Kreyol</button>
    </header>
  <main id="main-content">
    <section class="content-section request-section" id="demande">
      <div class="request-copy">
        <p class="eyebrow">Besoin d'assistance</p>
        <h2>Faire une demande de sang</h2>
        <p>Ce formulaire permet de signaler un besoin. Pour une urgence vitale, contactez directement un hôpital ou les services d'urgence.</p>
        <div class="urgent-contact-box">
          <strong>Ligne d'urgence</strong>
          <a href="tel:+50944842854">+509 4484 2854</a>
          <span>Disponible pour orienter les demandes prioritaires.</span>
        </div>
      </div>

      <form class="request-form" id="requestForm" novalidate enctype="multipart/form-data" data-server-multipart="true">
        <div class="form-row">
          <label>Nom du demandeur<input name="requesterName" type="text" autocomplete="name" required pattern="[\p{L}\s'-]+" title="Entrez un nom valide"></label>
          <label>Téléphone<input name="requesterPhone" type="tel" autocomplete="tel" required pattern="(\+?509)?[2349][0-9]{7}" title="Format: +509 XXXX XXXX"></label>
        </div>
        <div class="form-row">
          <label>Groupe recherché<select name="neededBloodType" required><option value="">Choisir</option><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>AB+</option><option>AB-</option><option>O+</option><option>O-</option><option>Je ne sais pas</option></select></label>
          <label>Niveau d'urgence<select name="urgency" required><option value="">Choisir</option><option>Urgent aujourd'hui</option><option>Dans 24-48h</option><option>Planifié</option></select></label>
        </div>
        <div class="form-row">
          <label>Hôpital ou clinique<input name="hospital" type="text" required></label>
          <label>Ville ou quartier<input name="requestCity" type="text" autocomplete="address-level2" required></label>
        </div>
        <label class="full-label">Détails utiles<textarea name="requestDetails" rows="4" placeholder="Exemple: nombre de poches, service, contact médical"></textarea></label>

        <fieldset class="payment-fieldset">
          <legend>Paiement ou contribution</legend>
          <p>Le sang n'est pas vendu. Cette partie sert uniquement à enregistrer des frais approuvés ou une contribution logistique obligatoire.</p>

          <!-- Cartes de méthodes de paiement : MonCash, NatCash, Sogebank -->
          <div class="payment-methods" role="radiogroup" aria-label="Mode de paiement">
            <div class="payment-method-card" data-method="moncash" onclick="selectPaymentMethod('moncash')">
              <i class="fas fa-mobile-alt"></i>
              <h6>MonCash</h6>
            </div>
            <div class="payment-method-card" data-method="natcash" onclick="selectPaymentMethod('natcash')">
              <i class="fas fa-money-bill-wave"></i>
              <h6>NatCash</h6>
            </div>
            <div class="payment-method-card" data-method="sogebank" onclick="selectPaymentMethod('sogebank')">
              <i class="fas fa-university"></i>
              <h6>Sogebank</h6>
            </div>
          </div>

          <input type="hidden" name="paymentMethod" id="paymentMethodInput" value="" required>

          <div id="paymentInfoBox" class="payment-info-box" style="display:none;">
            <div id="paymentInstructions"></div>
          </div>

          <div class="form-row">
            <label>Montant<input name="paymentAmount" type="number" min="0" step="1" placeholder="Exemple: 500"></label>
            <label>Référence de transaction (Numéro de transaction / ID) *<input name="paymentReference" type="text" placeholder="Ex: 123456789" required></label>
          </div>

          <div class="file-upload-wrapper">
            <label for="screenshot">Captur d'écran de la transaction *</label>
            <input type="file" name="screenshot" id="screenshot" accept="image/*">
            <small>JPG, PNG, GIF, WEBP – max 5 MB</small>
          </div>

          <div class="form-check">
            <input type="checkbox" class="form-check-input" id="acceptTerms" name="acceptTerms" required>
            <label class="form-check-label" for="acceptTerms">
              Je comprends que ma demande sera traitée sous 24h maximum.
            </label>
          </div>
        </fieldset>

        <button class="button primary" type="submit">Envoyer la demande</button>
        <a class="button secondary whatsapp-request-link" id="requestWhatsapp" href="https://wa.me/50944842854" target="_blank" rel="noopener noreferrer">Préparer le message WhatsApp</a>
        <p class="form-message" id="requestMessage" role="status" aria-live="polite"></p>

        <section class="receipt-card is-hidden" id="contributionReceipt" aria-label="Reçu de contribution">
          <div class="receipt-header">
            <div><p class="eyebrow">Reçu de contribution</p><h3>Don de Sang Solidaire</h3></div>
            <strong id="receiptNumber">R-0000</strong>
          </div>
          <dl class="receipt-details">
            <div><dt>Nom</dt><dd id="receiptName">-</dd></div>
            <div><dt>Téléphone</dt><dd id="receiptPhone">-</dd></div>
            <div><dt>Groupe demandé</dt><dd id="receiptBloodType">-</dd></div>
            <div><dt>Méthode</dt><dd id="receiptMethod">-</dd></div>
            <div><dt>Montant</dt><dd id="receiptAmount">-</dd></div>
            <div><dt>Référence</dt><dd id="receiptReference">-</dd></div>
            <div><dt>Date</dt><dd id="receiptDate">-</dd></div>
          </dl>
          <p class="receipt-note" id="receiptNote">Ce reçu confirme l'enregistrement d'une contribution logistique. Il ne constitue pas une vente de sang.</p>
          <div class="receipt-print-settings" aria-label="Paramètres d'impression du reçu">
            <label>Format du reçu
              <select id="receiptPaper">
                <option value="a4">A4</option>
                <option value="a5">A5</option>
                <option value="ticket">Ticket 80 mm</option>
              </select>
            </label>
            <label class="print-check"><input id="receiptIncludeNote" type="checkbox" checked> Inclure la note</label>
            <label class="print-check"><input id="receiptAutoPrint" type="checkbox"> Imprimer automatiquement après l'envoi</label>
          </div>
          <button class="button secondary" id="printReceipt" type="button">Imprimer le reçu</button>
        </section>
      </form>
    </section>
  </main>

  <footer class="site-footer">
    <p>Don de Sang Solidaire</p>
    <p>En cas d'urgence médicale, contactez directement un centre de santé ou les services compétents.</p>
  </footer>

  <a class="whatsapp-button" href="https://wa.me/50944842854?text=Bonjour%2C%20je%20souhaite%20avoir%20des%20informations%20sur%20le%20don%20de%20sang" target="_blank" rel="noopener noreferrer">WhatsApp</a>

  <script src="script.js"></script>
  <script>
    // Sélection de la méthode de paiement
    function selectPaymentMethod(method) {
      document.querySelectorAll('.payment-method-card').forEach(card => card.classList.remove('active'));
      document.querySelector(`.payment-method-card[data-method="${method}"]`).classList.add('active');
      document.getElementById('paymentMethodInput').value = method;
      const infoBox = document.getElementById('paymentInfoBox');
      const instructions = document.getElementById('paymentInstructions');
      const details = {
        moncash: {
          title: 'MonCash',
          html: `<p><strong>Envoyez le montant sur le numéro MonCash :</strong></p>
                 <p>+509 4484 2854 (Don de Sang Solidaire)</p>
                 <p class="small">Après le paiement, entrez la référence ci-dessous.</p>`
        },
        natcash: {
          title: 'NatCash',
          html: `<p><strong>Envoyez le montant sur le numéro NatCash :</strong></p>
                 <p>+509 4484 2854 (Don de Sang Solidaire)</p>
                 <p class="small">Après le paiement, entrez la référence ci-dessous.</p>`
        },
        sogebank: {
          title: 'Sogebank',
          html: `<p><strong>Effectuez un virement Sogebank vers :</strong></p>
                 <p>Banque : Sogebank<br>
                 Compte : 4301239994<br>
                 Nom : Don de Sang Solidaire<br>
                 Type : Epay</p>
                 <p class="small">Après le virement, indiquez la référence.</p>`
        }
      };
      instructions.innerHTML = `<h6>${details[method].title}</h6>${details[method].html}`;
      infoBox.style.display = 'block';
    }

    // Présélectionner MonCash au chargement
    document.addEventListener('DOMContentLoaded', () => selectPaymentMethod('moncash'));

    // Soumission du formulaire
    document.getElementById('requestForm').addEventListener('submit', async function(e) {
      e.preventDefault();
      const form = e.target;
      const messageEl = document.getElementById('requestMessage');

      // Vérification de la méthode
      if (!document.getElementById('paymentMethodInput').value) {
        messageEl.textContent = 'Veuillez choisir une méthode de paiement.';
        messageEl.style.color = 'red';
        return;
      }

      const formData = new FormData(form);
      const phone = String(formData.get('requesterPhone') || '').replace(/[\s\-.\(\)]/g, '');
      if (!/^(\+?509)?[2349][0-9]{7}$/.test(phone)) {
        messageEl.textContent = 'Veuillez entrer un numéro haïtien valide.';
        messageEl.style.color = 'red';
        return;
      }
      // Ajouter le champ caché paymentMethod (déjà dans le form)
      // formData contient tous les champs, y compris le fichier screenshot

      try {
        const response = await fetch('requests.php', {
          method: 'POST',
          body: formData  // multipart/form-data
        });
        const raw = await response.text();
        let result;
        try {
          result = JSON.parse(raw);
        } catch (parseError) {
          throw new Error('Réponse serveur invalide. Vérifiez PHP/MySQL et consultez requests.php directement.');
        }
        if (!response.ok) throw new Error(result.message || 'Erreur lors de l\'enregistrement');

        // Afficher le reçu
        const now = new Date();
        document.getElementById('receiptNumber').textContent = 'R-' + String(result.id).padStart(4, '0');
        document.getElementById('receiptName').textContent = form.requesterName.value.trim();
        document.getElementById('receiptPhone').textContent = form.requesterPhone.value.trim();
        document.getElementById('receiptBloodType').textContent = form.neededBloodType.value;
        document.getElementById('receiptMethod').textContent = result.mode_paiement || form.elements.paymentMethod.value;
        document.getElementById('receiptAmount').textContent = result.montant || form.paymentAmount.value || '—';
        document.getElementById('receiptReference').textContent = form.paymentReference.value.trim() || '—';
        document.getElementById('receiptDate').textContent = now.toLocaleDateString('fr-FR') + ' ' + now.toLocaleTimeString('fr-FR');
        document.getElementById('contributionReceipt').classList.remove('is-hidden');

        messageEl.textContent = '✅ Demande enregistrée avec succès.';
        messageEl.style.color = 'green';
        form.reset();
        selectPaymentMethod('moncash');
      } catch (error) {
        messageEl.textContent = '❌ ' + error.message;
        messageEl.style.color = 'red';
      }
    });
  </script>
</body>
</html>
