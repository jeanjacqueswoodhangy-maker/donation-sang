<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Plateforme locale pour encourager le don de sang, trouver un centre et prendre un engagement de don.">
  <meta name="theme-color" content="#b51f32">
  <meta property="og:title" content="Administration - Don de Sang Solidaire">
  <meta property="og:description" content="Plateforme locale pour encourager le don de sang en Haïti.">
  <meta property="og:type" content="website">
  <title>Administration - Don de Sang Solidaire</title>
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
    <section class="content-section admin-section" id="admin">
      <div class="section-heading">
        <div><p class="eyebrow">Espace administrateur</p><h2>Suivi local des donneurs et demandes</h2></div>
        <p class="section-note">Les données sont enregistrées sur le serveur et partagées entre tous les administrateurs.</p>
      </div>

      <div class="privacy-notice">
        <strong>Protection des données personnelles</strong>
        <p>L'accès aux contacts est verrouillé. Les numéros et demandes ne doivent être consultés que par les personnes autorisées.</p>
      </div>

      <div class="admin-lock" id="adminLock">
        <label>Code administrateur<input id="adminPasscode" type="password" autocomplete="current-password" placeholder="Entrer le code" maxlength="10" inputmode="numeric"></label>
        <button class="button primary" id="unlockAdmin" type="button">Déverrouiller</button>
        <p class="form-message" id="adminLockMessage" role="status" aria-live="polite"></p>
      </div>

      <div class="admin-private is-locked" id="adminPrivate">
        <div class="admin-controls">
          <label>Filtrer par groupe sanguin
            <select id="adminBloodFilter">
              <option value="">Tous les groupes</option>
              <option>A+</option><option>A-</option><option>B+</option><option>B-</option>
              <option>AB+</option><option>AB-</option><option>O+</option><option>O-</option><option>Je ne sais pas</option>
            </select>
          </label>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button class="button secondary" id="lockAdmin" type="button">Verrouiller</button>
            <button class="button secondary" id="clearAdminData" type="button">Effacer les données</button>
            <button class="button secondary" id="exportData" type="button">Exporter</button>
          </div>
        </div>

        <div class="admin-summary" aria-label="Résumé administrateur">
          <article><strong id="donorCount">0</strong><span>donneurs inscrits</span></article>
          <article><strong id="requestCount">0</strong><span>demandes reçues</span></article>
          <article><strong id="pendingCount">0</strong><span>paiements en attente</span></article>
        </div>

        <div class="admin-panels">
          <article>
            <h3>Promesses de don</h3>
            <div class="table-wrap">
              <table>
                <thead><tr><th>Nom</th><th>Téléphone</th><th>Groupe</th><th>Ville</th></tr></thead>
                <tbody id="donorTable"></tbody>
              </table>
            </div>
          </article>
          <article>
            <h3>Demandes de sang</h3>
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Téléphone</th>
                    <th>Groupe</th>
                    <th>Urgence</th>
                    <th>Paiement</th>
                    <th>Statut</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody id="requestTable"></tbody>
              </table>
            </div>
          </article>
        </div>
      </div>
    </section>
  </main>

  <footer class="site-footer">
    <p>Don de Sang Solidaire</p>
    <p>En cas d'urgence médicale, contactez directement un centre de santé ou les services compétents.</p>
  </footer>

  <a class="whatsapp-button" href="https://wa.me/50944842854?text=Bonjour%2C%20je%20souhaite%20avoir%20des%20informations%20sur%20le%20don%20de%20sang" target="_blank" rel="noopener noreferrer">WhatsApp</a>

  <script>window.DON_SANG_SERVER_ADMIN = true;</script>
  <script src="script.js"></script>
  <script>
    // Variables globales
    let allDonors = [];
    let allRequests = [];
    let isUnlocked = false;
    const ADMIN_CODE = '1234';

    const adminLock = document.getElementById('adminLock');
    const adminPrivate = document.getElementById('adminPrivate');
    const passcodeInput = document.getElementById('adminPasscode');
    const unlockBtn = document.getElementById('unlockAdmin');
    const lockBtn = document.getElementById('lockAdmin');
    const lockMessage = document.getElementById('adminLockMessage');
    const donorTable = document.getElementById('donorTable');
    const requestTable = document.getElementById('requestTable');
    const donorCount = document.getElementById('donorCount');
    const requestCount = document.getElementById('requestCount');
    const pendingCount = document.getElementById('pendingCount');
    const bloodFilter = document.getElementById('adminBloodFilter');

    // Charger les données
    async function loadData() {
      try {
        const [donorsRes, requestsRes] = await Promise.all([
          fetch('donors.php'),
          fetch('requests.php')
        ]);
        allDonors = await donorsRes.json();
        allRequests = await requestsRes.json();
        renderTables();
        updateSummary();
      } catch (error) {
        console.error('Erreur chargement:', error);
        alert('Impossible de charger les données depuis le serveur.');
      }
    }

    // Affichage des tables
    function renderTables() {
      const filter = bloodFilter.value;
      const filteredDonors = filter ? allDonors.filter(d => d.groupe_sanguin === filter) : allDonors;
      const filteredRequests = filter ? allRequests.filter(r => r.groupe_recherche === filter) : allRequests;

      donorTable.innerHTML = filteredDonors.map(d => `
        <tr>
          <td>${d.nom}</td>
          <td>${d.telephone}</td>
          <td>${d.groupe_sanguin}</td>
          <td>${d.ville}</td>
        </tr>
      `).join('');

      requestTable.innerHTML = filteredRequests.map(r => {
        const statusLabel = r.status || 'pending';
        let statusBadge = '';
        if (statusLabel === 'validated') statusBadge = '<span style="color:green">Validé</span>';
        else if (statusLabel === 'rejected') statusBadge = '<span style="color:red">Rejeté</span>';
        else statusBadge = '<span style="color:orange">En attente</span>';

        const validateBtn = statusLabel === 'pending' 
          ? `<button class="button small" onclick="validateRequest(${r.id})">Valider</button>` 
          : '';

        return `
          <tr>
            <td>${r.nom_demandeur}</td>
            <td>${r.telephone}</td>
            <td>${r.groupe_recherche}</td>
            <td>${r.urgence}</td>
            <td>${r.mode_paiement || '—'} ${r.montant ? '(' + r.montant + ')' : ''}</td>
            <td>${statusBadge}</td>
            <td>${validateBtn}</td>
          </tr>
        `;
      }).join('');
    }

    function updateSummary() {
      donorCount.textContent = allDonors.length;
      requestCount.textContent = allRequests.length;
      const pending = allRequests.filter(r => (r.status || 'pending') === 'pending').length;
      pendingCount.textContent = pending;
    }

    // Validation d'une demande (paiement)
    async function validateRequest(id) {
      if (!confirm('Valider le paiement de cette demande ?')) return;
      try {
        const response = await fetch(`requests.php?id=${id}&status=validated`, { method: 'PATCH' });
        const result = await response.json();
        if (response.ok) {
          alert('Demande validée.');
          loadData();
        } else {
          alert(result.message || 'Erreur lors de la validation.');
        }
      } catch (error) {
        alert('Erreur réseau.');
      }
    }

    // Déverrouillage / verrouillage
    function unlockAdmin() {
      if (passcodeInput.value === ADMIN_CODE) {
        isUnlocked = true;
        adminLock.style.display = 'none';
        adminPrivate.classList.remove('is-locked');
        loadData();
      } else {
        lockMessage.textContent = 'Code incorrect.';
        lockMessage.style.color = 'red';
      }
    }

    function lockAdminPanel() {
      isUnlocked = false;
      adminLock.style.display = 'block';
      adminPrivate.classList.add('is-locked');
      passcodeInput.value = '';
      lockMessage.textContent = '';
    }

    unlockBtn.addEventListener('click', unlockAdmin);
    lockBtn.addEventListener('click', lockAdminPanel);

    // Effacer les données
    document.getElementById('clearAdminData').addEventListener('click', async () => {
      if (!confirm('Voulez-vous vraiment effacer TOUTES les données ?')) return;
      try {
        await Promise.all([
          fetch('donors.php', { method: 'DELETE' }),
          fetch('requests.php', { method: 'DELETE' })
        ]);
        allDonors = [];
        allRequests = [];
        renderTables();
        updateSummary();
        alert('Données effacées.');
      } catch (error) {
        alert('Erreur lors de la suppression.');
      }
    });

    // Export CSV simple
    document.getElementById('exportData').addEventListener('click', () => {
      const donorRows = [['Nom', 'Téléphone', 'Groupe', 'Ville'], ...allDonors.map(d => [d.nom, d.telephone, d.groupe_sanguin, d.ville])];
      const requestRows = [['Nom', 'Téléphone', 'Groupe', 'Urgence', 'Paiement', 'Statut'], ...allRequests.map(r => [r.nom_demandeur, r.telephone, r.groupe_recherche, r.urgence, r.mode_paiement, r.status])];
      const csvContent = 'Donneurs\n' + donorRows.map(row => row.join(',')).join('\n') + '\n\nDemandes\n' + requestRows.map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'donnees_sang.csv';
      link.click();
    });

    // Filtrage
    bloodFilter.addEventListener('change', renderTables);
  </script>
</body>
</html>
