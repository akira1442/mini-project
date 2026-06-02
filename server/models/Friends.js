const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb");

// ENVOYER UNE DEMANDE D'AMI
router.post("/friends/request", async (req, res) => {
    try {
        const { senderId, receiverId } = req.body;
        const db = req.app.locals.db;

        if (!senderId || !receiverId) throw new Error();

        await db.collection("friends").insertOne({
            sender: new ObjectId(senderId),
            receiver: new ObjectId(receiverId),
            status: "attente",
            date: new Date()
        });

        return res.status(201).send("Demande d'ami envoyée !");
    } catch (err) {
        return res.status(400).send("Impossible d'envoyer la demande d'ami.");
    }
});

// ACCEPTER OU REFUSER UNE DEMANDE
router.put("/friends/respond", async (req, res) => {
    try {
        const { requestId, status } = req.body;
        const db = req.app.locals.db;

        if (!["accepte", "rejete"].includes(status) || !requestId) throw new Error();

        const result = await db.collection("friends").updateOne(
            { _id: new ObjectId(requestId) },
            { $set: { status: status } }
        );

        if (result.matchedCount === 0) throw new Error();

        return res.status(200).send(`Demande d'ami mise à jour : ${status}`);
    } catch (err) {
        return res.status(400).send("Impossible de traiter la demande d'ami.");
    }
});

module.exports = router;