<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Plateforme locale pour encourager le don de sang, trouver un centre et prendre un engagement de don.">
  <meta name="theme-color" content="#b51f32">
  <meta property="og:title" content="Je donne - Don de Sang Solidaire">
  <meta property="og:description" content="Plateforme locale pour encourager le don de sang en Haïti.">
  <meta property="og:type" content="website">
  <title>Je donne - Don de Sang Solidaire</title>
  <link rel="stylesheet" href="styles.css">
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
    <section class="content-section pledge-section" id="engagement">
      <div class="pledge-copy">
        <p class="eyebrow">Passer à l'action</p>
        <h2>Je souhaite être contacté pour donner</h2>
        <p>Remplissez ce formulaire de promesse. Une équipe pourra confirmer votre éligibilité et vous proposer le centre le plus pratique.</p>
      </div>
      <form class="pledge-form" id="pledgeForm" novalidate>
        <div class="form-row">
          <label>Nom complet<input name="name" type="text" autocomplete="name" required pattern="[\p{L}\s'-]+" title="Entrez un nom valide"></label>
          <label>Téléphone<input name="phone" type="tel" autocomplete="tel" required pattern="(\+?509)?[2349][0-9]{7}" title="Format: +509 XXXX XXXX"></label>
        </div>
        <div class="form-row">
          <label>Groupe sanguin<select name="bloodType" required><option value="">Choisir</option><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>AB+</option><option>AB-</option><option>O+</option><option>O-</option><option>Je ne sais pas</option></select></label>
          <label>Ville ou quartier<input name="city" type="text" autocomplete="address-level2" required></label>
        </div>
        <label class="full-label">Disponibilité<textarea name="availability" rows="4" placeholder="Exemple: samedi matin, après 10h"></textarea></label>
        <label class="consent"><input type="checkbox" required><span>J'accepte d'être contacté au sujet d'une campagne de don de sang et je comprends que mes informations seront conservées localement par l'équipe.</span></label>
        <button class="button primary" type="submit">Envoyer ma promesse</button>
        <p class="form-message" id="formMessage" role="status" aria-live="polite"></p>
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
    document.getElementById('pledgeForm').addEventListener('submit', async function(e) {
      e.preventDefault();
      const form = e.target;
      const messageEl = document.getElementById('formMessage');

      const data = {
        name: form.name.value.trim(),
        phone: form.phone.value.trim(),
        bloodType: form.bloodType.value,
        city: form.city.value.trim(),
        availability: form.availability.value.trim()
      };

      try {
        const response = await fetch('donors.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Erreur lors de l\'enregistrement');

        messageEl.textContent = '✅ Votre promesse a été enregistrée. Merci !';
        messageEl.style.color = 'green';
        form.reset();
      } catch (error) {
        messageEl.textContent = '❌ ' + error.message;
        messageEl.style.color = 'red';
      }
    });
  </script>
</body>
</html>