require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const app = express();

const PORT = process.env.PORT || 1442;
const MONGO_URI = process.env.MONGO_URI;
const bdd_NAME = process.env.DB_NAME || "mini_project";

if (!MONGO_URI) {
  throw new Error("MONGO_URI is required");
}

app.use(cors());
app.use(express.json());

const client = new MongoClient(MONGO_URI);
let bdd = null;

/**
 * @async : connection BDD peut prendre du temps et être bloquant
 * le mot clef @await  pour attendre la fin d'une opération asynchrone
 */
async function connectionBDD() {

  if (!bdd) {
    await client.connect();
    bdd = client.db(bdd_NAME);
    console.log("Mongobdd connected");
  }

  return bdd;
}

/**
 * Test si le serveur fonctionne
 */
app.get("/", (req, res) => {
  res.send("OK! Server is running");
});

/**
 * Récupère les messages de MandoDB
 * Les messages sont triés dans l'ordre croissant
 * Renvoie un tableau json
 */
app.get("/messages", async (req, res) => {

  try {
    const database = await connectionBDD();
    const messages = await database
      .collection("messages")
      .find()
      .sort({ createdAt: -1 })      // -1 permet de trié dans l'ordre croissant
      .toArray();

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "server error" });
  }
});

/**
 * Traitement des messages venant du front
 * Le message est stocké dans MongoDB
 */
app.post("/messages", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({ error: "text is required" });
    }

    const database = await connectionBDD();

    await database.collection("messages").insertOne({
      text: text.trim(),
      createdAt: new Date()
    });

    const messages = await database
      .collection("messages")
      .find()
      .sort({ createdAt: -1 })
      .toArray();

    res.status(201).json(messages);
  } catch (error) {
    res.status(500).json({ error: "server error" });
  }
});


/**
 * Connection au server sur le port 1442
 */
connectionBDD()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server:", error);
  });