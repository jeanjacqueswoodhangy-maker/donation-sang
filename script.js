"use strict";


const CONFIG = {
  adminHash: "170842", 
  maxAdminAttempts: 5,
  phonePattern: /^(\+?509)?[2349][0-9]{7}$/,
  storageKeys: {
    donors: "blood-donation-donors",
    requests: "blood-donation-requests",
    lang: "preferred-language",
    receiptAutoPrint: "receipt-auto-print",
    receiptPaper: "receipt-paper-format"
  },
  emergencyPhone: "50944842854",
  moncashPhone: "50944842854",
  apiUrl: "."
};


const compatibleDonors = {
  "A+": ["A+", "A-", "O+", "O-"],
  "A-": ["A-", "O-"],
  "B+": ["B+", "B-", "O+", "O-"],
  "B-": ["B-", "O-"],
  "AB+": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
  "AB-": ["A-", "B-", "AB-", "O-"],
  "O+": ["O+", "O-"],
  "O-": ["O-"]
};

// === ÉTAT GLOBAL ===
let state = {
  adminUnlocked: false,
  adminAttempts: 0,
  currentLanguage: "fr",
  animationFrameId: null,
  isMobile: window.matchMedia("(max-width: 768px)").matches
};

const DOM = {
  searchInput: document.querySelector("#centerSearch"),
  centerCards: Array.from(document.querySelectorAll(".center-card")),
  pledgeForm: document.querySelector("#pledgeForm"),
  formMessage: document.querySelector("#formMessage"),
  requestForm: document.querySelector("#requestForm"),
  requestMessage: document.querySelector("#requestMessage"),
  requestWhatsapp: document.querySelector("#requestWhatsapp"),
  contributionReceipt: document.querySelector("#contributionReceipt"),
  printReceipt: document.querySelector("#printReceipt"),
  receiptPaper: document.querySelector("#receiptPaper"),
  receiptIncludeNote: document.querySelector("#receiptIncludeNote"),
  receiptAutoPrint: document.querySelector("#receiptAutoPrint"),
  receiptNote: document.querySelector("#receiptNote"),
  receiptFields: {
    number: document.querySelector("#receiptNumber"),
    name: document.querySelector("#receiptName"),
    phone: document.querySelector("#receiptPhone"),
    bloodType: document.querySelector("#receiptBloodType"),
    method: document.querySelector("#receiptMethod"),
    amount: document.querySelector("#receiptAmount"),
    reference: document.querySelector("#receiptReference"),
    date: document.querySelector("#receiptDate")
  },
  admin: {
    donorTable: document.querySelector("#donorTable"),
    requestTable: document.querySelector("#requestTable"),
    counts: {
      donors: document.querySelector("#donorCount"),
      requests: document.querySelector("#requestCount"),
      matches: document.querySelector("#matchCount")
    },
    bloodFilter: document.querySelector("#adminBloodFilter"),
    clearData: document.querySelector("#clearAdminData"),
    exportData: document.querySelector("#exportData"),
    privateSection: document.querySelector("#adminPrivate"),
    passcode: document.querySelector("#adminPasscode"),
    unlockBtn: document.querySelector("#unlockAdmin"),
    lockBtn: document.querySelector("#lockAdmin"),
    message: document.querySelector("#adminLockMessage")
  },
  languageToggle: document.querySelector("#languageToggle"),
  canvas: document.querySelector("#heroCanvas"),
  faqItems: Array.from(document.querySelectorAll(".faq-list details"))
};

