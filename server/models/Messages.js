const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb"); 

// SUPPRIMER UN MESSAGE
async function supprimeMSG(db, msgId, userId, userRole) {
    const msg = await db.collection("messages").findOne({ _id: new ObjectId(msgId) });
    if (!msg) {
        return null;
    }

    //Vérif des droits
    const estAdmin = userRole === "admin";
    const estAuteur = userId.toString() === msg.userID.toString();
    if (estAuteur || estAdmin) {
        return await db.collection("messages").deleteOne({ _id: new ObjectId(msgId) });
    }
    throw new Error("Erreur: tu n'as pas l'autorisation de supprimer ce message.");
}

router.delete("/message/:id", async (req, res) => {
    try {
        const { userId, userRole } = req.body;
        const db = req.app.locals.db;

        const resultat = await supprimeMSG(db, req.params.id, userId, userRole);

        if (!resultat) return res.status(400).send("Impossible de supprimer ce message.");

        return res.status(200).send("Message supprimé avec succès");
    } catch (err) {
        return res.status(400).send("Impossible de supprimer ce message.");
    }
});

module.exports = router;