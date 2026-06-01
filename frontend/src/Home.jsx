/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import logo from "./assets/logo_noir.png";
import AddMsg from "./components/AddMsg";
import Sidebar from "./components/Sidebar";
import AdminPanel from "./components/AdminPanel";
import "./Home.css";

function Home({ user, onLogout, api }) {
    const [time, setTime] = useState(new Date().toLocaleTimeString("fr-FR"));
    const [isBirthdayToday, setIsBirthdayToday] = useState(false);
    const [currentView, setCurrentView] = useState("forume_public");
    const [selectedProfile, setSelectedProfile] = useState(null);

    const [threads, setThreads] = useState([
        {
            id: 1,
            author: "Nawad",
            date: "2026-05-30T13:51:00",
            title: "Bienvenue sur le forum public !",
            text: "forum public des membres.",
            forum: "public",
            likes: 5,
            replies: [{ author: "Robin_B", date: "2026-05-30T13:52:00", text: "yeaay trop stylé" }]
        },
        {
            id: 2,
            author: "Nawad",
            date: "2026-06-01T10:00:00",
            title: "blablabla confidentiel",
            text: "Discussion sur les sujets sensibles.",
            forum: "ferme",
            likes: 1,
            replies: []
        }
    ]);

    const [usersList, setUsersList] = useState([
        { username: "Rob", firstName: "Robin", lastName: "B", email: "robin@rob.fr", role: "admin", isValidated: true },
        { username: "Naw", firstName: "Nawad", lastName: "K", email: "nawad@naw.fr", role: "admin", isValidated: true },
        { username: "FuturMembre45", firstName: "Monsieur", lastName: "Test", email: "marc@test.fr", role: "membre", isValidated: false },
        { username: "FutureMembre74", firstName: "Madame", lastName: "Testblob", email: "lia@test.fr", role: "membre", isValidated: true }
    ]);

    const [likedThreads, setLikedThreads] = useState([]);
    const [activeThreadReplyId, setActiveThreadReplyId] = useState(null);
    const [aMenti, setAMenti] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [dateDeb, setDateDeb] = useState("");
    const [dateFin, setDateFin] = useState("");
    const [sortBy, setSortBy] = useState("date");
    const [friends, setFriends] = useState([]);
    const [friendInput, setFriendInput] = useState("");
    const [notifications, setNotifications] = useState(["Bienvenue sur l'application !"]);
    const [messagesPrives, setMessagesPrives] = useState([]);
    const [mpDest, setMpDest] = useState("");
    const [mpTxt, setMpTxt] = useState("");

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date().toLocaleTimeString("fr-FR")), 1000);
        if (user?.birthdate) {
            const today = new Date();
            const bDate = new Date(user.birthdate);
            if (today.getDate() === bDate.getDate() && today.getMonth() === bDate.getMonth()) {
                setIsBirthdayToday(true);
            }
        }
        return () => clearInterval(timer);
    }, [user]);

    const handleCreateThread = (title, text) => {
        const newMsg = {
            id: Date.now(),
            author: user.username,
            date: new Date().toISOString(),
            title,
            text,
            forum: currentView === "forume_prive" ? "ferme" : "public",
            likes: 0,
            replies: []
        };
        setThreads([newMsg, ...threads]);
    };

    const handleCreateReply = (e, threadId, text) => {
        e.preventDefault();
        const newReply = { author: user.username, date: new Date().toISOString(), text };
        setThreads(threads.map(t => t.id === threadId ? { ...t, replies: [...t.replies, newReply] } : t));
        setActiveThreadReplyId(null);
    };

    const handleDeleteThread = (threadId) => setThreads(threads.filter(t => t.id !== threadId));
    
    const handleDeleteReply = (threadId, replyIndex) => {
        setThreads(threads.map(t => t.id === threadId ? { ...t, replies: t.replies.filter((_, idx) => idx !== replyIndex) } : t));
    };

    const handleLike = (threadId) => {
        if (likedThreads.includes(threadId)) {
            setThreads(threads.map(t => t.id === threadId ? { ...t, likes: t.likes - 1 } : t));
            setLikedThreads(likedThreads.filter(id => id !== threadId));
        } else {
            setThreads(threads.map(t => t.id === threadId ? { ...t, likes: t.likes + 1 } : t));
            setLikedThreads([...likedThreads, threadId]);
        }
    };

    const handleValidateRegistration = (username) => {
        setUsersList(usersList.map(u => u.username === username ? { ...u, isValidated: true } : u));
    };

    const handleToggleAdminRole = (targetUser) => {
        if (targetUser.username === user.username) return;
        setUsersList(usersList.map(u => u.username === targetUser.username ? { ...u, role: u.role === "admin" ? "membre" : "admin" } : u));
    };

    const filteredAndSortedThreads = threads
        .filter(t => {
            if (currentView === "forume_public") return t.forum === "public";
            if (currentView === "forume_prive") return t.forum === "ferme";
            if (currentView === "likes") return likedThreads.includes(t.id);
            return true;
        })
        .filter(t => {
            const matchesKeyword = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.author.toLowerCase().includes(searchQuery.toLowerCase());
            const threadDate = new Date(t.date);
            const matchesDateDeb = dateDeb ? threadDate >= new Date(dateDeb) : true;
            const matchesDateFin = dateFin ? threadDate <= new Date(dateFin + "T23:59:59") : true;
            return matchesKeyword && matchesDateDeb && matchesDateFin;
        })
        .sort((a, b) => sortBy === "popularity" ? b.likes - a.likes : new Date(b.date) - new Date(a.date));

    return (
        <div className="forum-isolated-layout">
            {isBirthdayToday && (
                <div className="birthday-overlay-panel">
                    <div className="birthday-modal-card" style={{ borderColor: aMenti ? "#c0392b" : "#aa3bff" }}>
                        {!aMenti ? (
                            <>
                                <h2 style={{ textAlign: "center", lineHeight: "1.4" }}>
                                    🎉 Joyeux Anniversaire {user.firstName} {user.lastName}
                                </h2>

                                <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "20px" }}>
                                    <button className="birthday-ack-btn" onClick={() => setIsBirthdayToday(false)}>
                                        Merci !
                                    </button>
                                    <button
                                        className="birthday-ack-btn"
                                        style={{ backgroundColor: "#c0392b" }}
                                        onClick={() => setAMenti(true)}
                                    >
                                        Ce n'est pas mon anniversaire
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <h2 style={{ textAlign: "center", color: "#c0392b", fontSize: "28px" }}>
                                    COMPTE SUSPENDU
                                </h2>
                                <p style={{ textAlign: "center", fontWeight: "bold", fontSize: "18px", margin: "20px 0", color: "#08060d" }}>
                                    TU NOUS AS MENTI SUR TA DATE DE NAISSANCE !
                                    <br /><br />
                                    <span style={{ color: "#c0392b" }}>TON COMPTE VA ÊTRE SUPPRIMÉ D'ICI 10 SECONDES.</span>
                                </p>
                                <button
                                    className="birthday-ack-btn"
                                    style={{ backgroundColor: "#08060d" }}
                                    onClick={() => {
                                        setAMenti(false);
                                        setIsBirthdayToday(false);
                                    }}
                                >
                                (je n'ai rien vu)
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            <header className="forum-header-block">
                <div className="forum-top-navbar">
                    <div className="forum-nav-brand">
                        <img src={logo} alt="Logo" className="forum-nav-logo-img" />
                        <div className="forum-nav-center-menu">
                            <button className={currentView === "forume_public" ? "active" : ""} onClick={() => { setCurrentView("forume_public"); setSelectedProfile(null); }}>Forum public</button>
                            {user.role === "admin" && <button className={currentView === "forume_prive" ? "active" : ""} onClick={() => { setCurrentView("forume_prive"); setSelectedProfile(null); }}>Forum privé (ADMIN)</button>}
                            <button className={currentView === "likes" ? "active" : ""} onClick={() => { setCurrentView("likes"); setSelectedProfile(null); }}>Likes</button>
                            <button className={currentView === "profil" && !selectedProfile ? "active" : ""} onClick={() => { setSelectedProfile(null); setCurrentView("profil"); }}>Profil</button>
                            <button className={currentView === "amis" ? "active" : ""} onClick={() => { setCurrentView("amis"); setSelectedProfile(null); }}>Amis</button>
                            <button className={currentView === "faq" ? "active" : ""} onClick={() => { setCurrentView("faq"); setSelectedProfile(null); }}>FAQ</button>
                            {user.role === "admin" && <button className={currentView === "admin_panel" ? "active" : ""} onClick={() => { setCurrentView("admin_panel"); setSelectedProfile(null); }}>Page Admin</button>}
                        </div>
                    </div>
                    <div className="forum-nav-right">
                        <span className="forum-user-badge">@{user.username}</span>
                        <button className="forum-logout-btn" onClick={onLogout}>Logout</button>
                    </div>
                </div>
            </header>

            <main className="forum-main-content">
                <Sidebar 
                    time={time} searchQuery={searchQuery} setSearchQuery={setSearchQuery} dateDeb={dateDeb} setDateDeb={setDateDeb} dateFin={dateFin} setDateFin={setDateFin}
                    notifications={notifications} friendInput={friendInput} setFriendInput={setFriendInput} handleAddFriend={(e) => { e.preventDefault(); if(friendInput) { setNotifications([...notifications, `${friendInput} vous a ajouté.`, `🎂 Anniversaire de @${friendInput} !`]); setFriends([...friends, friendInput]); setFriendInput(""); } }}
                    messagesPrives={messagesPrives} mpDest={mpDest} setMpDest={setMpDest} mpTxt={mpTxt} setMpTxt={setMpTxt} handleSendMP={(e) => { e.preventDefault(); setMessagesPrives([...messagesPrives, { dest: mpDest, text: mpTxt }]); setMpTxt(""); }}
                    showSearch={currentView === "forume_public" || currentView === "forume_prive" || currentView === "likes"}
                />

                <section className="forum-feed-section">
                    {(currentView === "forume_public" || currentView === "forume_prive" || currentView === "likes") && (
                        <>
                            {currentView !== "likes" && (
                                <div id="new_comment" className="forum-editor-box">
                                    <AddMsg write={handleCreateThread} forum={currentView} isReply={false} />
                                </div>
                            )}

                            <div className="forum-sort-bar">
                                <button className={sortBy === "date" ? "active" : ""} onClick={() => setSortBy("date")}>Récents</button>
                                <button className={sortBy === "popularity" ? "active" : ""} onClick={() => setSortBy("popularity")}>Popularité</button>
                            </div>

                            <article className="forum-threads-article">
                                <ul className="forum-cards-list">
                                    {filteredAndSortedThreads.map((thread) => (
                                        <li key={thread.id} className="forum-thread-card">
                                            <div className="forum-card-header">
                                                <p><span style={{ cursor: "pointer", textDecoration: "underline" }} onClick={() => { setSelectedProfile(usersList.find(u => u.username === thread.author) || { username: thread.author }); setCurrentView("profil"); }}>@{thread.author}</span></p>
                                                <div className="forum-card-actions">
                                                    <button className="forum-sort-tab" style={{ fontSize: "12px" }} onClick={() => setActiveThreadReplyId(activeThreadReplyId === thread.id ? null : thread.id)}>💬 Répondre</button>
                                                    <button className={`forum-like-trigger ${likedThreads.includes(thread.id) ? "is-liked" : ""}`} onClick={() => handleLike(thread.id)}>❤️ {thread.likes}</button>
                                                    {(user.username === thread.author || user.role === "admin") && <button className="forum-delete-trigger" onClick={() => handleDeleteThread(thread.id)}>❌</button>}
                                                </div>
                                            </div>
                                            <h2>{thread.title}</h2>
                                            <blockquote className="forum-card-blockquote">
                                                <p>{thread.text}</p>

                                                {activeThreadReplyId === thread.id && (
                                                    <div style={{ marginTop: "10px" }}>
                                                        <AddMsg write={handleCreateReply} isReply={true} threadId={thread.id} placeholder="Écrire un commentaire..." />
                                                    </div>
                                                )}

                                                {thread.replies.map((reply, index) => (
                                                    <div key={index} className="forum-nested-reply">
                                                        <div className="forum-reply-meta">
                                                            <p><b>@{reply.author}</b></p>
                                                            {(user.username === reply.author || user.role === "admin") && <button className="forum-reply-delete" onClick={() => handleDeleteReply(thread.id, index)}>Supprimer</button>}
                                                        </div>
                                                        <blockquote className="forum-reply-content-text">{reply.text}</blockquote>
                                                    </div>
                                                ))}
                                            </blockquote>
                                        </li>
                                    ))}
                                </ul>
                            </article>
                        </>
                    )}

                    {currentView === "profil" && (
                        <div className="forum-thread-card" style={{ padding: "25px" }}>
                            <h2>👤 Profil de @{selectedProfile ? selectedProfile.username : user.username}</h2>
                            <p>Rôle : {selectedProfile ? selectedProfile.role : user.role}</p>
                            <h3>📑 Messages publiés :</h3>
                            <ul>
                                {threads.filter(t => t.author === (selectedProfile ? selectedProfile.username : user.username)).map(t => (
                                    <li key={t.id}>{t.title} {(!selectedProfile || user.role === "admin") && <button onClick={() => handleDeleteThread(t.id)}>Supprimer</button>}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {currentView === "amis" && <div className="forum-thread-card" style={{ padding: "25px" }}><h2>👥 Membres suivis ({friends.length})</h2><ul>{friends.map((f, i) => <li key={i}>@{f}</li>)}</ul></div>}
                    {currentView === "faq" && <div className="forum-thread-card" style={{ padding: "25px" }}><h2>FAQ</h2><p>LISTE  DE QUESTIONS REPONSES GOOFY MDRR</p></div>}
                    {currentView === "admin_panel" && user.role === "admin" && <AdminPanel usersList={usersList} handleValidateRegistration={handleValidateRegistration} handleToggleAdminRole={handleToggleAdminRole} currentUser={user} />}
                    
                    <p className="forum-academic-footer">BABUESA BANSITA Robin - KARIHILA Nawad</p>
                </section>
            </main>
        </div>
    );
}

export default Home;