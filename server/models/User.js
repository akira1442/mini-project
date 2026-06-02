const { ObjectId } = require("mongodb");
async function demandeAmi(db, userId, pseudoCible) {
    const userCible = await db.collection("users").findOne({ pseudo: pseudoCible.trim().toLowerCase() });
    if (!userCible) {
        throw new Error("Utilisateur cible introuvable");
    }

    if (userId.toString() === userCible._id.toString()) {
        throw new Error("Erreur : demande impossible à soi-même");
    }

    const newDemande = {
        sender: new ObjectId(userId),
        receiver: userCible._id,
        status: "en_attente",
        date: new Date()
    };

    await db.collection("friends").insertOne(newDemande);
    return newDemande;
}

//Vérifier si la demande d'ami existe
async function existeDemande(db, userId, pseudoCible) {
    const userCible = await db.collection("users").findOne({ pseudo: pseudoCible.trim().toLowerCase() });
    if (!userCible) {
        return false;
    }
    const demande = await db.collection("friends").findOne({
        sender: new ObjectId(userId),
        receiver: userCible._id,
        status: "en_attente"
    });
    return demande !== null;
}

//Accepter demande d'ami
async function accepteAmi(db, demandeId, userId) {
    const demande = await db.collection("friends").findOne({ _id: new ObjectId(demandeId) });
    if (!demande) {
        throw new Error("Erreur : demande introuvable");
    }
    if (demande.receiver.toString() !== userId.toString()) {
        throw new Error("Erreur : non autorisé");
    }
    await db.collection("friends").updateOne(
        { _id: new ObjectId(demandeId) },
        { $set: { status: "accepte" } }
    );
    await db.collection("users").updateOne(
        { _id: demande.sender },
        { $addToSet: { friends: demande.receiver } }
    );
    await db.collection("users").updateOne(
        { _id: demande.receiver },
        { $addToSet: { friends: demande.sender } }
    );
    return demande;
}

async function toAdmin(db, pseudo) {
    return await db.collection("users").findOneAndUpdate(
        { pseudo: pseudo.trim().toLowerCase() },
        { $set: { role: "admin" } },
        { returnDocument: "after" }
    );
}

async function toUser(db, pseudo) {
    return await db.collection("users").findOneAndUpdate(
        { pseudo: pseudo.trim().toLowerCase() },
        { $set: { role: "membre" } },
        { returnDocument: "after" }
    );
}

async function deleteUser(db, pseudo) {
    return await db.collection("users").deleteOne({
        pseudo: pseudo.trim().toLowerCase()
    });
}

module.exports = {
    demandeAmi,
    existeDemande,
    accepteAmi,
    toAdmin,
    toUser,
    deleteUser
};