const kreyolText = {
  "Don de Sang Solidaire": "Don San Solidè",
  "Pourquoi donner": "Poukisa bay san",
  "Conseils": "Konsèy",
  "Conditions": "Kondisyon",
  "Besoins urgents": "Bezwen ijan",
  "Centres": "Sant yo",
  "FAQ": "FAQ",
  "Demander du sang": "Mande san",
  "Contacts": "Kontak",
  "Admin": "Admin",
  "Je donne": "Mwen bay san",
  "Kreyòl": "Français",
  "Campagne communautaire": "Kanpay kominotè",
  "Urgence et orientation:": "Ijans ak oryantasyon:",
  "Contribution MonCash:": "Kontribisyon MonCash:",
  "Chaque don de sang peut aider jusqu'à trois personnes.": "Chak don san ka ede jiska twa moun.",
  "Mobilisez votre quartier, trouvez un point de collecte et laissez vos coordonnées pour être recontacté lors de la prochaine campagne.": "Mobilize katye ou, jwenn yon kote yo kolekte san, epi kite kontak ou pou ekip la rele ou nan pwochen kanpay la.",
  "Prendre engagement": "Pran angajman",
  "Voir les centres": "Gade sant yo",
  "Objectif du mois": "Objektif mwa a",
  "promesses de don": "pwomès don",
  "Données protégées": "Done pwoteje",
  "Contacts vérifiés": "Kontak verifye",
  "Suivi administrateur": "Swivi administratè",
  "pour le prélèvement": "pou pran san an",
  "entre deux dons": "ant de don",
  "âge général recommandé": "laj jeneral yo rekòmande",
  "Fonctionnement": "Fonksyònman",
  "Un parcours simple et organisé": "Yon chemen senp epi òganize",
  "Le site aide l'équipe à recevoir, vérifier et suivre les demandes sans perdre les informations importantes.": "Sit la ede ekip la resevwa, verifye epi swiv demann yo san pèdi enfÃ²masyon enpÃ²tan yo.",
  "Inscription ou demande": "Enskripsyon oswa demann",
  "Le visiteur remplit le formulaire adapté à sa situation: donner du sang ou faire une demande.": "Vizitè a ranpli fÃ²m ki adapte ak sitiyasyon li: bay san oswa fè yon demann.",
  "Vérification": "Verifikasyon",
  "L'équipe consulte les informations dans l'espace admin et vérifie les contacts nécessaires.": "Ekip la gade enfÃ²masyon yo nan espas admin nan epi verifye kontak ki nesesè yo.",
  "Suivi rapide": "Swivi rapid",
  "Les messages WhatsApp et les filtres par groupe sanguin facilitent la coordination.": "Mesaj WhatsApp yo ak filtè pa gwoup san yo rann kowÃ²dinasyon an pi fasil.",
  "Pourquoi participer": "Poukisa patisipe",
  "Un geste simple, un impact immédiat": "Yon jès senp, yon gwo enpak",
  "Les hôpitaux ont besoin de réserves disponibles pour les urgences, les accouchements, les chirurgies et les traitements de longue durée. Donner régulièrement aide à garder cette chaîne de solidarité active.": "Lopital yo bezwen rezèv san pou ijans, akouchman, operasyon ak tretman ki dire lontan. Bay san regilyèman ede kenbe chèn solidarite sa a vivan.",
  "Sécurisé": "An sekirite",
  "Le matériel est stérile, à usage unique, et l'équipe médicale vérifie votre état avant le don.": "Materyèl la esteril, yo itilize li yon sèl fwa, epi ekip medikal la verifye eta ou avan don an.",
  "Solidaire": "Solidè",
  "Votre don peut soutenir plusieurs patients selon les composants sanguins séparés.": "Don ou a ka ede plizyè pasyan selon konpozan san yo separe.",
  "Rapide": "Rapid",
  "Prévoir environ 45 minutes avec l'accueil, l'entretien, le don et la collation.": "Prevwa anviwon 45 minit pou resepsyon, entèvyou, don an ak ti kolasyon an.",
  "Accompagné": "Akonpaye",
  "Une équipe vous guide avant, pendant et après le don, surtout si c'est votre première fois.": "Yon ekip ap gide ou avan, pandan ak apre don an, sitou si se premye fwa ou.",
  "Conseils pratiques": "Konsèy pratik",
  "Bien se préparer avant et après le don": "Prepare byen avan ak apre don an",
  "Ces conseils aident les donneurs à arriver plus confiants et mieux préparés.": "Konsèy sa yo ede donatè yo vini ak plis konfyans epi pi byen prepare.",
  "Avant le don": "Avan don an",
  "Dormir suffisamment la veille.": "Dòmi ase lavèy.",
  "Manger un repas léger, sans excès de gras.": "Manje yon repa lejè, san twÃ²p grès.",
  "Boire de l'eau avant de venir.": "Bwè dlo avan ou vini.",
  "Pendant la visite": "Pandan vizit la",
  "Signaler tout malaise ou traitement médical.": "Fè konnen tout malèz oswa tretman medikal.",
  "Rester détendu pendant le prélèvement.": "Rete kalm pandan y ap pran san an.",
  "Suivre les indications de l'équipe.": "Swiv konsèy ekip la.",
  "Après le don": "Apre don an",
  "Prendre la collation proposée.": "Pran ti kolasyon yo bay la.",
  "Éviter les efforts physiques importants.": "Evite gwo efò fizik.",
  "Boire régulièrement dans la journée.": "Bwè dlo regilyèman pandan jounen an.",
  "Avant de donner": "Avan ou bay san",
  "Conditions générales pour un don": "Kondisyon jeneral pou bay san",
  "Une vérification médicale reste toujours nécessaire le jour du don.": "Yon verifikasyon medikal toujou nesesè jou don an.",
  "Age": "Laj",
  "Avoir généralement entre 18 et 65 ans.": "An jeneral, ou dwe gen ant 18 ak 65 lane.",
  "État de santé": "Eta santé",
  "Se sentir en forme, sans fièvre ni infection récente.": "Ou dwe santi ou anfÃ²m, san lafyèv ni enfeksyon resan.",
  "Repas": "Manje",
  "Avoir mangé légèrement et bien s'hydrater avant le don.": "Manje lejè epi bwè ase dlo avan don an.",
  "Documents": "Dokiman",
  "Présenter une pièce d'identité ou un contact fiable.": "Prezante yon pyès idantite oswa yon kontak fyab.",
  "Groupes sanguins recherchés": "Gwoup san y ap chèche semèn sa a",
  "Ces niveaux sont indicatifs pour afficher les priorités de campagne. Les responsables peuvent les modifier dans le code selon la situation.": "Nivo sa yo se endikasyon pou montre priyorite kanpay la. Responsab yo ka modifye yo nan kòd la selon sitiyasyon an.",
  "Critique": "Kritik",
  "Élevé": "Wo",
  "Moyen": "Mwayen",
  "Stable": "Estab",
  "Trouver un centre": "Jwenn yon sant",
  "Points de collecte disponibles": "Kote koleksyon ki disponib",
  "Rechercher": "Chèche",
  "Lundi - Mercredi, 8h00 - 14h00": "Lendi - Mèkredi, 8h00 - 14h00",
  "Samedi, 9h00 - 13h00": "Samdi, 9h00 - 13h00",
  "Vendredi, 8h30 - 12h30": "Vandredi, 8h30 - 12h30",
  "Questions fréquentes": "Kesyon moun poze souvan",
  "Ce que les donneurs demandent souvent": "Sa donatè yo mande souvan",
  "Est-ce que le don de sang fait mal?": "Èske bay san fè mal?",
  "La piqûre peut être légèrement sensible, mais le prélèvement est court et accompagné par une équipe médicale.": "Piki a ka yon ti jan sansib, men pran san an fèt vit epi ekip medikal la akonpaye ou.",
  "Combien de temps dure toute la visite ?": "Konbyen tan tout vizit la dire?",
  "Il faut souvent prévoir environ 45 minutes avec l'accueil, l'entretien, le don et le repos.": "Souvan ou dwe prevwa anviwon 45 minit pou resepsyon, entèvyou, don an ak repo.",
  "Dois-je connaître mon groupe sanguin?": "Èske mwen dwe konnen gwoup san mwen?",
  "Non. Vous pouvez donner même si vous ne le connaissez pas; il pourra être identifié lors du processus.": "Non. Ou ka bay san menm si ou pa konnen li; yo ka idantifye li pandan pwosesis la.",
  "Que faire après le don?": "Kisa pou fè apre don an?",
  "Boire de l'eau, manger la collation proposée et éviter les efforts physiques importants pendant quelques heures.": "Bwè dlo, manje ti kolasyon yo bay la epi evite gwo efò fizik pandan kèk èdtan.",
  "Témoignages": "Temwayaj",
  "Ils ont choisi de participer": "Yo chwazi patisipe",
  "\"J'avais peur au début, mais l'équipe m'a accompagnée du début à la fin.\"": "\"Mwen te pè okÃ²mansman, men ekip la te akonpaye m depi kÃ²mansman rive nan fen.\"",
  "Marline, donneuse": "Marline, donatè",
  "\"Une demande partagée rapidement nous a aidés à trouver des donneurs compatibles.\"": "\"Yon demann ki te pataje rapidman te ede nou jwenn donatè ki konpatib.\"",
  "Samuel, proche de patient": "Samuel, fanmi pasyan",
  "\"Organiser une collecte dans notre école a motivé beaucoup de jeunes.\"": "\"Ã’ganize yon koleksyon nan lekÃ²l nou an te motive anpil jèn.\"",
  "Nadine, responsable communautaire": "Nadine, responsab kominotè",
  "Besoin d'assistance": "Bezwen asistans",
  "Faire une demande de sang": "Fè yon demann san",
  "Ce formulaire permet de signaler un besoin. Pour une urgence vitale, contactez directement un hôpital ou les services d'urgence.": "FÃ²m sa a pèmèt ou siyale yon bezwen. Pou yon ijans grav, kontakte lopital oswa sèvis ijans dirèkteman.",
  "Ligne d'urgence": "Liy ijans",
  "Disponible pour orienter les demandes prioritaires.": "Disponib pou oryante demann ki pi ijan yo.",
  "Nom du demandeur": "Non moun k ap mande a",
  "Téléphone": "Telefòn",
  "Groupe recherché": "Gwoup y ap chèche",
  "Choisir": "Chwazi",
  "Je ne sais pas": "Mwen pa konnen",
  "Niveau d'urgence": "Nivo ijans",
  "Urgent aujourd'hui": "Ijan jodi a",
  "Dans 24-48h": "Nan 24-48 èdtan",
  "Planifié": "Planifye",
  "Hôpital ou clinique": "Lopital oswa klinik",
  "Ville ou quartier": "Vil oswa katye",
  "Détails utiles": "Detay itil",
  "Paiement ou contribution": "Peman oswa kontribisyon",
  "Reçu de contribution": "Resi kontribisyon",
  "R-0000": "R-0000",
  "Groupe demandé": "Gwoup yo mande",
  "Méthode": "Metòd",
  "Référence": "Referans",
  "Date": "Dat",
  "Ce reçu confirme l'enregistrement d'une contribution logistique. Il ne constitue pas une vente de sang.": "Resi sa a konfime anrejistreman yon kontribisyon lojistik. Li pa reprezante yon vant san.",
  "Imprimer le reçu": "Enprime resi a",
  "Le sang n'est pas vendu. Cette partie sert uniquement à enregistrer des frais approuvés ou une contribution logistique obligatoire, selon les règles de votre organisation.": "Yo pa vann san. Pati sa a sèvi sèlman pou anrejistre frè ki apwouve oswa kontribisyon lojistik obligatwa, selon règ Ã²ganizasyon an.",
  "Mode de paiement": "Metòd peman",
  "Après le paiement, entrez la référence de transaction ci-dessous.": "Apre peman an, antre referans tranzaksyon an anba a.",
  "Montant": "Kantite lajan",
  "Référence de transaction": "Referans tranzaksyon",
  "MonCash": "MonCash",
  "NatCash": "NatCash",
  "Virement bancaire": "Transfè labank",
  "Espèces au bureau": "Lajan kach nan biwo",
  "Envoyer la demande": "Voye demann nan",
  "Préparer le message WhatsApp": "Prepare mesaj WhatsApp la",
  "Passer à l'action": "Aji kounye a",
  "Je souhaite être contacté pour donner": "Mwen vle yo kontakte m pou bay san",
  "Remplissez ce formulaire de promesse. Une équipe pourra confirmer votre éligibilité et vous proposer le centre le plus pratique.": "Ranpli fÃ²m pwomès sa a. Yon ekip ap kapab konfime si ou elijib epi pwopoze sant ki pi pratik pou ou.",
  "Nom complet": "Non konplè",
  "Groupe sanguin": "Gwoup san",
  "Disponibilité": "Disponibilite",
  "J'accepte d'être contacté au sujet d'une campagne de don de sang et je comprends que mes informations seront conservées localement par l'équipe.": "Mwen dakÃ² pou yo kontakte m sou yon kanpay don san, epi mwen konprann ekip la ap konsève enfÃ²masyon mwen lokalman.",
  "Envoyer ma promesse": "Voye pwomès mwen",
  "Contacts utiles": "Kontak itil",
  "Téléphones et emails pour les donneurs": "Telefòn ak imèl pou donatè yo",
  "Remplacez ces coordonnées par celles de votre équipe ou de votre centre.": "Ranplase kowÃ²done sa yo ak pa ekip ou oswa sant ou.",
  "Coordination des dons": "Kowòdinasyon don yo",
  "Demandes urgentes": "Demann ijan",
  "Campagnes et partenariats": "Kanpay ak patenarya",
  "Espace administrateur": "Espas administratè",
  "Suivi local des donneurs et demandes": "Swivi lokal donatè ak demann yo",
  "Les données sont conservées seulement dans ce navigateur avec localStorage.": "Done yo konsève sèlman nan navigatè sa a ak localStorage.",
  "Protection des données personnelles": "Pwoteksyon done pèsonèl",
  "L'accès aux contacts est verrouillé. Les numéros et demandes ne doivent être consultés que par les personnes autorisées pour organiser les dons ou répondre aux urgences.": "Aksè ak kontak yo fèmen. Se sèlman moun ki otorize ki dwe konsilte nimewo ak demann yo pou òganize don oswa reponn ijans.",
  "Code administrateur": "Kòd administratè",
  "Déverrouiller": "Debloke",
  "Filtrer par groupe sanguin": "Filtre pa gwoup san",
  "Tous les groupes": "Tout gwoup yo",
  "Verrouiller": "Fèmen",
  "Effacer les données locales": "Efase done lokal yo",
  "donneurs inscrits": "donatè ki enskri",
  "demandes reçues": "demann ki resevwa",
  "donneurs compatibles visibles": "donatè konpatib ki vizib",
  "Promesses de don": "Pwomès don",
  "Nom": "Non",
  "Groupe": "Gwoup",
  "Ville": "Vil",
  "Demandes de sang": "Demann san",
  "Urgence": "Ijans",
  "Paiement": "Peman",
  "En cas d'urgence médicale, contactez directement un centre de santé ou les services compétents.": "Si gen ijans medikal, kontakte yon sant santé oswa sèvis konpetan yo dirèkteman.",
  "WhatsApp": "WhatsApp"
};

