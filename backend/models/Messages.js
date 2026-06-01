const mongoose = require("mongoose");
const User = require("../models/User");

const messageSchema = new mongoose.Schema({
    msgID: {type: String},
    auteur: {type: String, required: true},
    date: {type: Date, required: true},
    text: {type: String, required: true},
    reponse: {type: String}
});

// Supprimer un message 
messageSchema.statics.supprimeMSG = async function(msgId, user){

    const msg = await this.findById(msgId);

    if (!msg){
        return null;
    }

    if (msg.auteur.toString() !== user && user.role != "admin"){
        throw new Error("Non autorisé");
    }

    return this.findByIdAndDelete(msgId);
}