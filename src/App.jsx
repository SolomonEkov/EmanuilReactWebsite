import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import "./App.css";
import "./styles/shared.css";
import "./styles/FooterModern.css";
import "./styles/LegalPagesModern.css";
import "./styles/WinterTheme.css"; // Winter theme decorations
import "./i18n/i18n"; // Import i18n configuration
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Welcome from "./components/Welcome";
import AboutUs from "./components/AboutUs";
import Contact from "./components/Contact";
import KidsPage from "./components/KidsPage";
import ServicesPage from "./components/ServicesPage";
import EventsPage from "./components/EventsPage";
import GalleryPage from "./components/GalleryPage";
import LanguagePopup from "./components/LanguagePopup"; // Import the new component
import CookieConsent from "./components/CookieConsent"; // Import cookie consent component
import ScrollToTop from "./components/ScrollToTop";
import FloatingDonateButton from "./components/FloatingDonateButton";
import AdminDashboard from "./components/AdminDashboard";
import Toast from "./components/Toast";
import Payment from "./components/Payment";
import PaymentSuccess from "./components/PaymentSuccess";
import Snowfall from "./components/Snowfall"; // Winter snowfall effect

function App() {
  const { t, i18n } = useTranslation();
  const [currentPage, setCurrentPage] = useState(() => {
    // Ensure we always have a valid string path
    const path = window.location?.pathname;
    return typeof path === "string" ? path : "/";
  });
  const cookieConsentRef = useRef(); // Add ref for CookieConsent
  const [toast, setToast] = useState({
    isVisible: false,
    message: "",
    type: "info",
  });

  // Show the popup only if the user hasn't selected a language
  const [showLanguagePopup, setShowLanguagePopup] = useState(() => {
    return !localStorage.getItem("hasSelectedLanguage");
  });

  // No need for language popup logic here, handled in useState and handleLanguageSelect

  // Simplify your useEffect hooks to avoid duplication

  // Keep only one useEffect for handling navigation and scroll behavior
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location?.pathname;
      const validPath = typeof path === "string" ? path : "/";
      setCurrentPage(validPath);
      // Scroll to top on navigation change
      window.scrollTo(0, 0);
    };

    // Listen for navigation events
    window.addEventListener("popstate", handleLocationChange);
    window.addEventListener("pushstate", handleLocationChange);

    return () => {
      window.removeEventListener("popstate", handleLocationChange);
      window.removeEventListener("pushstate", handleLocationChange);
    };
  }, []);

  const navigate = (path) => {
    // Scroll to top when navigating
    window.scrollTo(0, 0);

    // Update the current page
    setCurrentPage(path);

    // Update browser history
    window.history.pushState({}, "", path);
  };

  const handleLanguageSelect = (language) => {
    i18n.changeLanguage(language);

    // Still save the preference, but don't check it on load
    localStorage.setItem("hasSelectedLanguage", "true");
    localStorage.setItem("preferredLanguage", language);

    setShowLanguagePopup(false);
  };

  const renderPage = () => {
    switch (currentPage) {
      case "/about":
        return <AboutUs />;
      case "/contact":
        return <Contact />;
      case "/kids":
        return <KidsPage />;
      case "/gallery":
        return <GalleryPage />;
      case "/services":
        return <ServicesPage onNavigate={navigate} />;
      case "/events":
        return <EventsPage />;
      case "/admin":
        // Check if user is authenticated before allowing access to admin
        const isAdminLoggedIn =
          localStorage.getItem("adminLoggedIn") === "true";
        const isSuperAdminAccess =
          localStorage.getItem("superAdminAccess") === "true";

        if (isAdminLoggedIn || isSuperAdminAccess) {
          return <AdminDashboard />;
        } else {
          // Just redirect without state updates during render
          window.history.replaceState(null, null, "/");
          return (
            <>
              <Hero />
              <Welcome />
            </>
          );
        }
      case "/terms":
        return (
          <div className="legal-page-modern">
            <div className="legal-container">
              <div className="legal-header">
                <h1>{t("legal.terms.title")}</h1>
                <div className="legal-subtitle">
                  {t(
                    "legal.terms.subtitle",
                    "Legal Terms and Conditions for Website Usage"
                  )}
                </div>
                <div className="last-updated-modern">
                  {t("legal.lastUpdated", "Last updated: September 2025")}
                </div>
              </div>
              <div className="legal-content">
                <div
                  dangerouslySetInnerHTML={{
                    __html: t("legal.terms.content"),
                  }}
                />
                <div className="contact-info">
                  <h4>{t("legal.contactTitle", "Need Help?")}</h4>
                  <p>
                    {t(
                      "legal.contactText",
                      "If you have any questions about these terms, please contact us at info@emanuil.be"
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      case "/privacy":
        return (
          <div className="legal-page-modern">
            <div className="legal-container">
              <div className="legal-header">
                <h1>{t("legal.privacy.title")}</h1>
                <div className="legal-subtitle">
                  {t(
                    "legal.privacy.subtitle",
                    "How We Protect and Use Your Information"
                  )}
                </div>
                <div className="last-updated-modern">
                  {t("legal.lastUpdated", "Last updated: September 2025")}
                </div>
              </div>
              <div className="legal-content">
                <div className="important-notice">
                  <h4>{t("legal.importantTitle", "Important Notice")}</h4>
                  <p>
                    {t(
                      "legal.importantText",
                      "Your privacy is important to us. This policy explains how we handle your information."
                    )}
                  </p>
                </div>
                <div
                  dangerouslySetInnerHTML={{
                    __html: t("legal.privacy.content"),
                  }}
                />
                <div className="contact-info">
                  <h4>{t("legal.contactTitle", "Questions About Privacy?")}</h4>
                  <p>
                    {t(
                      "legal.contactText",
                      "If you have any questions about this privacy policy, please contact us at info@emanuil.be"
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      case "/donate":
        return <Payment />;
      case "/payment/success":
        return <PaymentSuccess />;
      case "/payment/cancel":
        return (
          <div className="payment-cancel">
            <h2>{t("payment.cancelled.title", "Payment Cancelled")}</h2>
            <p>
              {t(
                "payment.cancelled.message",
                "Your payment was cancelled. You can try again anytime."
              )}
            </p>
            <button onClick={() => navigate("/")} className="btn-primary">
              {t("payment.success.back_home", "Back to Home")}
            </button>
          </div>
        );
      default:
        return (
          <>
            <Hero />
            <Welcome onNavigate={navigate} />
          </>
        );
    }
  };

  return (
    <div className="app">
      <header>
        <Navbar onNavigate={navigate} currentPage={currentPage} />
      </header>

      <main>{renderPage()}</main>

      <footer className="footer-modern">
        <div className="footer-container">
          <div className="footer-main">
            <div className="footer-brand">
              <img
                src="/church-logo.png"
                alt={t("footer.church") + " logo"}
                className="footer-logo"
              />
              <h3>{t("footer.church")}</h3>
              <p className="footer-tagline">
                {t("footer.tagline") || "A community of faith, hope, and love"}
              </p>
            </div>

            <div className="footer-grid">
              <div className="footer-column">
                <h4>Contact</h4>
                <div className="footer-info">
                  <div className="info-item">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                        fill="currentColor"
                      />
                    </svg>
                    <div>
                      <p>{t("footer.address")}</p>
                      <p>{t("footer.city")}</p>
                    </div>
                  </div>
                  <div className="info-item">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
                        fill="currentColor"
                      />
                    </svg>
                    <a href="tel:+32485089966" className="phone-link">
                      <p>{t("footer.phone")}</p>
                    </a>
                  </div>
                </div>
              </div>

              <div className="footer-column">
                <h4>Services</h4>
                <div className="service-item">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                      fill="currentColor"
                    />
                  </svg>
                  <div>
                    <p className="service-time">{t("footer.sunday")}</p>
                    <p className="service-time">{t("footer.wednesday")}</p>
                  </div>
                </div>
              </div>

              <div className="footer-column">
                <h4>Connect</h4>
                <div className="social-modern">
                  <a
                    href="https://www.facebook.com/Emanuil.Gent"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="social-link"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                        fill="currentColor"
                      />
                    </svg>
                  </a>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="social-link"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
                        fill="currentColor"
                      />
                    </svg>
                  </a>
                  <a
                    href="https://www.youtube.com/@EmanuilGent"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="YouTube"
                    className="social-link"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
                        fill="currentColor"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <div className="footer-legal">
              <p>
                &copy; {new Date().getFullYear()} {t("footer.church")}.{" "}
                {t("footer.rights")}
              </p>
              <div className="legal-links">
                <a
                  href="/terms"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/terms");
                  }}
                >
                  {t("footer.terms")}
                </a>
                <span>•</span>
                <a
                  href="/privacy"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/privacy");
                  }}
                >
                  {t("footer.privacy")}
                </a>
                <span>•</span>
                <button
                  className="cookie-settings-footer-btn"
                  onClick={() => cookieConsentRef.current?.openSettings()}
                >
                  Cookie Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {showLanguagePopup && (
        <LanguagePopup
          isOpen={showLanguagePopup}
          onClose={() => setShowLanguagePopup(false)}
          onSelectLanguage={handleLanguageSelect}
        />
      )}
      <CookieConsent ref={cookieConsentRef} />
      <ScrollToTop />
      <FloatingDonateButton onNavigate={navigate} />

      {/* Toast Notifications */}
      <Toast
        message={toast.message}
        isVisible={toast.isVisible}
        type={toast.type}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
      
      {/* Winter Theme Snowfall Effect */}
      <Snowfall snowflakeCount={50} />
    </div>
  );
}

export default App;
