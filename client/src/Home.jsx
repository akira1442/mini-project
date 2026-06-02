/* eslint-disable react/prop-types */
import ThreadFeed from "./components/ThreadFeed";
import { useState, useEffect } from "react";
import logo from "./assets/logo_noir.png";
import AddMsg from "./components/AddMsg";
import Sidebar from "./components/Sidebar";
import AdminPanel from "./components/AdminPanel";
import UserProfile from "./components/UserProfile";
import UserFriends from "./components/UserFriends"; 
import "./Home.css";

function Home({ user, onLogout, api }) {
    const [time, setTime] = useState(new Date().toLocaleTimeString("fr-FR"));
    const [isBirthdayToday, setIsBirthdayToday] = useState(false);
    const [currentView, setCurrentView] = useState("forum_public");
    const [selectedProfile, setSelectedProfile] = useState(null);

    const [threads, setThreads] = useState([]);

    const [usersList, setUsersList] = useState([]);
    const [pendingUsers, setPendingUsers] = useState([]);

    const [likedThreads, setLikedThreads] = useState([]);
    const [activeThreadReplyId, setActiveThreadReplyId] = useState(null);
    const [aMenti, setAMenti] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [dateDeb, setDateDeb] = useState("");
    const [dateFin, setDateFin] = useState("");
    const [sortBy, setSortBy] = useState("date");
    const [friends, setFriends] = useState([]);
    const [friendInput, setFriendInput] = useState("");
    const [pendingFriendRequests, setPendingFriendRequests] = useState([]);
    const [notifications, setNotifications] = useState(["Bienvenue sur l'application !"]);
    const [messagesPrives, setMessagesPrives] = useState([]);
    const [mpDest, setMpDest] = useState("");
    const [mpTxt, setMpTxt] = useState("");

    const fetchMessages = async () => {
        try {
            const response = await api.get("/message/list");
            if (response.data && response.data.body) {
                setThreads(response.data.body);
            }
        } catch (err) {
            console.error("Erreur récupération messages:", err);
        }
    };

    const fetchUsersList = async () => {
        try {
            const response = await api.get("/admin/users");
            setUsersList(response.data || []);
        } catch (err) {
            console.error("Impossible de charger la liste des utilisateurs", err);
        }
    };

    const fetchPendingUsers = async () => {
        try {
            const response = await api.get("/admin/users/pending");
            setPendingUsers(response.data || []);
        } catch (err) {
            console.error("Impossible de charger les inscriptions en attente", err);
        }
    };

    const fetchFriendRequests = async () => {
        try {
            const response = await api.get("/friends/pending");
            setPendingFriendRequests(response.data?.pending || []);
        } catch (err) {
            console.error("Erreur lors du chargement des demandes d'amis:", err);
        }
    };

    const fetchFriends = async () => {
        try {
            const response = await api.get("/friends/list");
            setFriends(response.data?.friends || []);
        } catch (err) {
            console.error("Erreur lors du chargement des amis:", err);
        }
    };

    const fetchMPs = async () => {
        try {
            const response = await api.get("/mp");
            setMessagesPrives(response.data || []);
        } catch (err) {
            console.error("Erreur lors du chargement des MP:", err);
        }
    };

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date().toLocaleTimeString("fr-FR")), 1000);
        return () => clearInterval(timer);
    }, [user]);

    useEffect(() => {
        if (user && user.birthdate) {
            const today = new Date();
            const birthday = new Date(user.birthdate);
            if (today.getDate() === birthday.getDate() && today.getMonth() === birthday.getMonth()) {
                setIsBirthdayToday(true);
            }
        }
    }, [user]);

    useEffect(() => {
        if (user?.role === "admin") {
            fetchUsersList();
            fetchPendingUsers();
        }
    }, [user]);

    useEffect(() => {
        fetchMessages();
        fetchFriendRequests();
        fetchFriends();
        fetchMPs();
        if (user?.role === "admin") {
            fetchUsersList();
        }
    }, []);

    const handleCreateThread = async (title, text) => {
        try {
            const forum = currentView === "forum_prive" ? "ferme" : "public";
            await api.post("/message", { title, text, forum });
            await fetchMessages();
        } catch (err) {
            console.error("Erreur création message:", err);
            alert("Erreur: Impossible de publier le message");
        }
    };

    const handleSendMP = async (e) => {
        e.preventDefault();
        if (!mpDest.trim() || !mpTxt.trim()) return;
        try {
            await api.post("/mp", { dest: mpDest.trim(), text: mpTxt });
            setMpTxt("");
            await fetchMPs();
        } catch (err) {
            alert(err.response?.data || "Erreur lors de l'envoi du message privé");
        }
    };

    const handleCreateReply = async (e, threadId, text) => {
        e.preventDefault();
        try {
            await api.post(`/message/${threadId}/reply`, { text });
            await fetchMessages();
            setActiveThreadReplyId(null);
        } catch (err) {
            console.error("Erreur lors de l'envoi du commentaire:", err);
            alert("Erreur: Impossible de publier le commentaire");
        }
    };

    const handleDeleteThread = async (threadId) => {
        try {
            await api.delete(`/messages/${threadId}`);
            setThreads(threads.filter(t => t._id !== threadId));
        } catch (err) {
            console.error("Erreur suppression message:", err);
            alert("Erreur: Impossible de supprimer le message");
        }
    };

    const handleDeleteReply = (threadId, replyIndex) => {
        setThreads(threads.map(t => t._id === threadId ? { ...t, replies: t.replies.filter((_, idx) => idx !== replyIndex) } : t));
    };

    const handleLike = async (threadId) => {
        try {
            const response = await api.post(`/message/${threadId}/like`);
            const newLikes = response.data.likes;
            setThreads(threads.map(t => t._id === threadId ? { ...t, likes: newLikes } : t));
            if (likedThreads.includes(threadId)) {
                setLikedThreads(likedThreads.filter(id => id !== threadId));
            } else {
                setLikedThreads([...likedThreads, threadId]);
            }
        } catch (err) {
            console.error("Erreur lors du like:", err);
        }
    };

    const handleValidateRegistration = async (username) => {
        try {
            const pseudo = username;
            await api.post("/admin/users/validate", { pseudo });
            setPendingUsers(pendingUsers.map(u => (u.pseudo || u.username) === pseudo ? { ...u, valide: true } : u));
            setUsersList(usersList.map(u => (u.pseudo || u.username) === pseudo ? { ...u, valide: true } : u));
        } catch (err) {
            console.error("Erreur lors de la validation de l'utilisateur", err);
        }
    };

    const handleToggleAdminRole = async (targetUser) => {
        const targetPseudo = targetUser.pseudo || targetUser.username;
        if (targetPseudo === user.username) return;
        try {
            await api.post("/user/promote", { user_id: targetPseudo });
            await fetchUsersList();
        } catch (err) {
            console.error("Erreur", err);
            alert("Impossible de modifier le rôle de cet utilisateur.");
        }
    };

    const handleAddFriend = async (e) => {
        e.preventDefault();
        if (!friendInput.trim()) return;
        try {
            await api.post("/friends/demandes", { pseudoCible: friendInput.trim() });
            setNotifications([...notifications, `Demande d'ami envoyée à @${friendInput}`]);
            setFriendInput("");
        } catch (err) {
            const message = err.response?.data || "Erreur lors de l'envoi de la demande";
            setNotifications([...notifications, `Erreur: ${message}`]);
        }
    };

    const handleAcceptFriendRequest = async (requestId) => {
        try {
            await api.post("/friends/accept", { friendRequestId: requestId });
            setPendingFriendRequests(pendingFriendRequests.filter(r => r._id !== requestId));
            setNotifications([...notifications, "Demande d'ami acceptée"]);
            await fetchFriends();
        } catch (err) {
            console.error("Erreur lors de l'acceptation:", err);
        }
    };

    const handleRejectFriendRequest = async (requestId) => {
        try {
            await api.post("/friends/reject", { friendRequestId: requestId });
            setPendingFriendRequests(pendingFriendRequests.filter(r => r._id !== requestId));
            setNotifications([...notifications, "Demande d'ami refusée"]);
        } catch (err) {
            console.error("Erreur lors du refus:", err);
        }
    };

    const filteredAndSortedThreads = threads.filter(t => {
        if (currentView === "forum_public") return t.forum === "public";
        if (currentView === "forum_prive") return t.forum === "ferme";
        if (currentView === "likes") return likedThreads.includes(t._id);
        return true;
    })
        .filter(t => {
            const matchesKeyword = (t.text || "").toLowerCase().includes(searchQuery.toLowerCase()) || (t.auteur || "").toLowerCase().includes(searchQuery.toLowerCase()) || (t.title || "").toLowerCase().includes(searchQuery.toLowerCase());
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
                                    <button className="birthday-ack-btn" onClick={() => setIsBirthdayToday(false)}>Merci !</button>
                                    <button className="birthday-ack-btn" style={{ backgroundColor: "#c0392b" }} onClick={() => setAMenti(true)}>Ce n'est pas mon anniversaire</button>
                                </div>
                            </>
                        ) : (
                            <>
                                <h2 style={{ textAlign: "center", color: "#c0392b", fontSize: "28px" }}>COMPTE SUSPENDU</h2>
                                <p style={{ textAlign: "center", fontWeight: "bold", fontSize: "18px", margin: "20px 0", color: "#08060d" }}>
                                    TU NOUS AS MENTI SUR TA DATE DE NAISSANCE !<br /><br />
                                    <span style={{ color: "#c0392b" }}>TON COMPTE VA ÊTRE SUPPRIMÉ D'ICI 10 SECONDES.</span>
                                </p>
                                <button className="birthday-ack-btn" style={{ backgroundColor: "#08060d" }} onClick={() => { setAMenti(false); setIsBirthdayToday(false); }}>(je n'ai rien vu)</button>
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
                            <button className={currentView === "forum_public" ? "active" : ""} onClick={() => { setCurrentView("forum_public"); setSelectedProfile(null); }}>Forum public</button>
                            {user.role === "admin" && <button className={currentView === "forum_prive" ? "active" : ""} onClick={() => { setCurrentView("forum_prive"); setSelectedProfile(null); }}>Forum privé (ADMIN)</button>}
                            <button className={currentView === "likes" ? "active" : ""} onClick={() => { setCurrentView("likes"); setSelectedProfile(null); }}>Likes</button>
                            <button className={currentView === "profil" && !selectedProfile ? "active" : ""} onClick={() => { setSelectedProfile(null); setCurrentView("profil"); }}>Profil</button>
                            <button className={currentView === "amis" ? "active" : ""} onClick={() => { setCurrentView("amis"); setSelectedProfile(null); }}>Amis</button>
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
                    notifications={notifications} friendInput={friendInput} setFriendInput={setFriendInput} handleAddFriend={handleAddFriend}
                    pendingFriendRequests={pendingFriendRequests} handleAcceptFriendRequest={handleAcceptFriendRequest} handleRejectFriendRequest={handleRejectFriendRequest}
                    messagesPrives={messagesPrives} mpDest={mpDest} setMpDest={setMpDest} mpTxt={mpTxt} setMpTxt={setMpTxt} handleSendMP={handleSendMP}
                    showSearch={currentView === "forum_public" || currentView === "forum_prive" || currentView === "likes"}
                />

                <section className="forum-feed-section">
                    {(currentView === "forum_public" || currentView === "forum_prive" || currentView === "likes") && (
                        <ThreadFeed
                            currentView={currentView}
                            handleCreateThread={handleCreateThread}
                            sortBy={sortBy}
                            setSortBy={setSortBy}
                            filteredAndSortedThreads={filteredAndSortedThreads}
                            user={user}
                            usersList={usersList}
                            setSelectedProfile={setSelectedProfile}
                            setCurrentView={setCurrentView}
                            activeThreadReplyId={activeThreadReplyId}
                            setActiveThreadReplyId={setActiveThreadReplyId}
                            likedThreads={likedThreads}
                            handleLike={handleLike}
                            handleDeleteThread={handleDeleteThread}
                            handleCreateReply={handleCreateReply}
                            handleDeleteReply={handleDeleteReply}
                        />
                    )}

                    {/*Profil*/}
                    {currentView === "profil" && (
                        <UserProfile user={user} selectedProfile={selectedProfile} threads={threads} handleDeleteThread={handleDeleteThread} />
                    )}

                    {/*Amis*/}
                    {currentView === "amis" && (
                        <UserFriends friends={friends} />
                    )}

                    {/*Page Admin*/}
                    {currentView === "admin_panel" && user.role === "admin" && (
                        <AdminPanel
                            usersList={usersList}
                            pendingUsers={pendingUsers}
                            handleValidateRegistration={handleValidateRegistration}
                            handleToggleAdminRole={handleToggleAdminRole}
                            currentUser={user}
                        />
                    )}

                    <p className="forum-academic-footer">BABUESA BANSITA Robin - KARIHILA Nawad</p>
                </section>
            </main>
        </div>
    );
}

export default Home;