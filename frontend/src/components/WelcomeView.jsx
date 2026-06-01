/* eslint-disable react/prop-types */
function WelcomeView({ renderHeader, setView }) {
    return (
        <div className="auth-page">
            {renderHeader()}
            <div>
                <span className="auth-badge">WEB - LU3IN017</span>
                <h1 className="auth-main-title">Forum</h1>
                <div className="auth-welcome-buttons">
                    <button className="auth-primary-btn" onClick={() => setView("inscription")}>
                        S'inscrire
                    </button>
                    <button className="auth-secondary-btn" onClick={() => setView("connexion")}>
                        Se Connecter
                    </button>
                </div>
                <p className="auth-footer-note">BABUESA BANSITA Robin - KARIHILA Nawad</p>
            </div>
        </div>
    );
}

export default WelcomeView;