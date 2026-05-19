const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    pseudo: { type: String, required: true, unique: true },
    motDePasse: { type: String, required: true },
    role: { type: String, enum: ["membre", "admin"], default: "membre" },
    dateCreation : { type: Date },
    avatar: { type: String, default: "" },
    valide: {type: Boolean, default: false}
});

module.exports = mongoose.model("User", userSchema);
