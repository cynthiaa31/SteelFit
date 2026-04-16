const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json()); 

// Connexion à PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// --- ROUTES ---

// Accueil
app.get('/', (req, res) => {
  res.send('Le serveur SteelFit est en ligne !');
});

// Récupérer les produits
app.get('/produits', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM produits');
    res.json(result.rows);
  } catch (err) {
    console.error("Erreur SQL Produits :", err.message);
    res.status(500).json({ error: "Erreur base de données" });
  }
});

// INSCRIPTION (avec hachage du mot de passe)
app.post('/register', async (req, res) => {
  const { nom, email, mot_de_passe } = req.body;
  console.log("Tentative d'inscription pour :", email);

  try {
    // 1. On hache le mot de passe avant de l'enregistrer
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(mot_de_passe, saltRounds);

    // 2. On insère l'utilisateur avec le mot de passe haché
    const newUser = await pool.query(
      'INSERT INTO utilisateur (nom, email, mot_de_passe, role) VALUES ($1, $2, $3, $4) RETURNING id, nom, email, role',
      [nom, email, hashedPassword, 'client']
    );

    console.log("Utilisateur créé avec succès !");
    res.status(201).json(newUser.rows[0]);
  } catch (err) {
    console.error("ERREUR SQL REGISTER :", err.message);
    res.status(400).json("Erreur lors de l'inscription : " + err.message);
  }
});

// CONNEXION (avec vérification sécurisée)
app.post('/login', async (req, res) => {
  const { email, mot_de_passe } = req.body;
  console.log("Tentative de connexion pour :", email);

  try {
    // 1. On cherche l'utilisateur par son email
    const result = await pool.query('SELECT * FROM utilisateur WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.status(401).json("Email ou mot de passe incorrect");
    }

    const user = result.rows[0];

    // 2. On compare le mot de passe tapé avec le hachage en base
    const validPassword = await bcrypt.compare(mot_de_passe, user.mot_de_passe);

    if (!validPassword) {
      return res.status(401).json("Email ou mot de passe incorrect");
    }

    // 3. On crée un Token JWT (Optionnel mais recommandé)
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'ma_cle_secrete_provisoire',
      { expiresIn: '24h' }
    );

    console.log("Connexion réussie !");
    res.json({
      message: "Succès",
      token: token,
      user: { id: user.id, nom: user.nom, email: user.email, role: user.role }
    });

  } catch (err) {
    console.error("ERREUR SQL LOGIN :", err.message);
    res.status(500).json("Erreur serveur");
  }
});

// Lancement du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`-------------------------------------------`);
  console.log(`Serveur prêt sur : http://localhost:${PORT}`);
  console.log(`-------------------------------------------`);
});