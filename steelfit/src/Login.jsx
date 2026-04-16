import React, { useState } from 'react';
import './Styles.css';

function Login({ onLoginSuccess, onClose }) {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ 
    nom: '', 
    email: '', 
    mot_de_passe: '' 
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Définition de l'URL selon le mode (Inscription ou Connexion)
    const endpoint = isRegister ? '/register' : '/login';
    
    // On prépare l'objet exactement comme ton serveur l'attend
    const payload = {
      nom: formData.nom,
      email: formData.email,
      mot_de_passe: formData.mot_de_passe
    };

    console.log("Tentative d'envoi vers le serveur :", payload);

    try {
      const response = await fetch(`http://localhost:5173${endpoint}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Réponse réussie du serveur :", data);
        onLoginSuccess(data); // On transmet les infos de l'utilisateur à App.jsx
      } else {
        // Le serveur a renvoyé une erreur (ex: email déjà pris)
        console.error("Erreur serveur :", data);
        alert(typeof data === 'string' ? data : "Erreur : vérifiez vos informations");
      }
    } catch (err) {
      // Le serveur est probablement éteint ou l'URL est mauvaise
      console.error("Erreur réseau :", err);
      alert("Impossible de contacter le serveur. Est-il bien lancé sur le port 5000 ?");
    }
  };

  return (
    <div className="login-overlay">
      <div className="login-card">
        {/* Bouton pour fermer la fenêtre */}
        <button className="close-btn" onClick={onClose}>&times;</button>
        
        <h2>{isRegister ? 'Créer un compte' : 'Se connecter'}</h2>
        
        <form onSubmit={handleSubmit}>
          {/* On n'affiche le champ "Nom" que si on s'inscrit */}
          {isRegister && (
            <input 
              type="text" 
              placeholder="Nom complet" 
              value={formData.nom}
              onChange={(e) => setFormData({...formData, nom: e.target.value})}
              required 
            />
          )}
          
          <input 
            type="email" 
            placeholder="Email" 
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required 
          />
          
          <input 
            type="password" 
            placeholder="Mot de passe" 
            value={formData.mot_de_passe}
            onChange={(e) => setFormData({...formData, mot_de_passe: e.target.value})}
            required 
          />
          
          <button type="submit" className="btn btn-red" style={{ width: '100%', marginTop: '10px' }}>
            {isRegister ? "S'inscrire" : "Connexion"}
          </button>
        </form>

        <p onClick={() => setIsRegister(!isRegister)} className="toggle-auth" style={{ textAlign: 'center', marginTop: '15px', cursor: 'pointer', color: 'var(--red)' }}>
          {isRegister ? "Déjà un compte ? Connecte-toi" : "Pas de compte ? Inscris-toi"}
        </p>
      </div>
    </div>
  );
}

export default Login;