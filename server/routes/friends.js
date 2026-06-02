const express = require("express");
const { ObjectId } = require("mongodb");
const router = express.Router();

function isAuthenticated(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json("Non authentifié");
    }
    next();
}

// Demander un ami
router.post("/friends/demandes", isAuthenticated, async (req, res) => {
    try {
        const { pseudoCible } = req.body;
        
        if (!pseudoCible || pseudoCible.trim() === "") {
            return res.status(400).json("Pseudo cible requis");
        }
        const db = req.app.locals.db;
        const userId = req.session.userId;
        const userPseudo = req.session.pseudo;
        // Vérifier que l'utilisateur existe
        const targetUser = await db.collection("users").findOne({ pseudo: pseudoCible.trim().toLowerCase() });
        if (!targetUser) {
            return res.status(404).json("Utilisateur non trouvé");
        }
        // Vérifier que ce n'est pas soi-même
        if (targetUser._id.toString() === userId) {
            return res.status(400).json("Vous ne pouvez pas vous envoyer une demande d'ami");
        }
        // Vérifier qu'une demande n'existe pas déjà
        const existingRequest = await db.collection("friends").findOne({
            from: new ObjectId(userId),
            to: targetUser._id,
            status: "pending"
        });

        if (existingRequest) {
            return res.status(400).json("Demande d'ami déjà envoyée");
        }

        // Créer la demande d'ami
        const friendRequest = {
            from: new ObjectId(userId),
            fromPseudo: userPseudo,
            to: targetUser._id,
            toPseudo: pseudoCible.trim().toLowerCase(),
            status: "pending",
            createdAt: new Date()
        };

        await db.collection("friends").insertOne(friendRequest);
        res.status(201).json({ message: "Demande d'ami envoyée" });

    } catch (err) {
        return res.status(500).json(`Erreur serveur: ${err.message}`);
    }
});

// Accepter une demande d'ami
router.post("/friends/accept", isAuthenticated, async (req, res) => {
    try {
        const { friendRequestId } = req.body;
        
        if (!friendRequestId) {
            return res.status(400).json("ID de demande requis");
        }
        const db = req.app.locals.db;
        // Vérifier que la demande existe et appartient à l'utilisateur actuel
        const friendRequest = await db.collection("friends").findOne({
            _id: new ObjectId(friendRequestId),
            to: new ObjectId(req.session.userId),
            status: "pending"
        });

        if (!friendRequest) {
            return res.status(404).json("Demande non trouvée");
        }

        // Accepter la demande
        await db.collection("friends").updateOne(
            { _id: new ObjectId(friendRequestId) },
            { $set: { status: "accepted", acceptedAt: new Date() } }
        );

        res.status(200).json({ message: "Demande d'ami acceptée" });

    } catch (err) {
        return res.status(500).json(`Erreur serveur: ${err.message}`);
    }
});

// Refuser la demande
router.post("/friends/reject", isAuthenticated, async (req, res) => {
    try {
        const { friendRequestId } = req.body;
        
        if (!friendRequestId) {
            return res.status(400).json("ID de demande requis");
        }
        const db = req.app.locals.db;
        const friendRequest = await db.collection("friends").findOne({
            _id: new ObjectId(friendRequestId),
            to: new ObjectId(req.session.userId),
            status: "pending"
        });
        if (!friendRequest) {
            return res.status(404).json("Demande non trouvée");
        }
        // Refuser la demande
        await db.collection("friends").deleteOne({ _id: new ObjectId(friendRequestId) });
        res.status(200).json({ message: "Demande d'ami refusée" });
    } catch (err) {
        return res.status(500).json(`Erreur serveur: ${err.message}`);
    }
});

// Obtenir la liste damis
router.get("/friends/list", isAuthenticated, async (req, res) => {
    try {
        const db = req.app.locals.db;
        const userId = new ObjectId(req.session.userId);
        const friends = await db.collection("friends").find({
            $or: [
                { from: userId, status: "accepted" },
                { to: userId, status: "accepted" }
            ]
        }).toArray();
        const friendList = friends.map(f => ({
            friendId: f.from.toString() === userId.toString() ? f.to : f.from,
            friendPseudo: f.from.toString() === userId.toString() ? f.toPseudo : f.fromPseudo
        }));
        res.status(200).json({ friends: friendList });
    } catch (err) {
        return res.status(500).json(`Erreur serveur: ${err.message}`);
    }
});

// liste demandes d'ami en attente
router.get("/friends/pending", isAuthenticated, async (req, res) => {
    try {
        const db = req.app.locals.db;
        const userId = new ObjectId(req.session.userId);
        const pendingRequests = await db.collection("friends").find({
            to: userId,
            status: "pending"
        }).toArray();
        res.status(200).json({ pending: pendingRequests });
    } catch (err) {
        return res.status(500).json(`Erreur serveur: ${err.message}`);
    }
});

module.exports = router;
