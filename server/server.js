require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;

const userRoutes = require("./routes/users");
const messageRoutes = require("./routes/messages");
const friendRoutes = require("./routes/friends");

const app = express();
const PORT = process.env.PORT || 1442;
const MONGO_URI = process.env.MONGO_URI;
const bdd_NAME = process.env.DB_NAME || "mini_project";

if (!MONGO_URI) {
  throw new Error("MONGO_URI manquante dans le fichier .env");
}

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"], 
  credentials: true, 
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

const client = new MongoClient(MONGO_URI);
let bdd = null;

async function connectionBDD() {

  if (!bdd) {
    await client.connect();
    bdd = client.db(bdd_NAME);
    app.locals.db = bdd; // rend la bdd accessible partout via req.app.locals.db
    console.log("Mongobdd connected");
  }

  return bdd;
}

connectionBDD().then(() => {
  app.use(session({
    secret: "totosecret123",
    resave: true,
    saveUninitialized: true,
    store: new MongoStore({ client }),
    cookie: { maxAge: 3600000 }
  }));

  app.use(userRoutes);
  app.use(messageRoutes);
  app.use(friendRoutes);

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}).catch(err => console.error("Erreur d'initialisation :", err));