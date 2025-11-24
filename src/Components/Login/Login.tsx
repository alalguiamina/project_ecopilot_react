import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthToken } from "../../hooks/useAuthToken";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../../constants";
import logo from "../../Assets/logo.png";
import emailIcon from "../../Assets/email.png";
import passwordIcon from "../../Assets/password.png";
import backgroundLogin from "../../Assets/backgroundlogin.jpg";
import "./Login.css";

type LoginProps = {
  onLogin?: (username: string, password: string) => Promise<void>;
};

export default function Login({ onLogin }: LoginProps) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const auth = useAuthToken();

  const handleSuccessNavigation = () => {
    navigate("/dashboard", { replace: true });
  };

  const handleLocalLogin = async (id: string, pwd: string) => {
    const data = await auth.mutateAsync({ user: id, password: pwd });
    const access = data.access ?? data.token ?? data.access_token;
    const refresh = data.refresh ?? data.refresh_token;

    if (access) localStorage.setItem(ACCESS_TOKEN ?? "authToken", access);
    if (refresh) localStorage.setItem(REFRESH_TOKEN ?? "refreshToken", refresh);

    await qc.invalidateQueries({ queryKey: ["current-user"] });
    await qc.refetchQueries({ queryKey: ["current-user"] });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (onLogin) {
        await onLogin(identifier, password);
      } else {
        await handleLocalLogin(identifier, password);
      }
      handleSuccessNavigation();
    } catch (err: any) {
      console.error("Login failed:", err);
      setError(err?.message ?? "Échec de la connexion");
    }
  };

  const handleLogin = () => {
    const form = document.createElement("form");
    const event = new Event("submit", { bubbles: true, cancelable: true });
    form.addEventListener("submit", onSubmit as unknown as EventListener);
    form.dispatchEvent(event);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div
      className="login-wrapper"
      style={{
        backgroundImage: `url(${backgroundLogin})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="container">
        <img src={logo} alt="App Logo" className="logo" />
        <div className="underline"></div>

        {error && (
          <div
            className="error"
            style={{ color: "#b91c1c", fontSize: 13, marginBottom: 10 }}
          >
            {error}
          </div>
        )}

        <div className="inputs">
          <div className="input">
            <img src={emailIcon} alt="email icon" />
            <input
              type="email"
              placeholder="Email"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>

          <div className="input">
            <img src={passwordIcon} alt="password icon" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>
        </div>

        <div className="forgot-password">
          Mot de passe oublié? <span>Cliquez ici</span>
        </div>

        <div className="submit-container">
          <div className="submit" onClick={handleLogin}>
            Se connecter
          </div>
        </div>
      </div>
    </div>
  );
}