const kreyolPlaceholders = {
  "Ville, quartier ou jour": "Vil, katye oswa jou",
  "Exemple: nombre de poches, service, contact médical": "Egzanp: kantite sak san, sèvis, kontak medikal",
  "Exemple: 500": "Egzanp: 500",
  "Code MonCash, reçu ou note interne": "Kòd MonCash, resi oswa nÃ²t entèn",
  "Exemple: samedi matin, après 10h": "Egzanp: samdi maten, apre 10è",
  "Entrer le code": "Antre kòd la"
};

const PARTICLE_COUNT = state.isMobile ? 18 : 34;
const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
  x: Math.random(),
  y: Math.random(),
  radius: 8 + Math.random() * 24,
  speed: 0.0008 + Math.random() * 0.0018,
  phase: i * 0.7,
  color: i % 4 === 0 ? "rgba(15, 118, 110, 0.18)" : "rgba(181, 31, 50, 0.16)"
}));


function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16);
}

function isValidHaïtianPhone(phone) {
  if (!phone) return false;
  const clean = phone.replace(/[\s\-\.\(\)]/g, "");
  return CONFIG.phonePattern.test(clean);
}

function announceMessage(element, message, priority = "polite") {
  if (!element) return;
  element.textContent = message;
  element.setAttribute("role", "status");
  element.setAttribute("aria-live", priority);
  setTimeout(() => element.setAttribute("aria-live", "off"), 1500);
}

