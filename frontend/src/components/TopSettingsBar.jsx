import React from "react";
import { useSettings } from "../SettingsContext";

function TopSettingsBar() {
  const { language, setLanguage, theme, setTheme, t } = useSettings();

  return (
    <div className="d-flex gap-2 align-items-center">
      <label className="small m-0 text-secondary">{t("language")}</label>
      <select
        className="form-select form-select-sm"
        style={{ width: "130px" }}
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
      >
        <option value="sw">{t("swahili")}</option>
        <option value="en">{t("english")}</option>
      </select>

      <label className="small m-0 text-secondary">{t("theme")}</label>
      <select
        className="form-select form-select-sm"
        style={{ width: "110px" }}
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
      >
        <option value="light">{t("light")}</option>
        <option value="dark">{t("dark")}</option>
      </select>
    </div>
  );
}

export default TopSettingsBar;

