const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json()); // Indispensable pour lire le body de React

// 1. Connexion à PostgreSQL


const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// 2. Route d'accueil
app.get('/', (req, res) => {
  res.send('Le serveur SteelFit est en ligne !');
});

// 3. Récupérer les produits
app.get('/produits', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM produits');
    res.json(result.rows);
  } catch (err) {
    console.error("Erreur SQL Produits :", err.message);
    res.status(500).json({ error: "Erreur base de données" });
  }
});

// --- PARTIE AUTHENTIFICATION CORRIGÉE ---

// Inscription
app.post('/register', async (req, res) => {
  const { nom, email, mot_de_passe } = req.body;
  
  // Petit log pour voir ce qui arrive dans le terminal
  console.log("Tentative d'inscription pour :", email);

  try {
    const newUser = await pool.query(
      'INSERT INTO utilisateur (nom, email, mot_de_passe, role) VALUES ($1, $2, $3, $4) RETURNING *',
      [nom, email, mot_de_passe, 'client']
    );
    console.log("Utilisateur créé avec succès !");
    res.status(201).json(newUser.rows[0]);
  } catch (err) {
    console.error("ERREUR SQL REGISTER :", err.message);
    // Si l'email existe déjà, err.message contiendra "unique constraint"
    res.status(400).json("Erreur lors de l'inscription : " + err.message);
  }
});

// Connexion
app.post('/login', async (req, res) => {
  const { email, mot_de_passe } = req.body;
  console.log("Tentative de connexion pour :", email);

  try {
    const user = await pool.query(
      'SELECT * FROM utilisateur WHERE email = $1 AND mot_de_passe = $2',
      [email, mot_de_passe]
    );

    if (user.rows.length > 0) {
      console.log("Connexion réussie !");
      res.json(user.rows[0]);
    } else {
      res.status(401).json("Email ou mot de passe incorrect");
    }
  } catch (err) {
    console.error("ERREUR SQL LOGIN :", err.message);
    res.status(500).json("Erreur serveur");
  }
});

// 4. Lancement du serveur
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`-------------------------------------------`);
  console.log(`Serveur prêt sur : http://localhost:${PORT}`);
  console.log(`-------------------------------------------`);
});