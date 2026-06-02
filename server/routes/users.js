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

const isAdmin = (req, res, next) => {
    if (!req.session || req.session.role !== "admin") {
        return res.status(403).json("Non autorisé");
    }
    next();
};

// Insrciption
router.post("/user", async (req, res) => {

    let { pseudo, mdp, firstname, lastname, birthdate } = req.body;
    if (!firstname || !lastname) {
        return res.status(400).send("Champs personnels incorrect");
    }
    let pseudoTmp = "";

    if (pseudo) {
        pseudoTmp = pseudo.trim().toLowerCase();
        if (pseudoTmp.length < 3) {
            return res.status(400).send("Pseudo trop court, l'identifiant doit faire plus 3 caractère");
        }
        const pseudoRegex = /^[a-z0-9_-]+$/;
        if (!pseudoRegex.test(pseudoTmp)) {
            return res.status(400).send("Caractères non autorisés: $, &, #, *...");
        }
    } else {
        return res.status(400).send("Pseudo requis");
    }

    // Recherche dans la bdd si le pseudo existe déjà
    try {
        const db = req.app.locals.db;
        const existUser = await db.collection("users").findOne({ pseudo: pseudoTmp });
        if (existUser) {
            return res.status(409).send("Pseudo déjà utilisé");
        }
    } catch (err) {
        return res.status(500).send("Erreur serveur lors de la vérification du pseudo.");
    }

    // Vérification mot de passe
    if (mdp) {
        if (mdp.length < 12) {
            return res.status(400).send("Mot de passe top court, 12 caractère minimum avec au moins un chiffre et un caractère spécial");
        }
        const mdpRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])/;
        if (!mdpRegex.test(mdp)) {
            return res.status(400).send("Votre mot de passe doit contenir au moins un chiffre et un caractère spécial");
        }
        mdp = await bcrypt.hash(mdp, 10);
    } else {
        return res.status(400).send("Mot de passe requis");
    }

    // Création nouvel utilisateur
    const newUser = {
        pseudo: pseudoTmp,
        motDePasse: mdp,
        firstname: firstname.trim(),
        lastname: lastname.trim(),
        birthdate: birthdate,
        role: "membre",
        valide: false,
        dateDeCreation: new Date()
    };

    // Enregistrement dans la bdd
    try {
        const db = req.app.locals.db;
        await db.collection("users").insertOne(newUser);
        return res.status(201).json("En attante de validation");
    } catch (err) {
        return res.status(500).json("Erreur server pendant la validation");
    }
});

// Connexion
router.post("/user/login", async (req, res) => {

    const { pseudo, mdp } = req.body;

    if (pseudo && mdp) {
        let existUser;
        try {
            const db = req.app.locals.db;
            const pseudoTmp = pseudo.trim().toLowerCase();
            existUser = await db.collection("users").findOne({ pseudo: pseudoTmp });

            if (!existUser) {
                return res.status(401).send("Identifiant incorrect");
            }
        } catch (err) {
            return res.status(500).json("Identifiant incorrect");
        }
        try {
            // Vérification du mot de passe
            const match = await bcrypt.compare(mdp, existUser.motDePasse);
            if (!match) {
                return res.status(401).json("Mot de passe incorrect");
            }
        } catch (err) {
            return res.status(500).json("Erreur serveur lors de la vérification du mdp")
        }
        if (existUser.valide !== true) {
            return res.status(403).json("Utilisateur non validé");
        }

        // Création nouvelle session directe
        req.session.userId = existUser._id;
        req.session.pseudo = existUser.pseudo;
        req.session.role = existUser.role;

        return res.status(200).json({
            message: "Connecté avec succès",
            user: {
                username: existUser.pseudo,
                role: existUser.role,
                firstname: existUser.firstname,
                lastname: existUser.lastname,
                birthdate: existUser.birthdate
            }
        });
    } else {
        return res.status(400).json("Identifiant ou mot de passe incorrect");
    }
});

