import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import TopSettingsBar from "../components/TopSettingsBar";
import { useSettings } from "../SettingsContext";
import { API_URL } from "../config";

function Signup() {
  const navigate = useNavigate();
  const { t } = useSettings();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    requestDelivery: false,
  });

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setMessageType("");

    try {
      const response = await fetch(`${API_URL}/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          username: formData.username.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          password: formData.password,
          request_delivery: Boolean(formData.requestDelivery),
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setMessage(data.error || data.detail || "Imeshindikana kujisajili.");
        setMessageType("error");
        setLoading(false);
        return;
      }

      setMessage("Akaunti imetengenezwa. Ingia sasa.");
      setMessageType("success");
      setLoading(false);
      setTimeout(() => navigate("/"), 1000);
    } catch (error) {
      console.error(error);
      setMessage("Tatizo la mtandao. Hakikisha Django server iko ON.");
      setMessageType("error");
      setLoading(false);
    }
  };

  return (
    <div style={styles.fullScreen}>
      <div className="card shadow-lg p-4 border-0" style={styles.signupBox}>
        <div className="d-flex justify-content-end mb-2">
          <TopSettingsBar />
        </div>
        <h2 className="text-center fw-bold text-success mb-1">{t("signupTitle")}</h2>
        <p className="text-center text-muted small mb-4">Jisajili kama Customer</p>

        <form onSubmit={handleSignup}>
          <div className="mb-3 text-start">
            <label className="form-label fw-bold small">Username</label>
            <input
              type="text"
              className="form-control"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
          </div>
          <div className="mb-3 text-start">
            <label className="form-label fw-bold small">Email</label>
            <input
              type="email"
              className="form-control"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div className="mb-3 text-start">
            <label className="form-label fw-bold small">Phone</label>
            <input
              type="text"
              className="form-control"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>
          <div className="mb-4 text-start">
            <label className="form-label fw-bold small">Password</label>
            <input
              type="password"
              className="form-control"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>
          <div className="mb-4 text-start form-check">
            <input
              id="requestDelivery"
              type="checkbox"
              className="form-check-input"
              checked={formData.requestDelivery}
              onChange={(e) => setFormData({ ...formData, requestDelivery: e.target.checked })}
            />
            <label htmlFor="requestDelivery" className="form-check-label small fw-semibold">
              Omba kuwa Delivery Person (Admin ata-approve)
            </label>
          </div>
          <button disabled={loading} type="submit" className="btn btn-success w-100 fw-bold py-2">
            {loading ? "Inasajili..." : t("createAccount").toUpperCase()}
          </button>
        </form>

        {message && (
          <div className={`mt-3 text-center small fw-bold ${messageType === "success" ? "text-success" : "text-danger"}`}>
            {message}
          </div>
        )}

        <div className="text-center mt-4">
          <small className="text-muted">
            {t("alreadyAccount")}{" "}
            <button className="btn btn-link btn-sm p-0 text-decoration-none fw-bold" onClick={() => navigate("/")}>
              {t("login")}
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
  signupBox: {
    width: "92%",
    maxWidth: "420px",
    borderRadius: "16px",
  },
};

export default Signup;
