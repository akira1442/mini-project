const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    auteur: {type: String, required: true},
    userID: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    date: {type: Date, required: true},
    text: {type: String, required: true},
    reponse: {type: String}
});

// Supprimer un message 
messageSchema.statics.supprimeMSG = async function(msgId, userId, userRole){

    const msg = await this.findById(msgId);

    if (!msg){
        return null;
    }

    const estAdmin = userRole === "admin";
    const estAuteur = userId.toString() == msg.userId.toString();

    if (estAuteur || estAdmin){
        return this.findByIdAndDelete(msgId);
    }

    throw new Error("Erreur de droit");
}