const router = express.Router();
const Messages = require("../models/Messages");4

function isAuthenticated(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json("Non authentifié");
    }
    next(); 
}

// Nouveau message
router.post("/message", isAuthenticated, async (req, res) => {

    const {text} = req.body;

    if (!text || text.trim() === ""){
        res.status(400).send("Erreur le message est vide");
    }

    try{
        const userId = req.session.userId;

        const newMSG = new Messages({
            auteur: req.session.pseudo,
            userId: userId,
            date: new Date(),
            text: text.trim(),
            reponse: [],
        });

        await newMSG.save();
        res.status(201).send("Message crée");
    }catch(e){
        return res.status(500).send(e.message);
    }
});

// Supprimer un message
router.delete("/messages/:id", isAuthenticated, async (req, res) => {
    try {
        const messageId = req.params.id;
        const userId = req.session.userId;
        const userRole = req.session.role;
        
        if (!userId){
            return res.status(401).json("Session non valide");
        }

        const deleted = await Message.supprimeMSG(messageId, userId, userRole);
        
        if (!deleted) {
            return res.status(404).json("Message introuvable");
        }
        
        res.status(200).json("Message supprimé OK");
    } catch (err) {
        if (err.message === "Non autorisé") {
            return res.status(403).json("Vous n'êtes pas autorisé à supprimer ce message");
        }
        res.status(500).json("Erreur serveur");
    }
});

// Recuperer la liste de tout les messages
router.get("/message/list", async (req, res) => {

    const list = await message.getList();
    list = await list.toArray();
    res.status(200).json({
        status: 200,
        message: "liste des messages récupérer",
        body: list
    });
})

// Recuperer la liste de tout les messages d'un user

router.get("/message/user/:userId", isAuthenticated, async (req, res) => {

    try {
        const userId = req.params.userId;

        if (!mongoose.Types.ObjectId.isValid(userId)){
            return res.status(400).json("ID invalide");
        }

        const messages = await Messages.find({userId: userId}).sort({date: -1});

        res.status(200).json({
            count: messages.length,
            messages: messages
        });
    }catch(e){
        res.status(500).send("Erreur lors de la suppression du message");
    }
});