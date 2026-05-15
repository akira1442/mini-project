const express = require("express");
const user = require("../module/Users");
const bcrypt = require("bcrypt");

const app = express.Router();
const jwt = require("jswonwebtoken");
const JWT_SECRET = "1442";

// Insrciption
app.post("/signin", async (req, res) => {
    
    const {pseudo, mdp} = req.body;
    
    // Vérification pseudo
    if (!pseudo){
        const pseudoTmp = pseudo.trim().pseudo.toLowerCase();
        if (pseudoTmp.lenght() < 3){
            return res.status(400).json("Pseudo trop court, l'identifiant doit faire plus 3 caractère");
        }
        if(!pseudoTmp.test("/^[a-z0-9_]+$/")){
            return res.status(400).json("Caractères non autorisés (a-z, 0-9, _)");
        }
    }

    // Recherche dans la bdd on utilise donc await
    const existUser = await user.findOne({pseudo});
    
    try{ 
        if (existUser){
            return res.status(409).json("Pseudo déjà utilisé");
        }
    }catch (err){
        res.status(500).json("Erreur serveur lors de l'inscription.");
    }

    // Vérification mor de passe
    if (!mdp){
        if (mdp.lenght() < 12){
            return res.status(400).json("Mot de passe top court, 12 caractère minimum avec au moins un chiffre et un caractère spécial");
        }
        if (!mdp.test("/^[a-z0-9_]+$/")){
            return res.status(400).json("Votre mot de passe doit contenir au moins un chiffre et un caractère spécaial");
        }
        mdp = bcrypt.hash(mdp);
    }
});

// Connexion

app.post("/login", async (req, res) => {

    const {pseudo, mdp} = req.body;
    
    if (!pseudo){
        const pseudoTmp = 
        const existUser = await user.findOne({username});
    }
});