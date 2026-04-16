-- Nettoyage si les tables existent déjà
DROP TABLE IF EXISTS panier CASCADE;
DROP TABLE IF EXISTS commande CASCADE;
DROP TABLE IF EXISTS produits CASCADE;
DROP TABLE IF EXISTS utilisateur CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- 1. Création des tables
CREATE TABLE utilisateur (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100),
    email VARCHAR(150) UNIQUE NOT NULL,
    mot_de_passe VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'client'
);

CREATE TABLE produits (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    description TEXT,
    prix DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(255),
    categorie VARCHAR(50),
    stock INTEGER DEFAULT 0,
    date_ajout TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE commande (
    id SERIAL PRIMARY KEY,
    id_utilisateur INTEGER REFERENCES utilisateur(id) ON DELETE CASCADE,
    date_commande TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(10, 2) NOT NULL,
    statut VARCHAR(50) DEFAULT 'en attente',
    adresse_livraison TEXT
);

CREATE TABLE panier (
    id SERIAL PRIMARY KEY,
    id_utilisateur INTEGER REFERENCES utilisateur(id),
    id_produit INTEGER REFERENCES produits(id),
    quantite INTEGER DEFAULT 1
);

-- 2. Insertion des produits propres
INSERT INTO produits (nom, prix, image_url, categorie) VALUES 
('T-shirt Performance', 25.99, '/img/tshirt-performance.png', 'vetements'),
('Legging Compression Pro', 42.49, '/img/legging-compression.png', 'vetements'),
('Whey Protein 2kg Vanille', 54.99, '/img/whey-vanille.png', 'nutrition'),
('Whey Gold Fraise', 49.99, '/img/whey-protein.png', 'nutrition'),
('Whey Isolate Chocolat', 59.99, '/img/whey-protein_chocolat.png', 'nutrition'),
('Veste Training Elite', 35.99, '/img/veste-training.png', 'vetements');