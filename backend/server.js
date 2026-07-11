"use strict";

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "donation_sang",
  waitForConnections: true,
  connectionLimit: 10
});

function requireField(value, label) {
  const text = String(value || "").trim();
  if (!text) {
    const error = new Error(label + " est obligatoire.");
    error.status = 400;
    throw error;
  }
  return text;
}

function normalizeAmount(value) {
  if (value === undefined || value === null || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

app.get("/api/health", async (_req, res, next) => {
  try {
    await pool.query("select 1");
    res.json({ status: "ok", database: "mysql" });
  } catch (error) {
    next(error);
  }
});

app.post("/api/donors", async (req, res, next) => {
  try {
    const donor = {
      nom: requireField(req.body.name || req.body.nom, "Nom"),
      telephone: requireField(req.body.phone || req.body.telephone, "Téléphone"),
      groupe_sanguin: requireField(req.body.bloodType || req.body.groupe_sanguin, "Groupe sanguin"),
      ville: requireField(req.body.city || req.body.ville, "Ville"),
      disponibilite: req.body.availability || req.body.disponibilite || null
    };

    const [result] = await pool.execute(
      "insert into donneurs (nom, telephone, groupe_sanguin, ville, disponibilite) values (?, ?, ?, ?, ?)",
      [donor.nom, donor.telephone, donor.groupe_sanguin, donor.ville, donor.disponibilite]
    );

    res.status(201).json({ id: result.insertId, ...donor });
  } catch (error) {
    next(error);
  }
});

app.get("/api/donors", async (req, res, next) => {
  try {
    const conditions = [];
    const params = [];

    if (req.query.bloodType) {
      conditions.push("groupe_sanguin = ?");
      params.push(req.query.bloodType);
    }

    if (req.query.city) {
      conditions.push("ville like ?");
      params.push("%" + req.query.city + "%");
    }

    const sql = "select * from donneurs" +
      (conditions.length ? " where " + conditions.join(" and ") : "") +
      " order by date_creation desc";

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

app.post("/api/requests", async (req, res, next) => {
  try {
    const request = {
      nom_demandeur: requireField(req.body.requesterName || req.body.nom_demandeur, "Nom du demandeur"),
      telephone: requireField(req.body.requesterPhone || req.body.telephone, "Téléphone"),
      groupe_recherche: requireField(req.body.neededBloodType || req.body.groupe_recherche, "Groupe recherché"),
      urgence: requireField(req.body.urgency || req.body.urgence, "Urgence"),
      hopital: requireField(req.body.hospital || req.body.hopital, "Hôpital"),
      ville: requireField(req.body.requestCity || req.body.ville, "Ville"),
      details: req.body.requestDetails || req.body.details || null,
      mode_paiement: req.body.paymentMethod || req.body.mode_paiement || null,
      montant: normalizeAmount(req.body.paymentAmount || req.body.montant),
      reference_transaction: req.body.paymentReference || req.body.reference_transaction || null
    };

    const [result] = await pool.execute(
      `insert into demandes_sang
      (nom_demandeur, telephone, groupe_recherche, urgence, hopital, ville, details, mode_paiement, montant, reference_transaction)
      values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        request.nom_demandeur,
        request.telephone,
        request.groupe_recherche,
        request.urgence,
        request.hopital,
        request.ville,
        request.details,
        request.mode_paiement,
        request.montant,
        request.reference_transaction
      ]
    );

    res.status(201).json({ id: result.insertId, ...request });
  } catch (error) {
    next(error);
  }
});

app.get("/api/requests", async (_req, res, next) => {
  try {
    const [rows] = await pool.query("select * from demandes_sang order by date_creation desc");
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

app.delete("/api/donors/:id", async (req, res, next) => {
  try {
    const [result] = await pool.execute("delete from donneurs where id = ?", [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Donneur introuvable." });
    }
    res.json({ deleted: true, id: Number(req.params.id) });
  } catch (error) {
    next(error);
  }
});

app.delete("/api/donors", async (_req, res, next) => {
  try {
    await pool.query("delete from donneurs");
    res.json({ deleted: true, scope: "all" });
  } catch (error) {
    next(error);
  }
});

app.delete("/api/requests/:id", async (req, res, next) => {
  try {
    const [result] = await pool.execute("delete from demandes_sang where id = ?", [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Demande introuvable." });
    }
    res.json({ deleted: true, id: Number(req.params.id) });
  } catch (error) {
    next(error);
  }
});

app.delete("/api/requests", async (_req, res, next) => {
  try {
    await pool.query("delete from demandes_sang");
    res.json({ deleted: true, scope: "all" });
  } catch (error) {
    next(error);
  }
});

app.get("/api/stats", async (_req, res, next) => {
  try {
    const [[donors]] = await pool.query("select count(*) as total from donneurs");
    const [[requests]] = await pool.query("select count(*) as total from demandes_sang");
    const [groups] = await pool.query("select groupe_sanguin, count(*) as total from donneurs group by groupe_sanguin order by groupe_sanguin");

    res.json({
      totalDonors: donors.total,
      totalRequests: requests.total,
      donorsByBloodGroup: groups
    });
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error(error.message);
  res.status(error.status || 500).json({ message: error.message || "Erreur serveur." });
});

app.listen(port, () => {
  console.log("Backend lancé sur http://localhost:" + port);
});