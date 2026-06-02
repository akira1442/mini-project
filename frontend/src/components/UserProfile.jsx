/* eslint-disable react/prop-types */
import React from "react";

function UserProfile({ user, selectedProfile, threads, handleDeleteThread }) {
    return (
        <div className="forum-thread-card" style={{ padding: "25px" }}>
            <h2>👤 Profil de @{selectedProfile ? selectedProfile.username : user.username}</h2>
            <p><b>Rôle :</b> {selectedProfile ? selectedProfile.role : user.role}</p>

            {!selectedProfile && (
                <div className="infos-personnelles" style={{ marginTop: "20px", padding: "15px", background: "var(--code-bg)", borderRadius: "8px" }}>
                    <h3 style={{ marginTop: 0, color: "var(--accent)" }}>PROFIL</h3>
                    <p><b>Prénom :</b> {user.firstname}</p>
                    <p><b>Nom :</b> {user.lastname}</p>
                    <p><b>Identifiant :</b> {user.username}</p>
                    <p><b>Date de naissance :</b> {user.birthdate ? new Date(user.birthdate).toLocaleDateString("fr-FR") : "Non renseignée"}</p>
                    <p><b>Adresse mail :</b> {user.email || "Non renseignée"}</p>
                </div>
            )}

            <h3 style={{ marginTop: "25px" }}>Messages publiés :</h3>
            <ul>
                {threads
                    .filter(t => t.auteur === (selectedProfile ? selectedProfile.username : user.username))
                    .map(t => (
                        <li key={t._id}>
                            {(t.title || t.text).substring(0, 50)}...{" "}
                            {(!selectedProfile || user.role === "admin") && (
                                <button onClick={() => handleDeleteThread(t._id)} style={{ marginLeft: "10px", padding: "2px 5px", fontSize: "12px" }}>
                                    Supprimer
                                </button>
                            )}
                        </li>
                    ))
                }
            </ul>
        </div>
    );
}

export default UserProfile;