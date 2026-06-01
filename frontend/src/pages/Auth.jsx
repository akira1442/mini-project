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
            const endpoint = view === "inscription" ? "/auth/signup" : "/auth/connexion";
            const response = await api.post(endpoint, {
                email,
                password,
                firstName,
                lastName,
                username,
                birthdate
            });

            onAuthSuccess(response.data.user);
        } catch (error) {
            setError(error.response?.data?.error || "Une erreur s'est produite. Veuillez réessayer.");
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