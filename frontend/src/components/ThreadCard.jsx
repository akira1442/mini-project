/* eslint-disable react/prop-types */
import React from "react";
import AddMsg from "./AddMsg";

function ThreadCard({
    thread,
    user,
    usersList,
    setSelectedProfile,
    setCurrentView,
    activeThreadReplyId,
    setActiveThreadReplyId,
    likedThreads,
    handleLike,
    handleDeleteThread,
    handleCreateReply,
    handleDeleteReply
}) {
    return (
        <li className="forum-thread-card">
            <div className="forum-card-header">
                <p>
                    <span
                        style={{ cursor: "pointer", textDecoration: "underline" }}
                        onClick={() => {
                            setSelectedProfile(usersList.find(u => (u.pseudo || u.username) === thread.auteur) || { username: thread.auteur });
                            setCurrentView("profil");
                        }}
                    >
                        @{thread.auteur}
                    </span>
                    <span className="forum-thread-date" style={{ marginLeft: "10px", fontSize: "12px", color: "#888" }}>
                        {new Date(thread.date).toLocaleString("fr-FR")}
                    </span>
                </p>
                <div className="forum-card-actions">
                    <button className="forum-sort-tab" style={{ fontSize: "12px" }} onClick={() => setActiveThreadReplyId(activeThreadReplyId === thread._id ? null : thread._id)}>💬 Répondre</button>
                    <button className={`forum-like-trigger ${likedThreads.includes(thread._id) ? "is-liked" : ""}`} onClick={() => handleLike(thread._id)}>❤️ {thread.likes || 0}</button>
                    {(user.username === thread.auteur || user.role === "admin") && <button className="forum-delete-trigger" onClick={() => handleDeleteThread(thread._id)}>❌</button>}
                </div>
            </div>
            <h2>{thread.title || "Message"}</h2>
            <blockquote className="forum-card-blockquote">
                <p>{thread.text}</p>

                {activeThreadReplyId === thread._id && (
                    <div style={{ marginTop: "10px" }}>
                        <AddMsg write={handleCreateReply} isReply={true} threadId={thread._id} placeholder="Écrire un commentaire..." />
                    </div>
                )}

                {(thread.replies || []).map((reply, index) => (
                    <div key={index} className="forum-nested-reply">
                        <div className="forum-reply-meta">
                            <p>
                                <b>@{reply.author}</b>
                                {reply.date && <span style={{ marginLeft: "10px", fontSize: "12px", color: "#888" }}>{new Date(reply.date).toLocaleString("fr-FR")}</span>}
                            </p>
                            {(user.username === reply.author || user.role === "admin") && <button className="forum-reply-delete" onClick={() => handleDeleteReply(thread._id, index)}>Supprimer</button>}
                        </div>
                        <blockquote className="forum-reply-content-text">{reply.text}</blockquote>
                    </div>
                ))}
            </blockquote>
        </li>
    );
}

export default ThreadCard;