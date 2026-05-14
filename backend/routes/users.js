const express = require("express");
const User = require("../models/User");
const Message = require("../models/Message");

const router = express.Router();
const jwt = require("jsonwebtoken");
const JWT_SECRET = "secret"

function is_login(req, res, next){

    const token = req.headers.authorization?.splt(" ")[1];
    if (!token) return res.status(401).json("Il manque le token");

    try{
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    }catch (err){
        return res.status(401).json("Le token est invallide");
    }
}