function readRecords(key) {
  try {
    const item = localStorage.getItem(key);
    if (!item) return [];
    const parsed = JSON.parse(item);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn(`Erreur lecture ${key}:`, error);
    return [];
  }
}

function saveRecord(key, record) {
  try {
    const records = readRecords(key);
    records.unshift(record);
    localStorage.setItem(key, JSON.stringify(records));
    return true;
  } catch (error) {
    console.error(`Erreur sauvegarde ${key}:`, error);
    if (error.name === "QuotaExceededError") alert("Stockage plein. Veuillez exporter ou effacer d'anciennes données.");
    return false;
  }
}

async function saveToApi(endpoint, payload) {
  try {
    const response = await fetch(CONFIG.apiUrl + endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error("Réponse API invalide");
    return await response.json();
  } catch (error) {
    console.warn("API indisponible, conservation locale uniquement.", error);
    return null;
  }
}

async function fetchFromApi(endpoint) {
  try {
    const response = await fetch(CONFIG.apiUrl + endpoint, { headers: { "ngrok-skip-browser-warning": "true" } });
    if (!response.ok) throw new Error("Réponse API invalide");
    return await response.json();
  } catch (error) {
    console.warn(`API indisponible pour ${endpoint}, repli sur les données locales.`, error);
    return null;
  }
}

async function deleteFromApi(endpoint) {
  try {
    const response = await fetch(CONFIG.apiUrl + endpoint, { method: "DELETE", headers: { "ngrok-skip-browser-warning": "true" } });
    if (!response.ok) throw new Error("Réponse API invalide");
    return await response.json();
  } catch (error) {
    console.warn(`Suppression serveur échouée pour ${endpoint}.`, error);
    return null;
  }
}
function mapApiDonor(row) {
  return {
    id: row.id,
    name: row.nom,
    phone: row.telephone,
    bloodType: row.groupe_sanguin,
    city: row.ville,
    availability: row.disponibilite,
    createdAt: row.date_creation ? new Date(row.date_creation).toLocaleString("fr-FR") : ""
  };
}

function mapApiRequest(row) {
  return {
    id: row.id,
    requesterName: row.nom_demandeur,
    requesterPhone: row.telephone,
    neededBloodType: row.groupe_recherche,
    urgency: row.urgence,
    hospital: row.hopital,
    requestCity: row.ville,
    requestDetails: row.details,
    paymentMethod: row.mode_paiement,
    paymentAmount: row.montant,
    paymentReference: row.reference_transaction,
    paymentStatus: row.mode_paiement && row.mode_paiement !== "Aucun paiement"
      ? [row.mode_paiement, row.montant ? `${row.montant} HTG` : "", row.reference_transaction ? `Ref: ${row.reference_transaction}` : ""].filter(Boolean).join(" - ")
      : "Contribution manquante",
    createdAt: row.date_creation ? new Date(row.date_creation).toLocaleString("fr-FR") : ""
  };
}

async function exportData() {
  try {
    const [apiDonors, apiRequests] = await Promise.all([
      fetchFromApi("/donors.php"),
      fetchFromApi("/requests.php")
    ]);
    const data = {
      donors: apiDonors ? apiDonors.map(mapApiDonor) : readRecords(CONFIG.storageKeys.donors),
      requests: apiRequests ? apiRequests.map(mapApiRequest) : readRecords(CONFIG.storageKeys.requests),
      source: apiDonors && apiRequests ? "server" : "local-fallback",
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `don-sang-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    return true;
  } catch (e) { console.error("Export échoué:", e); return false; }
}

function createReceiptNumber() {
  const d = new Date();
  const datePart = [d.getFullYear(), String(d.getMonth()+1).padStart(2,'0'), String(d.getDate()).padStart(2,'0')].join("");
  return `R-${datePart}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
}

function buildPaymentStatus(formData) {
  const method = String(formData.get("paymentMethod") || "").trim();
  const amount = String(formData.get("paymentAmount") || "").trim();
  const reference = String(formData.get("paymentReference") || "").trim();
  if (!method || method === "Aucun paiement") return "Contribution manquante";
  return [method, amount ? `${amount} HTG` : "", reference ? `Ref: ${reference}` : ""].filter(Boolean).join(" - ");
}

function formatPaymentForMessage(request) {
  const method = request.paymentMethod || "non précisé";
  const amount = request.paymentAmount ? `${request.paymentAmount} HTG` : "montant non précisé";
  const reference = request.paymentReference ? `Ref: ${request.paymentReference}` : "sans référence";
  return `${method} - ${amount} - ${reference}`;
}

function buildWhatsappMessage(request) {
  const isHT = state.currentLanguage === "ht";
  return (isHT ? [
    "Bonjou, demann san:",
    `Gwoup: ${request.neededBloodType || "pou konfime"}`,
    `Ijans: ${request.urgency || "pou presize"}`,
    `Lopital: ${request.hospital || "pou presize"}`,
    `Vil: ${request.requestCity || "pou presize"}`,
    `Kontak: ${request.requesterName || "non"} - ${request.requesterPhone || "telefòn"}`,
    `MonCash: ${CONFIG.moncashPhone}`,
    `Peman: ${formatPaymentForMessage(request)}`,
    `Detay: ${request.requestDetails || "pa gen detay"}`
  ] : [
    "Bonjour, demande de sang:",
    `Groupe: ${request.neededBloodType || "à confirmer"}`,
    `Urgence: ${request.urgency || "à préciser"}`,
    `Hôpital: ${request.hospital || "à préciser"}`,
    `Ville: ${request.requestCity || "à préciser"}`,
    `Contact: ${request.requesterName || "nom"} - ${request.requesterPhone || "téléphone"}`,
    `MonCash: ${CONFIG.moncashPhone}`,
    `Paiement: ${formatPaymentForMessage(request)}`,
    `Détails: ${request.requestDetails || "aucun détail"}`
  ]).join("\n");
}

function maskPrivateValue(value, field) {
  if (!value) return "-";
  const lf = field.toLowerCase();
  if (lf.includes("phone")) return "**** " + String(value).slice(-4);
  if (lf.includes("name")) return String(value).charAt(0).toUpperCase() + ".";
  return value;
}

function renderRows(target, records, fields, emptyMessage, showPrivate) {
  target.innerHTML = "";
  if (records.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.className = "empty-row";
    cell.colSpan = fields.length;
    cell.textContent = emptyMessage;
    row.appendChild(cell);
    target.appendChild(row);
    return;
  }
  records.forEach(record => {
    const row = document.createElement("tr");
    fields.forEach(field => {
      const cell = document.createElement("td");
      cell.textContent = showPrivate ? (record[field] || "-") : maskPrivateValue(record[field], field);
      row.appendChild(cell);
    });
    target.appendChild(row);
  });
}

function applyReceiptPrintSettings() {
  if (!DOM.contributionReceipt) return;
  const paper = DOM.receiptPaper?.value || "a4";
  
  DOM.contributionReceipt.dataset.paper = paper;
}

function getReceiptPrintCss(paper) {
  const baseWidth = paper === "ticket" ? "80mm" : paper === "a5" ? "148mm" : "190mm";
  const baseFont = paper === "ticket" ? "11px" : "14px";
  const detailColumns = paper === "ticket" ? "1fr" : "repeat(2, minmax(0, 1fr))";
  const pageMargin = paper === "ticket" ? "2mm" : "10mm";
  return `
    @page { size: ${paper === "ticket" ? "80mm auto" : paper === "a5" ? "A5 portrait" : "A4 portrait"}; margin: ${pageMargin}; }
    * { box-sizing: border-box; }
    body { margin: 0; padding: 0; color: #111827; background: white; font-family: Arial, Helvetica, sans-serif; font-size: ${baseFont}; }
    .receipt-card { width: ${baseWidth}; max-width: 100%; margin: 0 auto; padding: ${paper === "ticket" ? "6mm" : "10mm"}; border: 1px solid #111827; background: white; display: grid; gap: 14px; }
    .receipt-header { display: flex; justify-content: space-between; gap: 14px; border-bottom: 1px solid #d1d5db; padding-bottom: 10px; }
    .receipt-header h3 { margin: 0; font-size: ${paper === "ticket" ? "15px" : "20px"}; }
    .eyebrow { margin: 0 0 4px; color: #991b1b; font-weight: 700; text-transform: uppercase; font-size: 11px; }
    .receipt-header strong { color: #991b1b; white-space: nowrap; }
    .receipt-details { display: grid; grid-template-columns: ${detailColumns}; gap: 8px; margin: 0; }
    .receipt-details div { padding: 8px; border: 1px solid #d1d5db; }
    .receipt-details dt { color: #6b7280; font-weight: 700; font-size: 12px; }
    .receipt-details dd { margin: 3px 0 0; font-weight: 700; overflow-wrap: anywhere; }
    .receipt-note { margin: 0; color: #4b5563; line-height: 1.45; }
    .receipt-print-settings, #printReceipt { display: none !important; }
  `;
}

let isPrintingReceipt = false;

function printReceiptOnly() {
  if (!DOM.contributionReceipt || DOM.contributionReceipt.classList.contains("is-hidden")) {
    alert("Veuillez d'abord envoyer la demande pour générer le reçu.");
    return;
  }
  
  if (isPrintingReceipt) return;
  isPrintingReceipt = true;
  DOM.printReceipt && (DOM.printReceipt.disabled = true);

  const releasePrintLock = () => {
    isPrintingReceipt = false;
    DOM.printReceipt && (DOM.printReceipt.disabled = false);
  };

  applyReceiptPrintSettings();
  const paper = DOM.receiptPaper?.value || "a4";
  const receipt = DOM.contributionReceipt.cloneNode(true);
  receipt.classList.remove("is-hidden");
  receipt.querySelector(".receipt-print-settings")?.remove();
  receipt.querySelector("#printReceipt")?.remove();
  if (DOM.receiptIncludeNote && !DOM.receiptIncludeNote.checked) {
    receipt.querySelector("#receiptNote")?.remove();
  }

  let printWindow;
  try {
    printWindow = window.open("", "_blank", "width=820,height=720");
  } catch (error) {
    printWindow = null;
  }

  
  if (!printWindow) {
    announceMessage(
      DOM.requestMessage,
      localize(
        "Impression bloquée par le navigateur. Autorisez les fenêtres pop-up pour ce site, ou utilisez le bouton Imprimer.",
        "Navigatè a bloke enpresyon an. Otorize fenèt pop-up pou sit sa a, oswa itilize bouton Enprime a."
      ),
      "assertive"
    );
    releasePrintLock();
    return;
  }

  let settled = false;
  const finalizePrint = () => {
    if (settled) return;
    settled = true;
    try { printWindow.print(); } catch (error) { console.warn("Échec impression:", error); }
  };

  
  printWindow.onafterprint = () => {
    printWindow.close();
    releasePrintLock();
  };

  const safetyTimeout = setTimeout(() => {
    if (!printWindow.closed) printWindow.close();
    releasePrintLock();
  }, 5000);

  printWindow.addEventListener("unload", () => clearTimeout(safetyTimeout), { once: true });

  printWindow.document.open();
  printWindow.document.write(`<!doctype html>
    <html lang="fr">
      <head>
        <meta charset="utf-8">
        <title>Impression du reçu</title>
        <style>${getReceiptPrintCss(paper)}</style>
      </head>
      <body onload="window.focus()">${receipt.outerHTML}</body>
    </html>`);
  printWindow.document.close();

  if (printWindow.document.readyState === "complete") {
    finalizePrint();
  } else {
    printWindow.addEventListener("load", finalizePrint, { once: true });
    setTimeout(finalizePrint, 600);
  }
}

function applyStoredReceiptPreferences() {

  try {
    const storedAutoPrint = localStorage.getItem(CONFIG.storageKeys.receiptAutoPrint);
    if (DOM.receiptAutoPrint && storedAutoPrint !== null) {
      DOM.receiptAutoPrint.checked = storedAutoPrint === "true";
    }
    const storedPaper = localStorage.getItem(CONFIG.storageKeys.receiptPaper);
    if (DOM.receiptPaper && storedPaper) {
      DOM.receiptPaper.value = storedPaper;
    }
  } catch (error) {
    console.warn("Préférences de reçu non disponibles:", error);
  }
}

function saveReceiptPreferences() {
  try {
    if (DOM.receiptAutoPrint) {
      localStorage.setItem(CONFIG.storageKeys.receiptAutoPrint, String(DOM.receiptAutoPrint.checked));
    }
    if (DOM.receiptPaper) {
      localStorage.setItem(CONFIG.storageKeys.receiptPaper, DOM.receiptPaper.value);
    }
  } catch (error) {
    console.warn("Impossible d'enregistrer les préférences de reçu:", error);
  }
}

function renderReceipt(request) {
  if (!request) return;
  if (!DOM.contributionReceipt || !DOM.receiptFields.number) return;
  DOM.receiptFields.number.textContent = request.receiptNumber;
  DOM.receiptFields.name.textContent = request.requesterName || "-";
  DOM.receiptFields.phone.textContent = request.requesterPhone || "-";
  DOM.receiptFields.bloodType.textContent = request.neededBloodType || "-";
  DOM.receiptFields.method.textContent = request.paymentMethod || "-";
  DOM.receiptFields.amount.textContent = request.paymentAmount ? `${request.paymentAmount} HTG` : "-";
  DOM.receiptFields.reference.textContent = request.paymentReference || "-";
  DOM.receiptFields.date.textContent = request.createdAt || "-";
  DOM.contributionReceipt.classList.remove("is-hidden");
  applyStoredReceiptPreferences();
  applyReceiptPrintSettings();
  if (DOM.receiptAutoPrint?.checked) {
    announceMessage(
      DOM.requestMessage,
      localize(
        "Reçu généré. Ouverture de l'impression automatique...",
        "Resi a kreye. Y ap louvri enpresyon otomatik la..."
      )
    );
    setTimeout(printReceiptOnly, 250);
  }
}

async function renderAdmin() {
 
  if (!DOM.admin.counts.donors || !DOM.admin.counts.requests || !DOM.admin.counts.matches) return;

  const [apiDonors, apiRequests] = await Promise.all([
    fetchFromApi("/donors.php"),
    fetchFromApi("/requests.php")
  ]);

  const donors = apiDonors ? apiDonors.map(mapApiDonor) : readRecords(CONFIG.storageKeys.donors);
  const requests = apiRequests ? apiRequests.map(mapApiRequest) : readRecords(CONFIG.storageKeys.requests);
  const usingLocalFallback = !apiDonors || !apiRequests;

  const filter = DOM.admin.bloodFilter?.value || "";
  const filteredDonors = donors.filter(d => !filter || (compatibleDonors[filter] || [filter]).includes(d.bloodType));

  DOM.admin.counts.donors.textContent = donors.length;
  DOM.admin.counts.requests.textContent = requests.length;
  DOM.admin.counts.matches.textContent = filteredDonors.length;

  if (DOM.admin.donorTable) {
    renderRows(DOM.admin.donorTable, filteredDonors, ["name","phone","bloodType","city"],
      localize("Aucun donneur enregistré.", "Pa gen donatè ki anrejistre."), state.adminUnlocked);
  }
  if (DOM.admin.requestTable) {
    renderRows(DOM.admin.requestTable, requests, ["requesterName","requesterPhone","neededBloodType","urgency","paymentStatus"],
      localize("Aucune demande enregistrée.", "Pa gen demann ki anrejistre."), state.adminUnlocked);
  }

  if (DOM.admin.message && usingLocalFallback && state.adminUnlocked) {
    announceMessage(DOM.admin.message, localize(
      "Serveur indisponible : affichage des données locales uniquement.",
      "Sèvè a pa disponib : se done lokal yo k ap montre."
    ), "assertive");
    DOM.admin.message.style.color = "var(--gold)";
  }
}

function localize(fr, ht) {
  return state.currentLanguage === "ht" ? ht : fr;
}

function setLanguage(lang) {
  state.currentLanguage = lang;
  document.documentElement.dataset.language = lang;
  document.documentElement.lang = lang === "ht" ? "ht" : "fr";
  translateTextNodes(document.body, lang);
  translatePlaceholders(lang);
  if (DOM.languageToggle) {
    DOM.languageToggle.textContent = lang === "ht" ? "Français" : "Kreyòl";
    DOM.languageToggle.setAttribute("aria-label", localize("Changer de langue", "Chanje lang"));
  }
  renderAdmin();
  try { localStorage.setItem(CONFIG.storageKeys.lang, lang); } catch(e) {}
}

function translateTextNodes(root, language) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.textContent.trim()) return NodeFilter.FILTER_REJECT;
      const parent = node.parentElement;
      if (!parent || ["SCRIPT", "STYLE", "OPTION", "META"].includes(parent.tagName)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);

  nodes.forEach(node => {
    if (!node.frText) node.frText = node.textContent.trim().replace(/\s+/g, " ");
    const leading = node.textContent.match(/^\s*/)[0];
    const trailing = node.textContent.match(/\s*$/)[0];
    const translated = language === "ht" ? (kreyolText[node.frText] || node.frText) : node.frText;
    node.textContent = `${leading}${translated}${trailing}`;
  });
}

function translatePlaceholders(language) {
  document.querySelectorAll("[placeholder]").forEach(el => {
    if (!el.dataset.frPlaceholder) el.dataset.frPlaceholder = el.getAttribute("placeholder");
    const orig = el.dataset.frPlaceholder;
    el.setAttribute("placeholder", language === "ht" ? (kreyolPlaceholders[orig] || orig) : orig);
  });
}

function resizeCanvas() {
  if (!DOM.canvas) return;
  const ratio = window.devicePixelRatio || 1;
  DOM.canvas.width = Math.floor(DOM.canvas.offsetWidth * ratio);
  DOM.canvas.height = Math.floor(DOM.canvas.offsetHeight * ratio);
  DOM.canvas.getContext("2d").setTransform(ratio, 0, 0, ratio, 0, 0);
}

function draw(time = 0) {
  if (!DOM.canvas) return;
  const ctx = DOM.canvas.getContext("2d");
  const w = DOM.canvas.offsetWidth, h = DOM.canvas.offsetHeight;
  ctx.clearRect(0, 0, w, h);
  particles.forEach(p => {
    const drift = (time * p.speed + p.phase) % (Math.PI * 2);
    ctx.beginPath();
    ctx.fillStyle = p.color;
    ctx.ellipse(p.x * w + Math.cos(drift) * 34, p.y * h + Math.sin(drift * 0.8) * 24, p.radius * 0.72, p.radius, drift, 0, Math.PI * 2);
    ctx.fill();
  });
  state.animationFrameId = requestAnimationFrame(draw);
}


function initEventListeners() {
  DOM.searchInput?.addEventListener("input", () => {
    const q = DOM.searchInput.value.trim().toLowerCase();
    DOM.centerCards.forEach(c => c.classList.toggle("is-hidden", q && !(`${c.textContent} ${c.dataset.keywords}`).toLowerCase().includes(q)));
  });

  DOM.pledgeForm?.addEventListener("submit", async e => {
    e.preventDefault();
    const fd = new FormData(DOM.pledgeForm);
    const phone = String(fd.get("phone")||"").trim();
    if (!isValidHaïtianPhone(phone)) { announceMessage(DOM.formMessage, localize("Veuillez entrer un numéro haïtien valide.", "Tanpri antre yon nimewo ayisyen valab."), "assertive"); DOM.formMessage.style.color = "var(--red)"; return; }
    const name = String(fd.get("name")||"").trim();
    const donorRecord = { name, phone, bloodType: fd.get("bloodType"), city: fd.get("city"), availability: fd.get("availability"), createdAt: new Date().toLocaleString("fr-FR") };
    await saveToApi("/donors.php", donorRecord);
    if (saveRecord(CONFIG.storageKeys.donors, donorRecord)) {
      renderAdmin();
      announceMessage(DOM.formMessage, localize(`${name.split(" ")[0]||"Merci"}, promesse sauvegardée.`, `${name.split(" ")[0]||"Mèsi"}, pwomès anrejistre.`));
      DOM.formMessage.style.color = "var(--teal)"; DOM.pledgeForm.reset();
    }
  });

  if (DOM.requestForm && !DOM.requestForm.dataset.serverMultipart) {
    DOM.requestForm.addEventListener("submit", async e => {
      e.preventDefault();
      const fd = new FormData(DOM.requestForm);
      const phone = String(fd.get("requesterPhone")||"").trim();
      if (!isValidHaïtianPhone(phone)) { announceMessage(DOM.requestMessage, localize("Veuillez entrer un numéro haïtien valide.", "Tanpri antre yon nimewo ayisyen valab."), "assertive"); DOM.requestMessage.style.color = "var(--red)"; return; }
      const name = String(fd.get("requesterName")||"").trim();
      const blood = fd.get("neededBloodType") || "le groupe demandé";
      const req = { requesterName: name, requesterPhone: phone, neededBloodType: blood, urgency: fd.get("urgency"), hospital: fd.get("hospital"), requestCity: fd.get("requestCity"), requestDetails: fd.get("requestDetails"), paymentMethod: fd.get("paymentMethod"), paymentAmount: fd.get("paymentAmount"), paymentReference: fd.get("paymentReference"), paymentStatus: buildPaymentStatus(fd), receiptNumber: createReceiptNumber(), createdAt: new Date().toLocaleString("fr-FR") };
      await saveToApi("/requests.php", req);
      if (saveRecord(CONFIG.storageKeys.requests, req)) {
        renderAdmin(); renderReceipt(req);
        DOM.requestWhatsapp.href = `https://wa.me/${CONFIG.emergencyPhone}?text=${encodeURIComponent(buildWhatsappMessage(req))}`;
        announceMessage(DOM.requestMessage, localize(`${name.split(" ")[0]||"Merci"}, demande sauvegardée.`, `${name.split(" ")[0]||"Mèsi"}, demann anrejistre.`));
        DOM.requestMessage.style.color = "var(--teal)"; DOM.requestForm.reset();
      }
    });
  }

  DOM.requestForm?.addEventListener("input", () => {
    const fd = new FormData(DOM.requestForm);
    DOM.requestWhatsapp.href = `https://wa.me/${CONFIG.emergencyPhone}?text=${encodeURIComponent(buildWhatsappMessage(Object.fromEntries(fd.entries())))}`;
  });

  DOM.receiptPaper?.addEventListener("change", () => { applyReceiptPrintSettings(); saveReceiptPreferences(); });
  DOM.receiptAutoPrint?.addEventListener("change", saveReceiptPreferences);
  DOM.printReceipt?.addEventListener("click", printReceiptOnly);
  if (!window.DON_SANG_SERVER_ADMIN) {
    DOM.admin.bloodFilter?.addEventListener("change", renderAdmin);
    DOM.admin.clearData?.addEventListener("click", async () => {
      if (!state.adminUnlocked || !confirm(localize("Effacer toutes les données?", "Efase tout done?"))) return;
      localStorage.removeItem(CONFIG.storageKeys.donors); localStorage.removeItem(CONFIG.storageKeys.requests);
      const [donorsDeleted, requestsDeleted] = await Promise.all([
        deleteFromApi("/donors.php"),
        deleteFromApi("/requests.php")
      ]);
      await renderAdmin();
      if (donorsDeleted && requestsDeleted) {
        announceMessage(DOM.admin.message, localize("Données effacées.", "Done efase."));
        DOM.admin.message.style.color = "var(--teal)";
      } else {
        announceMessage(DOM.admin.message, localize(
          "Données locales effacées, mais le serveur n'a pas pu être joint.",
          "Done lokal efase, men nou pa t ka rive jwenn sèvè a."
        ), "assertive");
        DOM.admin.message.style.color = "var(--red)";
      }
    });
    DOM.admin.exportData?.addEventListener("click", async () => { if (!state.adminUnlocked) return; if (await exportData()) announceMessage(DOM.admin.message, localize("Export réussi !", "Ekspò reyisi !")); });

    DOM.admin.unlockBtn?.addEventListener("click", () => {
      if (simpleHash(DOM.admin.passcode.value.trim()) === CONFIG.adminHash) {
        state.adminUnlocked = true; state.adminAttempts = 0;
        DOM.admin.privateSection.classList.remove("is-locked"); DOM.admin.passcode.value = "";
        announceMessage(DOM.admin.message, localize("Espace déverrouillé.", "Espas debloke.")); DOM.admin.message.style.color = "var(--teal)"; renderAdmin(); return;
      }
      state.adminAttempts++; sessionStorage.setItem("admin_attempts", state.adminAttempts.toString());
      if (state.adminAttempts >= CONFIG.maxAdminAttempts) { DOM.admin.unlockBtn.disabled = true; announceMessage(DOM.admin.message, localize("Trop de tentatives. Rechargez.", "Twòp tantativ. Rechaje."), "assertive"); DOM.admin.message.style.color = "var(--red)"; return; }
      announceMessage(DOM.admin.message, localize("Code incorrect.", "Kòd la pa bon."), "assertive"); DOM.admin.message.style.color = "var(--red)";
    });

    DOM.admin.lockBtn?.addEventListener("click", () => {
      state.adminUnlocked = false; DOM.admin.privateSection.classList.add("is-locked"); renderAdmin();
      announceMessage(DOM.admin.message, localize("Espace verrouillé.", "Espas fèmen."));
    });
  }

  DOM.languageToggle?.addEventListener("click", () => setLanguage(document.documentElement.dataset.language === "ht" ? "fr" : "ht"));
  DOM.faqItems.forEach(item => item.addEventListener("toggle", () => { if (item.open) DOM.faqItems.filter(i => i !== item).forEach(i => i.open = false); }));
  window.addEventListener("resize", () => { resizeCanvas(); state.isMobile = window.matchMedia("(max-width: 768px)").matches; });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && state.animationFrameId) { cancelAnimationFrame(state.animationFrameId); state.animationFrameId = null; }
    else if (!document.hidden && !state.animationFrameId) { state.animationFrameId = requestAnimationFrame(draw); }
  });
}


function init() {
  setLanguage(localStorage.getItem(CONFIG.storageKeys.lang) || "fr");
  if (DOM.canvas) { resizeCanvas(); state.animationFrameId = requestAnimationFrame(draw); }
  state.adminAttempts = parseInt(sessionStorage.getItem("admin_attempts") || "0");
  initEventListeners(); renderAdmin();
  console.log("✅ Don de Sang Solidaire initialisé");
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
