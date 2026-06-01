const express = require("express");
const User = require("../models/User");
const Friends = require("../models/Friends");

const bcrypt = require("bcrypt");

const router = express.Router();

const isAuthenticated = (req, res, next) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json("Non authentifié");
    }
    next();
};

// Insrciption
router.post("/user", async (req, res) => {
    
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
router.post("/user/login", async (req, res) => {

    const {pseudo, mdp} = req.body;
    
    if (pseudo && mdp){
        try{
            const pseudoTmp = pseudo.trim();
            const existUser = await User.findOne({pseudo});
            
            if (!existUser){
                return res.status(401).send("Identifiant incorrect");
            }
        }catch(err){
            return res.status(500).json("Identifiant incorrect");
        }
        try{
            // Vérification du mot de passe
            const match = await bcrypt.compare(mdp, existUser.motDePasse);
            if (!match){
                return res.status(401).json("Mot de passe incorrect");
            }
        }catch(err){
            return res.status(500).json("Erreur serveur lors de la vérification du mdp")
        }
        if (!existUser.validate){
            return res.status(403).json("Utilisateur non validé");
        }

        // Middleware express-session
        res.session.regenerate(function (err){
            if (err){
                res.status(500).send({
                    status: 500,
                    message: "Erreur"
                });
            }else{
                // Création nouvelle session
                req.session.userId = existUser._id;
                req.session.pseudo = existUser.pseudo;
                req.session.role = existUser.role;
                
                res.status(200).send({
                    message: "Connecté avec succès",
                    pseudo: existUser.pseudo,
                    role: existUser.role
                });
            }
        })
    }else{
        return req.status(400).json("Identifiant ou mot de passe incorrect");
    }
});

// Déconnexion
router.post("/user.logout", (req, res) => {

    req.session.destroy((err) => {
        if (err){
            return res.status(500).json("Erreur lors de la deconnexion");
        }
        res.clearCookie("connect.sid");
        res.json({message: "Déconnecté"});
    });
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

// Envoyer une demande d'ami
router.post("/friends/demandes", isAuthenticated, async (req,res) => {
    
    try{
        const {pseudoCible} = req.body;
        const userId = req.session.userId;

        if(!pseudoCible){
            return res.status(400).send("Erreur champs incorrect");
        }

        const demande = await Users.existeDemande(userId, pseudoCible);
        if (demande){
            return res.status(400).send("Demande en attente");
        }
        
        await User.demandeAmi(userId, pseudoCible);
        res.status(200).send("Demande envoyée");
    }catch(err){
        if (err.message === "Erreur demande impossible"){
            return res.status(400).send(err.message);
        }
        if (err.message === "Erreur demande introuvable"){
            return res.status(404).send(err.message);
        }
        res.status(500).send("Erreur server");
    }
});

router.post("/friends/accepte/:demandeId", isAuthenticated, async (req, res) => {
    try {
        const demandeId = req.params.demandeId;
        const userId = req.session.userId;
        
        const demande = await User.accepterDemande(demandeId, userId);
        res.status(200).json({ message: "Demande acceptée", demande });
        
    } catch (err) {
        if (err.message === "Demande introuvable") {
            return res.status(404).json(err.message);
        }
        if (err.message === "Non autorisé") {
            return res.status(403).json(err.message);
        }
        console.error(err);
        res.status(500).json("Erreur serveur");
    }
});

// Liste des demandes d'amis recues
router.get("/friends/requests", isAuthenticated, async (req, res) => {
    try {
        const userId = req.session.userId;
        
        const demandes = await Friends.find({ 
            receiver: userId, 
            status: 'attente' 
        }).populate('sender');
        
        res.status(200).json(demandes);
        
    } catch (err) {
        console.error(err);
        res.status(500).json("Erreur serveur");
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