/* eslint-disable react/prop-types */
function AdminPanel({ usersList, pendingUsers, handleValidateRegistration, handleToggleAdminRole, currentUser }) {
    return (
        <div className="forum-thread-card" style={{ padding: "25px" }}>
            <h2>🛠️ Panel de Gestion du Conseil d'Administration</h2>
            <hr style={{ borderColor: "var(--border)", margin: "15px 0" }} />
            
            <h3>1. Demandes d'inscription en attente</h3>
            <ul style={{ listStyle: "none", padding: 0 }}>
                {pendingUsers.length === 0 && (
                    <li style={{ padding: "10px", color: "gray" }}>Aucune inscription en attente.</li>
                )}
                {pendingUsers.map((u, i) => (
                    <li key={i} style={{ padding: "10px", background: "var(--code-bg)", margin: "5px 0", borderRadius: "6px", display: "flex", justifyContent: "space-between" }}>
                        <span><b>@{u.pseudo || u.username}</b> ({u.firstname} {u.lastname}) - {u.valide ? "🟢 Validé" : "⏳ En attente"}</span>
                        {!u.valide && <button style={{ background: "#2a6645", color: "white", border: "none", padding: "4px 8px", cursor: "pointer" }} onClick={() => handleValidateRegistration(u.pseudo || u.username)}>Valider</button>}
                    </li>
                ))}
            </ul>

            <h3 style={{ fontSize: "15px", marginTop: "25px" }}>2. Rôles des Administrateurs</h3>
            <ul style={{ listStyle: "none", padding: 0 }}>
                {usersList.filter(u => u.valide).map((u, i) => (
                    <li key={i} style={{ padding: "10px", background: "var(--code-bg)", margin: "5px 0", borderRadius: "6px", display: "flex", justifyContent: "space-between" }}>
                        <span><b>@{u.pseudo || u.username}</b> - Rôle : <b>{u.role.toUpperCase()}</b></span>
                        {(u.pseudo !== currentUser.username && u.username !== currentUser.username) ? (
                            <button style={{ background: "var(--accent)", color: "white", border: "none", padding: "4px 8px", cursor: "pointer" }} onClick={() => handleToggleAdminRole(u)}>Toggle Rôle</button>
                        ) : <span style={{ fontSize: "11px", color: "gray" }}>Auto-modification bloquée</span>}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default AdminPanel;