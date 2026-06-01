const mongoose = require("mongoose");

const friendsSchema = new mongoose.Shchema({

    sender: {type: mongoose.Schema.Types.ObjectId, ref: "User, required: true"},
    receiver: {type: mongoose.Schema.Types.ObjectId, ref: "User, required: true"},
    status: {type: String, enum: ["attente", "accpete", "rejete"], default: "attente"},
    date: {type: Date, default: Date.now}
});