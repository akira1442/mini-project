/* eslint-disable react/prop-types */
import { useState } from "react";
import logo from "../assets/logo_noir.png";
import WelcomeView from "../components/WelcomeView";
import AuthForm from "../components/AuthForm";
import "./Auth.css";

function Auth({ onAuthSuccess, api }) {
    const [view, setView] = useState("1");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [birthdate, setBirthdate] = useState("");

    async function handleAuthSubmit(event) {
        event.preventDefault();
        setError("");

        try {
            const endpoint = view === "inscription" ? "/user" : "/user/login";
            let dataToSend = {};

            if (view === "inscription") {
                dataToSend = {
                    pseudo: username,
                    mdp: password,
                    firstname: firstName,
                    lastname: lastName,
                    birthdate: birthdate,
                    email: email
                };
            } else {
                dataToSend = {
                    pseudo: username,
                    mdp: password
                };
            }

            const response = await api.post(endpoint, dataToSend);

            if (view === "inscription") {
                alert("Inscription réussie ! En attente de validation par un administrateur...");
                setView("connexion");
            } else {
                const connectedUser = response.data.user || {
                    username: response.data.pseudo,
                    role: response.data.role
                };
                onAuthSuccess(connectedUser);
            }

        } catch (error) {
            const serverMessage = error.response?.data;
            const status = error.response?.status;
            if (status === 403 && serverMessage === "Utilisateur non validé") {
                setError("Votre inscription est en attente de validation par un administrateur...");
            } else {
                setError(typeof serverMessage === "string" ? serverMessage : "Identifiants ou données incorrectes.");
            }
        }
    }

    const renderHeader = () => (
        <>
            <img src={logo} alt="Logo" className="auth-logo" />
            <span className="auth-logo-text">NABIN</span>
        </>
    );

    if (view === "1") {
        return <WelcomeView renderHeader={renderHeader} setView={setView} />;
    }

    return (
        <AuthForm
            view={view}
            setView={setView}
            renderHeader={renderHeader}
            handleAuthSubmit={handleAuthSubmit}
            error={error}
            firstName={firstName}
            setFirstName={setFirstName}
            lastName={lastName}
            setLastName={setLastName}
            username={username}
            setUsername={setUsername}
            birthdate={birthdate}
            setBirthdate={setBirthdate}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
        />
    );
}

export default Auth;