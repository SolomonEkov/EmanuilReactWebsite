import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "../styles/AdminDashboard.css";
import { contactAPI } from "../lib/api";

function AdminDashboard() {
  const { t } = useTranslation();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState("contacts");
  const [themes, setThemes] = useState({
    winter: false,
  });
  const [themesLoading, setThemesLoading] = useState(false);

  useEffect(() => {
    // Check if user is logged in or has super admin access
    const adminLoggedIn = localStorage.getItem("adminLoggedIn") === "true";
    const superAdminAccess =
      localStorage.getItem("superAdminAccess") === "true";
    const hasAccess = adminLoggedIn || superAdminAccess;

    setIsAuthenticated(hasAccess);

    if (hasAccess) {
      loadData();
      loadThemes();
    } else {
      setLoading(false);
    }
  }, []);

  const loadThemes = async () => {
    try {
      const response = await fetch("/api/themes");
      const data = await response.json();

      if (data.success) {
        setThemes(data.themes);
      }
    } catch (error) {
      console.error("Failed to load themes:", error);
    }
  };

  const toggleTheme = async (themeName) => {
    try {
      setThemesLoading(true);
      const newState = !themes[themeName];

      const adminEmail = localStorage.getItem("adminEmail") || "admin";

      const response = await fetch("/api/themes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          theme: themeName,
          enabled: newState,
          adminEmail: adminEmail,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const updatedThemes = {
          ...themes,
          [themeName]: newState,
        };
        setThemes(updatedThemes);

        // Broadcast theme update event for immediate visibility across the site
        const event = new CustomEvent("themeUpdated", {
          detail: { themes: updatedThemes },
        });
        window.dispatchEvent(event);
      } else {
        console.error("Failed to toggle theme:", data.error);
        alert("Failed to update theme. Please try again.");
      }
    } catch (error) {
      console.error("Error toggling theme:", error);
      alert("Failed to update theme. Please try again.");
    } finally {
      setThemesLoading(false);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);

      // Fetch contact submissions
      const contactResponse = await contactAPI.getAll();
      if (contactResponse.success && contactResponse.contacts) {
        setContacts(
          Array.isArray(contactResponse.contacts)
            ? contactResponse.contacts
            : [],
        );
      } else {
        console.error("Invalid contact response:", contactResponse);
        setContacts([]);
      }
    } catch (error) {
      console.error("Failed to load admin data:", error);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Show authentication required message if not logged in
  if (!isAuthenticated) {
    return (
      <div className="admin-dashboard">
        <div className="auth-required">
          <div className="auth-message">
            <h2>🔐 {t("admin.auth.required")}</h2>
            <p>{t("admin.auth.message")}</p>
            <p>{t("admin.auth.instruction")}</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading">{t("admin.dashboard.loading")}</div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>🏛️ {t("admin.dashboard.title")}</h1>
        <p>{t("admin.dashboard.subtitle")}</p>
      </div>

      <div className="admin-tabs">
        <button
          className={`tab-button ${activeTab === "contacts" ? "active" : ""}`}
          onClick={() => setActiveTab("contacts")}
        >
          📬 {t("admin.tabs.contacts")} ({contacts.length})
        </button>
        <button
          className={`tab-button ${activeTab === "themes" ? "active" : ""}`}
          onClick={() => setActiveTab("themes")}
        >
          🎨 Themes
        </button>
      </div>

      <div className="admin-content">
        {activeTab === "themes" && (
          <div className="themes-section">
            <div className="section-header">
              <h2>🎨 Theme Management</h2>
              <p className="section-description">
                Control global themes for all website visitors
              </p>
            </div>

            <div className="themes-grid">
              {/* Winter Theme */}
              <div className="theme-card">
                <div className="theme-header">
                  <div className="theme-icon winter-icon">❄️</div>
                  <div className="theme-info">
                    <h3>Winter Theme</h3>
                    <p>Beautiful snowfall animation for winter season</p>
                  </div>
                </div>
                <div className="theme-preview winter-preview">
                  <div className="preview-content">
                    <div className="snowflake">❄</div>
                    <div className="snowflake">❄</div>
                    <div className="snowflake">❄</div>
                  </div>
                </div>
                <div className="theme-controls">
                  <div className="theme-status">
                    <span
                      className={`status-indicator ${themes.winter ? "active" : "inactive"}`}
                    ></span>
                    <span className="status-text">
                      {themes.winter ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <label className="ios-toggle">
                    <input
                      type="checkbox"
                      checked={themes.winter}
                      onChange={() => toggleTheme("winter")}
                      disabled={themesLoading}
                    />
                    <span className="ios-toggle-slider"></span>
                  </label>
                </div>
                <div className="theme-footer">
                  <small>🌍 Applied globally to all visitors</small>
                </div>
              </div>

              {/* Placeholder for future themes */}
              <div className="theme-card theme-card-coming-soon">
                <div className="coming-soon-content">
                  <div className="theme-icon">🎉</div>
                  <h3>Spring Theme</h3>
                  <p>Coming Soon</p>
                </div>
              </div>

              <div className="theme-card theme-card-coming-soon">
                <div className="coming-soon-content">
                  <div className="theme-icon">☀️</div>
                  <h3>Summer Theme</h3>
                  <p>Coming Soon</p>
                </div>
              </div>

              <div className="theme-card theme-card-coming-soon">
                <div className="coming-soon-content">
                  <div className="theme-icon">🍂</div>
                  <h3>Autumn Theme</h3>
                  <p>Coming Soon</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "contacts" && (
          <div className="submissions-section">
            <div className="section-header">
              <h2>{t("admin.contacts.title")}</h2>
              <span className="count-badge">{contacts.length} submissions</span>
            </div>

            {contacts.length === 0 ? (
              <div className="empty-state">
                <p>📭 {t("admin.contacts.noSubmissions")}</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="submissions-table">
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Subject</th>
                      <th>Message</th>
                      <th>Language</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.map((contact) => (
                      <tr key={contact.id} className={`row-${contact.status}`}>
                        <td>
                          <span className={`status-badge ${contact.status}`}>
                            {contact.status === "new" ? "🆕" : "✓"}
                          </span>
                        </td>
                        <td className="name-cell">{contact.name}</td>
                        <td className="email-cell">
                          <a href={`mailto:${contact.email}`}>
                            {contact.email}
                          </a>
                        </td>
                        <td>{contact.phone || "-"}</td>
                        <td className="subject-cell">{contact.subject}</td>
                        <td className="message-cell">
                          <div
                            className="message-preview"
                            title={contact.message}
                          >
                            {contact.message}
                          </div>
                        </td>
                        <td>
                          <span className="lang-badge">{contact.language}</span>
                        </td>
                        <td className="date-cell">
                          {formatDate(contact.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="admin-actions">
        <button onClick={loadData} className="refresh-button">
          🔄 {t("admin.dashboard.refreshData")}
        </button>
      </div>
    </div>
  );
}

export default AdminDashboard;
