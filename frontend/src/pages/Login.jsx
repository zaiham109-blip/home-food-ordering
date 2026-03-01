import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FoodContext } from "../FoodContext";
import TopSettingsBar from "../components/TopSettingsBar";
import { useSettings } from "../SettingsContext";

function Login() {
  const navigate = useNavigate();
  const { setUser } = useContext(FoodContext) || {};
  const { t } = useSettings();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");

    try {
      const response = await fetch("http://127.0.0.1:8000/api/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: identifier.trim(),
          password,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setMessage(data.error || data.detail || "Username au password si sahihi.");
        setMessageType("error");
        return;
      }

      const token = data.token || data.key || data.access;
      if (!token) {
        setMessage("Login imekataa: token haijarudi kutoka backend.");
        setMessageType("error");
        return;
      }

      const roleValue = String(data.role || "").toLowerCase();
      const role = roleValue.includes("admin")
        ? "admin"
        : roleValue.includes("delivery")
          ? "delivery"
          : "customer";

      const userData = {
        id: Number(data.user_id || 0),
        username: data.username || identifier.trim(),
        email: data.email || "",
        role,
        phone: data.phone || "",
        is_customer: Boolean(data.is_customer),
        is_delivery_person: Boolean(data.is_delivery_person),
        delivery_request_pending: Boolean(data.delivery_request_pending),
      };

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("userId", String(userData.id || ""));
      localStorage.setItem("username", userData.username || "");
      localStorage.setItem("email", userData.email || "");
      localStorage.setItem("phone", userData.phone || "");
      localStorage.setItem("is_customer", String(userData.is_customer));
      localStorage.setItem("is_delivery_person", String(userData.is_delivery_person));
      localStorage.setItem("delivery_request_pending", String(userData.delivery_request_pending));

      if (setUser) setUser(userData);

      setMessage("Login imefanikiwa, inakupeleka...");
      setMessageType("success");

      if (role === "admin") navigate("/admin");
      else if (role === "delivery") navigate("/delivery");
      else navigate("/customer");
    } catch (error) {
      console.error(error);
      setMessage("Tatizo la kuunganisha server. Hakikisha Django inafanya kazi.");
      setMessageType("error");
    }
  };

  return (
    <div style={styles.fullScreen}>
      <div className="card shadow-lg p-4 border-0" style={styles.loginBox}>
        <div className="d-flex justify-content-end mb-2">
          <TopSettingsBar />
        </div>
        <h2 className="text-center fw-bold text-primary mb-1">Home Food System</h2>
        <p className="text-center text-muted small mb-4">{t("loginTitle")}</p>

        <form onSubmit={handleLogin}>
          <div className="mb-3 text-start">
            <label className="form-label fw-bold small">Username</label>
            <input
              type="text"
              className="form-control"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>
          <div className="mb-4 text-start">
            <label className="form-label fw-bold small">Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100 fw-bold py-2">
            {t("login").toUpperCase()}
          </button>
        </form>

        {message && (
          <div className={`mt-3 text-center small fw-bold ${messageType === "success" ? "text-success" : "text-danger"}`}>
            {message}
          </div>
        )}

        <div className="text-center mt-4">
          <small className="text-muted">
            {t("hasNoAccount")}{" "}
            <button className="btn btn-link btn-sm p-0 text-decoration-none fw-bold" onClick={() => navigate("/signup")}>
              {t("signup")}
            </button>
          </small>
        </div>
      </div>
    </div>
  );
}

const styles = {
  fullScreen: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    width: "100vw",
    backgroundColor: "var(--bg-page)",
    margin: 0,
    padding: 0,
  },
  loginBox: {
    width: "92%",
    maxWidth: "420px",
    borderRadius: "16px",
  },
};

export default Login;
