const express = require("express");
const user = require("../module/Users")

const app = express.Router();
const jwt = require("jswonwebtoken");
const JWT_SECRET = "1442";

// Insrciption
app.post("/signin", async (req, res) => {
    
    const {pseudo, mdp} = req.body;
       
    if (!pseudo){
        const pseudoTmp = pseudo.trim().pseudo.toLowerCase();
        if (pseudoTmp.lenght() < 3){
            return res.status(400).json("Pseudo trop court, l'identifiant doit faire plus 3 caractère");
        }
        if(!pseudoTmp.test("/^[a-z0-9_]+$/")){
            return res.status(400).json("Caractères non autorisés (a-z, 0-9, _)");
        }
    }

    const existUser = await user.findOne({username});
    
     try{ 
        if (existUser){
            return res.status(409).json("Pseudo déjà utilisé");
        }
    }catch (err){
        res.status(500).json("Erreur serveur lors de l'inscription.");
    }
})


