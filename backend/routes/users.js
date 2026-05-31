const express = require("express");
const User = require("../models/User");
const Message = require("../models/Message");
const { Users } = require("../../../Projet-RODELET-ZERAVCIC-20260521T090213Z-3-001/Projet-RODELET-ZERAVCIC/server/src/entities/users");

const router = express.Router();


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
    
    if (pseudo && mdp){
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

        // Middleware express-session
        req.session.regenerate(function (err){
            if (err){
                res.status(500).send({
                    status: 500,
                    message: "Erreur"
                });
            }else{
                // Création nouvelle session
                username = existUser.pseudo;
                passwrd = mdp;
                role = existUser.role;
                res.status(200).send({
                    status: 200,
                    message: "Pseudo et mot de passe OK",
                    body: {username, passwrd, role}
                });
            }
        })
    }else{
        return req.status(400).json("Identifiant ou mot de passe incorrect");
    }
});

// Afficher le profile d'un user
router.get("/user/login/:login", async (res, req) => {

    try{
        const user = await user.getByLogin(req.params.login);

        if(!user){
            res.status(404).send("Erreur user non trouvé");
        }else{
            const response = {
                login: `${user.login}`,
                statut: `${user.status}`
            };
            res.send(response);
        }
    }catch(e){
        res.status(500).json({message: e.message});
    }
});

// Accepter une insciption (Admin)
router.post("/user/utilisateur", async (req, res) => {

    const {user_id} = req.body;
    await Users.toUser(user_id);
    res.status(200).send("Inscription accepte en user");
});

// Promotion user vers admin (Admin)
router.post("/user/delete", async (req, res) => {
    const {user_id} = req.body;
    await Users.toAdmin(user_id);
    res.status(200).send("Promotion en admin OK");
});

// Supprimer un user (Admin)
router.post("/user/delete", async (req, res) => {

    const {user_id} = req.body;
    await Users.delete(user_id);
    res.status(200).send("Utilisateur supprimer");
});