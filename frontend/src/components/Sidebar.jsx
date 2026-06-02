/* eslint-disable react/prop-types */
function Sidebar({
    time, searchQuery, setSearchQuery, dateDeb, setDateDeb, dateFin, setDateFin,
    notifications, friendInput, setFriendInput, handleAddFriend,
    pendingFriendRequests, handleAcceptFriendRequest, handleRejectFriendRequest,
    messagesPrives, mpDest, setMpDest, mpTxt, setMpTxt, handleSendMP, showSearch
}) {
    return (
        <aside className="forum-sidebar-area">
            {showSearch && (
                <div id="search" className="forum-search-bar-zone">
                    <form id="search_form" className="forum-search-form" onSubmit={(e) => e.preventDefault()}>
                        <div className="forum-search-input-group">
                            <label htmlFor="sidebar-search" className="forum-hidden-label">Rechercher</label>
                            <input
                                id="sidebar-search"
                                placeholder="Mot-clé, auteur..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div id="filtre_div" className="forum-filters-row">
                            <label>Du <input type="date" value={dateDeb} onChange={(e) => setDateDeb(e.target.value)} /></label>
                            <label>Au <input type="date" value={dateFin} onChange={(e) => setDateFin(e.target.value)} /></label>
                        </div>
                    </form>
                </div>
            )}

            <div className="forum-aside-card">
                <h4>🕒 Heure locale</h4>
                <p className="forum-clock-text">{time}</p>
            </div>

            <div className="forum-aside-card">
                <h4>👥 Amis & Notifications</h4>
                {pendingFriendRequests && pendingFriendRequests.length > 0 && (
                    <div style={{ marginBottom: "15px" }}>
                        <h5 style={{ margin: "0 0 10px 0", color: "#aa3bff" }}>Demandes reçues</h5>
                        <ul className="forum-notif-list">
                            {pendingFriendRequests.map(req => (
                                <li key={req._id} style={{ display: "flex", flexDirection: "column", gap: "5px", marginBottom: "10px" }}>
                                    <span><b>@{req.fromPseudo}</b> veut être votre ami</span>
                                    <div style={{ display: "flex", gap: "5px" }}>
                                        <button onClick={() => handleAcceptFriendRequest(req._id)} style={{ padding: "4px 8px", fontSize: "12px", background: "#4CAF50", color: "white", border: "none", borderRadius: "3px", cursor: "pointer" }}>Accepter</button>
                                        <button onClick={() => handleRejectFriendRequest(req._id)} style={{ padding: "4px 8px", fontSize: "12px", background: "#f44336", color: "white", border: "none", borderRadius: "3px", cursor: "pointer" }}>Refuser</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                <ul className="forum-notif-list">
                    {notifications.map((n, i) => <li key={i}>{n}</li>)}
                </ul>
                <form onSubmit={handleAddFriend} className="forum-aside-form">
                    <input placeholder="Suivre un membre..." value={friendInput} onChange={(e) => setFriendInput(e.target.value)} />
                    <button type="submit">Ajouter</button>
                </form>
            </div>

            <div className="forum-aside-card">
                <h4>✉️ Messagerie privée</h4>
                <div className="forum-mp-history">
                    {messagesPrives.map((m, i) => (
                        <p key={i} className="forum-mp-line">
                            ➡️ <b>{m.sender || m.dest}</b>: {m.text}
                        </p>
                    ))}
                </div>
                <form onSubmit={handleSendMP} className="forum-aside-form">
                    <input placeholder="Destinataire" value={mpDest} onChange={(e) => setMpDest(e.target.value)} required />
                    <input placeholder="Message..." value={mpTxt} onChange={(e) => setMpTxt(e.target.value)} required />
                    <button type="submit">Envoyer</button>
                </form>
            </div>
        </aside>
    );
}

export default Sidebar;