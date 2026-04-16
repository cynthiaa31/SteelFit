import React, { useState, useEffect } from 'react';
import './Styles.css';
import Login from './Login';

function App() {
  // --- ÉTATS (STATES) ---
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showLogin, setShowLogin] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);

  // --- PERSISTANCE DE LA SESSION ---
  // Vérifie si un utilisateur est déjà stocké dans le navigateur au démarrage
  useEffect(() => {
    const savedUser = localStorage.getItem('steelfit_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // --- CHARGEMENT DES PRODUITS ---
  useEffect(() => {
    fetch('http://localhost:5000/produits') 
      .then(res => {
        if (!res.ok) throw new Error("Erreur réseau");
        return res.json();
      })
      .then(data => setProducts(data))
      .catch(err => console.error("Erreur React :", err));
  }, []);

  // --- LOGIQUE DE CONNEXION / DÉCONNEXION ---
  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('steelfit_user', JSON.stringify(userData));
    setShowLogin(false);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('steelfit_user');
  };

  // --- LOGIQUE DU PANIER ---
  const addToCart = (product) => {
    setCart(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantite: item.quantite + 1 } : item
        );
      }
      return [...prev, { ...product, quantite: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => {
      const item = prev.find(i => i.id === productId);
      if (item.quantite > 1) {
        return prev.map(i => i.id === productId ? { ...i, quantite: i.quantite - 1 } : i);
      }
      return prev.filter(i => i.id !== productId);
    });
  };

  const deleteFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const totalPanier = cart.reduce((acc, item) => acc + (item.prix * item.quantite), 0);
  const nbArticles = cart.reduce((acc, item) => acc + item.quantite, 0);

  // --- FILTRAGE ---
  const filteredProducts = filter === 'all' 
    ? products 
    : products.filter(p => p.categorie === filter);

  return (
    <div className="App">
      
      {/* MODAL DE CONNEXION */}
      {showLogin && (
        <Login 
          onClose={() => setShowLogin(false)} 
          onLoginSuccess={handleLoginSuccess} 
        />
      )}

      {/* SIDEBAR DU PANIER */}
      {showCart && (
        <div className="cart-overlay">
          <div className="cart-sidebar">
            <div className="cart-header">
              <h2>Mon Panier</h2>
              <button className="close-cart" onClick={() => setShowCart(false)}>×</button>
            </div>
            <div className="cart-body">
              {cart.length === 0 ? (
                <p className="empty-msg">Votre panier est vide.</p>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="cart-item">
                    <img src={item.image_url} alt={item.nom} />
                    <div className="item-info">
                      <h4>{item.nom}</h4>
                      <p>{item.prix} €</p>
                      <div className="qty-controls">
                        <button onClick={() => removeFromCart(item.id)}>-</button>
                        <span>{item.quantite}</span>
                        <button onClick={() => addToCart(item)}>+</button>
                      </div>
                    </div>
                    <button className="delete-item" onClick={() => deleteFromCart(item.id)}>🗑️</button>
                  </div>
                ))
              )}
            </div>
            {cart.length > 0 && (
              <div className="cart-footer">
                <div className="total-box">
                  <span>Total :</span>
                  <span>{totalPanier.toFixed(2)} €</span>
                </div>
                <button className="btn btn-red checkout-btn">Payer la commande</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* NAVIGATION */}
      <nav>
        <div className="container">
          <div className="nav-inner">
            <div className="nav-center">
              <a href="/" className="logo-box">
                <img src="/img/logo.png" alt="SteelFit" className="main-logo-img" />
              </a>
            </div>
            <ul className="nav-links">
              <li><a href="#" onClick={() => setFilter('all')}>Accueil</a></li>
              <li><a href="#" onClick={() => setFilter('vetements')}>Vêtements</a></li>
              <li><a href="#" onClick={() => setFilter('nutrition')}>Nutrition</a></li>
            </ul>
            <div className="nav-icons">
              {user ? (
                <div className="user-nav">
                  <span>Salut, {user.nom?.split(' ')[0]}</span>
                  <button onClick={handleLogout} className="logout-btn">Déconnexion</button>
                </div>
              ) : (
                <a href="#" onClick={(e) => { e.preventDefault(); setShowLogin(true); }}>
                  Compte
                </a>
              )}
              <a href="#" className="cart-btn" onClick={(e) => { e.preventDefault(); setShowCart(true); }}>
                Panier ({nbArticles})
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>Forge <span>ton corps.</span></h1>
            <p>Performance, Style et Nutrition pour les athlètes de demain.</p>
            <button className="btn btn-red">Voir la collection</button>
          </div>
        </div>
      </header>

      {/* GRILLE DE PRODUITS */}
      <main className="container section">
        <h2 className="section-title">Nos <span>Produits</span></h2>
        <div className="products-grid">
          {filteredProducts.map(product => (
            <div key={product.id} className="product-card">
              <div className="product-img">
                <img src={product.image_url} alt={product.nom} />
                {/* OVERLAY DESCRIPTION AU SURVOL */}
                <div className="product-overlay">
                  <p>{product.description || "Performance et qualité SteelFit."}</p>
                </div>
              </div>
              <div className="product-body">
                <h3>{product.nom}</h3>
                <p className="price">{product.prix} €</p>
                <button className="btn btn-red add-btn" onClick={() => addToCart(product)}>
                  Ajouter au panier
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* FOOTER */}
      <footer>
        <div className="container footer-bottom">
          <p>© 2026 STEELFIT — Tous droits réservés</p>
        </div>
      </footer>

    </div>
  );
}

export default App;