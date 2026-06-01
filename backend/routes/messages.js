const router = express.Router();
const Messages = require("../models/Messages");4

// Nouveau message
router.put("/message", async (req, res) => {

    const {auteur, date, text, reponse} = req.body;

    if (!auteur || !date || !text || !reponse){
        res.status(400).send("Erreur de champs");
    }else{
        const newMSG = new Messages({
            auteur: auteur,
            date: date,
            text: text,
            reponse: reponse
        });

        res.status(201).send("Message OK");
    }

    try{
        await newMSG.save();
    }catch(e){
        return res.status(500).send(e.message);
    }
});

// Supprimer un message
router.delete("/messages/:id", 
    isAuthenticated,
    async (req, res) => {
        try {
            const messageId = req.params.id;
            const userId = req.user.id;
            const userRole = req.user.role;
            
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
    }
);

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