const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    pseudo: { type: String, required: true, unique: true },
    motDePasse: { type: String, required: true },
    firstname: {type: String, required: true},
    lastname: {type: String, required: true},
    dateNaissance: {type: Date, required: true},
    role: { type: String, enum: ["membre", "admin"], default: "membre" },
    dateCreation : { type: Date, required: true},
    valide: {type: Boolean, default: false}
});

// Creer une nouvelle demande d'ami
userSchema.static.demandeAmi = async function(userId, pseudoCible){

    const userCible = await this.findOne({ pseudo: pseudoCible });
    
    if (!userCible) {
        throw new Error("Utilisateur cible introuvable");
    }
    
    // On s'assure qu'on ne fais pas une demande a nous meme
    if (userId.toString() === userCible._id.toString()) {
        throw new Error("Erreur demande impossible");
    }
    
    const newDemande = new Friend({
        sender: userId,
        receiver: userCible._id,
        status: 'en_attente'
    });
    
    await newDemande.save();

    return newDemande;
}

// Verifie si la demande d'ami existe
userSchema.static.existeDemande = async function(userId, pseudoCible){
    
    const userCible = this.findOne({pseudo: pseudoCible});

    if (!userCible){
        return false;
    }

    const demande = await Friends.findOne({sender: userId}, {receiver: userCible._id}, {status: "attente"});
    
    return demande !== null; 
}

// Accepter une demande d'ami
userSchema.static.accepteAmi() = async function(demandeId, userId){

    const demande = await Friend.findById(demandeId);

    if (!demande){
        throw new Error("Erreur demande introuvable");
    }

    if (demande.receiver.toString() !== userId.toString()){
        throw new Error("Erreur non autorise");
    }

    demande.status = "accepte";
    await demande.save();

    await this.findByIdAndUpdate(demande.sender, { $addToSet: { friends: demande.receiver } });
    await this.findByIdAndUpdate(demande.receiver, { $addToSet: { friends: demande.sender } });

    return demande;
}

// Promotion au role d'admin (necessite le role Admin)
userSchema.statics.toAdmin = async function(pseudo) {
    
    return this.findOneAndUpdate(
        {pseudo: pseudo.toLowerCase()},
        {role: "membre"}
    );
}

// Relégation au role de user (necessite le role Admin)
userSchema.statics.toUser = async function(pseudo) {
    
    return this.findOneAndUpdate(
        {pseudo: pseudo.toLowerCase()},
        {role: "admin"}
    );
}

// Suppression d'un user (necessite le role Admin) 
userSchema.statics.delete = async function(pseudo) {
    
    return await this.findOne({pseudo: pseudo.toLowerCase()});
}

module.exports = mongoose.model("User", userSchema);
