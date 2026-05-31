const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    pseudo: { type: String, required: true, unique: true },
    motDePasse: { type: String, required: true },
    firstname: {type: String, required: true},
    lastname: {type: String, required: true},
    role: { type: String, enum: ["membre", "admin"], default: "membre" },
    dateCreation : { type: Date, required: true},
    avatar: { type: String, default: "" },
    valide: {type: Boolean, default: false}
});


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
