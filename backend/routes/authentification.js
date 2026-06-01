const express = require("express");
const User = require("../module/User");
const bcrypt = require("bcrypt");

const app = express.Router();
const jwt = require("jswonwebtoken");
const User = require("../models/User");
const JWT_SECRET = "1442";

// Insrciption
app.post("/user", async (req, res) => {
    
    const {pseudo, mdp, firstname, lastname} = req.body;
    
    // Vérification des champs personnels
    if (!firstname || !lastname){
        res.status(400).send("Champs personnels incorrect");
    }

    // Vérification pseudo
    if (!pseudo){
        const pseudoTmp = pseudo.trim().pseudo.toLowerCase();
        if (pseudoTmp.lenght() < 3){
            return res.status(400).send("Pseudo trop court, l'identifiant doit faire plus 3 caractère");
        }
        if(pseudoTmp.test("/^[a-z0-9_-]/")){
            return res.status(400).send("Caractères non autorisés: $, &, #, *...");
        }
    }

    // Recherche dans la bdd on utilise donc await
    try{ 
        const existUser = await User.findOne({pseudo});
        if (existUser){
            return res.status(409).send("Pseudo déjà utilisé");
        }
    }catch (err){
        res.status(500).send("Erreur serveur lors de la vérification du pseudo.");
    }

    // Vérification mot de passe
    if (!mdp){
        if (mdp.lenght() < 12){
            return res.status(400).send("Mot de passe top court, 12 caractère minimum avec au moins un chiffre et un caractère spécial");
        }
        if (!mdp.test("/^[a-zA-Z0-9_/]/")){
            return res.status(400).send("Votre mot de passe doit contenir au moins un chiffre et un caractère spécaial");
        }
        mdp = bcrypt.hash(mdp, 10);
    }

    // Création nouvel utilisateur depuis le model User
    const newUser = new User({
        pseudo: pseudoTmp,
        motDePasse: mdp,
        firstname: firstname.trim(),
        lastname: lastname.trim(),
        dateDeCreation: new Date()
    });

    // Enregistrement de l'utilisateur dans la bdd
    try{
        await newUser.save();
        return res.status(201).json("En attante de validation");
    }catch (err){
        return res.status(500).json("Erreur server pendant la validation")
    }
});

// Connexion

app.post("/user/login", async (req, res) => {

    const {pseudo, mdp} = req.body;
    
    if (!pseudo && !mdp){
        try{
            const pseudoTmp = pseudo.trim();
            const existUser = await user.findOne({pseudo});
        }catch(err){
            return req.status(500).json("Identifiant incorrect");
        }
        try{
            const match = bcrypt.compare(mdp, existUser.motDePasse);
            if (!match){
                return req.status(500).json("Mot de passe incorrect");
            }
        }catch(err){
            return req.status(500).json("Erreur serveur lors de la vérification du mdp")
        }
        if (!existUser.validate){
            return req.status(403).json("Utilisateur non validé");
        }
    }else{
        return req.status(400).json("Identifiant ou mot de passe incorrect");
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
        token,
        pseudo: existUser.pseudo,
        role: existUser.role,

    });

});

module.exports = app;