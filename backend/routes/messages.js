const express = require("express");
const { ObjectId } = require("mongodb");
const router = express.Router();

function isAuthenticated(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json("Non authentifié");
    }
    next();
}

// Nouveau message
router.post("/message", isAuthenticated, async (req, res) => {

    const { title, text, forum } = req.body;

    if (!text || text.trim() === "") {
        return res.status(400).send("Erreur le message est vide");
    }

    try {
        const userId = req.session.userId;
        const db = req.app.locals.db;
        const userRole = req.session.role;

        // Forum privé/admin
        const messageForum = userRole === "admin" && forum === "ferme" ? "ferme" : "public";
        const newMSG = {
            auteur: req.session.pseudo,
            userId: new ObjectId(userId),
            date: new Date(),
            title: title ? title.trim() : "",
            text: text.trim(),
            forum: messageForum,
            likes: 0,
            likedBy: [],
            replies: [],
        };
        await db.collection("messages").insertOne(newMSG);
        res.status(201).send("Message créé");
    } catch (e) {
        return res.status(500).send(e.message);
    }
});

// Envoyer un MP
router.post("/mp", isAuthenticated, async (req, res) => {
    try {
        const { dest, text } = req.body;
        const db = req.app.locals.db;
        const sender = req.session.pseudo;

        if (!dest || !text.trim()) {
            return res.status(400).json("Destinataire et message requis");
        }
        const userCible = await db.collection("users").findOne({ pseudo: dest.trim().toLowerCase() });
        if (!userCible) {
            return res.status(404).json("Destinataire introuvable");
        }

        const newMP = {
            sender: sender,
            dest: userCible.pseudo,
            text: text.trim(),
            date: new Date()
        };

        await db.collection("private_messages").insertOne(newMP);
        res.status(201).json(newMP);
    } catch (err) {
        return res.status(500).json("Erreur serveur lors de l'envoi du MP");
    }
});

// Récupérer tout l'historique des MP de l'utilisateur
router.get("/mp", isAuthenticated, async (req, res) => {
    try {
        const db = req.app.locals.db;
        const pseudo = req.session.pseudo;
        const mps = await db.collection("private_messages").find({
            $or: [{ sender: pseudo }, { dest: pseudo }]
        }).sort({ date: 1 }).toArray();

        res.status(200).json(mps);
    } catch (err) {
        return res.status(500).json("Erreur lors de la récupération des MP");
    }
});

// Supprimer un message
router.delete("/messages/:id", isAuthenticated, async (req, res) => {
    try {
        const messageId = req.params.id;
        const userId = req.session.userId;
        const userRole = req.session.role;
        const db = req.app.locals.db;

        if (!userId) {
            return res.status(401).json("Session non valide");
        }
        const msg = await db.collection("messages").findOne({ _id: new ObjectId(messageId) });
        if (!msg) {
            return res.status(404).json("Message introuvable");
        }
        const estAdmin = userRole === "admin";
        const estAuteur = userId.toString() === msg.userId.toString();
        if (estAuteur || estAdmin) {
            await db.collection("messages").deleteOne({ _id: new ObjectId(messageId) });
            return res.status(200).json("Message supprimé OK");
        }
        return res.status(403).json("Vous n'êtes pas autorisé à supprimer ce message");
    } catch (err) {
        res.status(500).json("Erreur serveur");
    }
});

// Recuperer la liste de tout les messages
router.get("/message/list", async (req, res) => {
    const db = req.app.locals.db;
    const list = await db.collection("messages").find().sort({ date: -1 }).toArray();
    res.status(200).json({
        status: 200,
        message: "liste des messages récupérer",
        body: list
    });
})

// Recuperer la liste de tout les messages d'un user particulier
router.get("/message/user/:userId", isAuthenticated, async (req, res) => {

    try {
        const userId = req.params.userId;
        const db = req.app.locals.db;

        if (!ObjectId.isValid(userId)) {
            return res.status(400).json("ID invalide");
        }

        const messages = await db.collection("messages").find({ userId: new ObjectId(userId) }).sort({ date: -1 }).toArray();

        res.status(200).json({
            count: messages.length,
            messages: messages
        });
    } catch (e) {
        res.status(500).send("Erreur lors de la suppression du message");
    }
});

// Liker un message
router.post("/message/:id/like", isAuthenticated, async (req, res) => {
    try {
        const messageId = req.params.id;
        const userId = req.session.userId;
        const db = req.app.locals.db;

        if (!ObjectId.isValid(messageId)) {
            return res.status(400).json("ID invalide");
        }

        const msg = await db.collection("messages").findOne({ _id: new ObjectId(messageId) });
        if (!msg) {
            return res.status(404).json("Message introuvable");
        }
        const likedBy = msg.likedBy || [];
        const hasLiked = likedBy.some(id => id.toString() === userId);

        if (hasLiked) {
            // Déjà liké, donc on retire le like
            await db.collection("messages").updateOne(
                { _id: new ObjectId(messageId) },
                { 
                    $pull: { likedBy: new ObjectId(userId) },
                    $inc: { likes: -1 }
                }
            );
            return res.status(200).json({ message: "Like retiré", likes: msg.likes - 1 });
        } else {
            await db.collection("messages").updateOne(
                { _id: new ObjectId(messageId) },
                { 
                    $push: { likedBy: new ObjectId(userId) },
                    $inc: { likes: 1 }
                }
            );
            return res.status(200).json({ message: "Message liké", likes: msg.likes + 1 });
        }
    } catch (err) {
        return res.status(500).json(`Erreur serveur: ${err.message}`);
    }
});

// Ajouter une réponse à un message
router.post("/message/:id/reply", isAuthenticated, async (req, res) => {
    try {
        const messageId = req.params.id;
        const { text } = req.body;
        const db = req.app.locals.db;
        if (!ObjectId.isValid(messageId)) {
            return res.status(400).json("ID de message invalide");
        }
        if (!text || text.trim() === "") {
            return res.status(400).json("Le commentaire ne peut pas être vide");
        }
        const newReply = {
            author: req.session.pseudo,
            date: new Date(),
            text: text.trim()
        };

        await db.collection("messages").updateOne(
            { _id: new ObjectId(messageId) },
            { $push: { replies: newReply } }
        );

        res.status(201).json({ message: "Commentaire ajouté avec succès" });
    } catch (err) {
        return res.status(500).json(`Erreur serveur: ${err.message}`);
    }
});

module.exports = router;