// Récupérer la liste des utilisateurs
router.get("/admin/users", isAuthenticated, isAdmin, async (req, res) => {
    try {
        const db = req.app.locals.db;
        const users = await db.collection("users").find({}, {
            projection: {
                pseudo: 1,
                firstname: 1,
                lastname: 1,
                role: 1,
                valide: 1
            }
        }).toArray();
        return res.status(200).json(users);
    } catch (err) {
        return res.status(500).json("Erreur serveur lors de la récupération des utilisateurs.");
    }
});

// liste des utilisateurs en attente de validation ADMIN
router.get("/admin/users/pending", isAuthenticated, isAdmin, async (req, res) => {
    try {
        const db = req.app.locals.db;
        const users = await db.collection("users").find({ valide: false }, {
            projection: {
                pseudo: 1,
                firstname: 1,
                lastname: 1,
                role: 1,
                valide: 1
            }
        }).toArray();
        return res.status(200).json(users);
    } catch (err) {
        return res.status(500).json("Erreur serveur lors de la récupération des utilisateurs en attente.");
    }
});

// Valider une inscription ADMIN
router.post("/admin/users/validate", isAuthenticated, isAdmin, async (req, res) => {
    const { pseudo } = req.body;
    if (!pseudo) {
        return res.status(400).json("Pseudo requis");
    }
    try {
        const db = req.app.locals.db;
        const pseudoTmp = pseudo.trim().toLowerCase();
        const result = await db.collection("users").findOneAndUpdate(
            { pseudo: pseudoTmp },
            { $set: { valide: true } },
            { returnDocument: "after" }
        );
        const updatedUser = result.value || result;
        if (!updatedUser) {
            return res.status(404).json("Utilisateur introuvable");
        }
        return res.status(200).json({ message: "Utilisateur validé", user: updatedUser });
    } catch (err) {
        return res.status(500).json("Erreur serveur lors de la validation de l'utilisateur.");
    }
});

// Déconnexion
router.post("/user/logout", (req, res) => {

    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json("Erreur lors de la deconnexion");
        }
        res.clearCookie("connect.sid");
        res.json({ message: "Déconnecté" });
    });
});

// Afficher le profil d'un user
router.get("/user/login/:login", async (req, res) => {

    try {
        const db = req.app.locals.db;
        const userFound = await db.collection("users").findOne({ pseudo: req.params.login });

        if (!userFound) {
            res.status(404).send("Erreur user non trouvé");
        } else {
            const response = {
                login: `${userFound.pseudo}`,
                statut: `${userFound.role}`
            };
            res.send(response);
        }
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// Accepter une insciption ADMIN
router.post("/user/utilisateur", isAuthenticated, isAdmin, async (req, res) => {
    const { user_id } = req.body;
    await User.toUser(req.app.locals.db, user_id);
    res.status(200).send("Inscription accepte en user");
});

// Promotion un user en admin ADMIN
router.post("/user/promote", isAuthenticated, isAdmin, async (req, res) => {
    const { user_id } = req.body; 
    if (!user_id) {
        return res.status(400).json("Pseudo requis");
    }
    try {
        const db = req.app.locals.db;
        const targetUser = await db.collection("users").findOne({ pseudo: user_id.trim().toLowerCase() });
        
        if (!targetUser) {
            return res.status(404).json("Utilisateur introuvable");
        }
        if (targetUser._id.toString() === req.session.userId.toString()) {
            return res.status(403).json("Vous ne pouvez pas modifier votre propre rôle");
        }
        const newRole = targetUser.role === "admin" ? "membre" : "admin";
        const result = await db.collection("users").findOneAndUpdate(
            { pseudo: user_id.trim().toLowerCase() },
            { $set: { role: newRole } },
            { returnDocument: "after" }
        );
        
        return res.status(200).json({ 
            message: `Utilisateur ${newRole === "admin" ? "promu" : "rétrogradé"}`, 
            user: result.value || result
        });
    } catch (err) {
        return res.status(500).json("Erreur lors de la mise à jour du rôle.");
    }
});

// Supprimer un user ADMIN
router.post("/user/delete", isAuthenticated, isAdmin, async (req, res) => {
    const { user_id } = req.body;
    await User.deleteUser(req.app.locals.db, user_id);
    res.status(200).send("Utilisateur supprimé");
});
module.exports = router;