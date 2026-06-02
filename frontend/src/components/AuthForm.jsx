/* eslint-disable react/prop-types */
function AuthForm({
    view, setView, renderHeader, handleAuthSubmit, error,
    firstName, setFirstName, lastName, setLastName, username, setUsername,
    birthdate, setBirthdate, email, setEmail, password, setPassword
}) {
    return (
        <div className="auth-page">
            <div>
                {renderHeader()}
                <button className="auth-back-btn" onClick={() => setView("1")}>
                    ← Retour à l'accueil
                </button>

                <h2 className="auth-form-title">
                    {view === "inscription" ? "Créer son profil" : "Bon retour parmi nous!"}
                </h2>
                <p className="auth-form-subtitle">
                    {view === "inscription" ? "" : "Entrez vos informations de connexion ci-dessous"}
                </p>

                <form onSubmit={handleAuthSubmit} className="auth-form">
                    {view === "inscription" && (
                        <>
                            {/*1ere ligne prenom+nom*/}
                            <div className="auth-row">
                                <div className="auth-input-group">
                                    <label className="auth-label">Prénom</label>
                                    <input
                                        type="text"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        placeholder="Prénom"
                                        className="auth-input"
                                        required
                                    />
                                </div>
                                <div className="auth-input-group">
                                    <label className="auth-label">Nom de famille</label>
                                    <input
                                        type="text"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        placeholder="Nom de famille"
                                        className="auth-input"
                                        required
                                    />
                                </div>
                            </div>

                            {/*2eme ligne id+date de naissance*/}
                            <div className="auth-row">
                                <div className="auth-input-group">
                                    <label className="auth-label">Identifiant</label>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="Identifiant"
                                        className="auth-input"
                                        required
                                    />
                                </div>
                                <div className="auth-input-group">
                                    <label className="auth-label" htmlFor="auth_birthdate">Date de naissance</label>
                                    <input
                                        type="date"
                                        id="auth_birthdate"
                                        value={birthdate}
                                        onChange={(e) => setBirthdate(e.target.value)}
                                        className="auth-input"
                                        required
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    <div className="auth-input-group">
                        <label className="auth-label">Pseudo</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Choisis ton pseudo"
                            className="auth-input"
                            required
                        />
                    </div>

                    <div className="auth-input-group">
                        <label className="auth-label">Mot de passe</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••••••"
                            className="auth-input"
                            required
                        />
                    </div>

                    {error && <p className="auth-error">{error}</p>}

                    <button type="submit" className="auth-submit-btn">
                        {view === "inscription" ? "Confirmer l'inscription" : "Se connecter au forum"}
                    </button>
                </form>

                <div className="auth-switch-mode-zone">
                    {view === "inscription" ? (
                        <p className="auth-switch-text">
                            Déjà membre? <span className="auth-link" onClick={() => setView("connexion")}>Se connecter</span>
                        </p>
                    ) : (
                        <p className="auth-switch-text">
                            Nouveau sur le forum? <span className="auth-link" onClick={() => setView("inscription")}>Créer un compte</span>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AuthForm;