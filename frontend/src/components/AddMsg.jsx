/* eslint-disable react/prop-types */
import { useState } from "react";

function AddMsg({ write, forum, placeholder, isReply, threadId }) {
    const [title, setTitle] = useState("");
    const [text, setText] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isReply) {
            if (!text.trim()) return;
            write(e, threadId, text);
            setText("");
        } else {
            if (!title.trim() || !text.trim()) return;
            write(title, text);
            setTitle("");
            setText("");
        }
    };

    return (
        <form className="forum-editor-form" onSubmit={handleSubmit}>
            <label htmlFor={isReply ? `reply-${threadId}` : "new-title"}>
                {isReply ? "Ajouter une réponse" : `Lancer un sujet sur le ${forum === "forum_privé" ? "Forum privé (CA)" : "Forum Ouvert"}`}
            </label>

            <div className="forum-editor-inputs">
                {!isReply && (
                    <input
                        type="text"
                        id="new-title"
                        placeholder="Titre de la discussion..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                )}
                <textarea
                    id={isReply ? `reply-${threadId}` : "new-text"}
                    rows={isReply ? "1" : "3"}
                    placeholder={placeholder || "Développez votre propos ici..."}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    required
                />
                <button type="submit" className="forum-editor-submit">
                    {isReply ? "Répondre" : "Publier"}
                </button>
            </div>
        </form>
    );
}

export default AddMsg;