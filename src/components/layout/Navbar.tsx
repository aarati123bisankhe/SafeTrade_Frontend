import { Link } from "react-router-dom";

import Button from "../common/Button";
import useAuth from "../../hooks/useAuth";

export default function Navbar() { 
  const { isAuthenticated } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar__brand">
        <Link to="/" className="navbar__logo">
          <img
            src="/safetrade-logo.png"
            alt="SafeTrade logo"
            className="navbar__logo-mark"
          />
          <div>
            <strong>SafeTrade</strong>
            <span>Secure local marketplace</span>
          </div>
        </Link>
      </div>

      <nav className="navbar__links" aria-label="Primary">
        <Link to="/products">Browse Products</Link>
        <a href="#how-it-works">How It Works</a>
        <a href="#why-safetrade">Why SafeTrade</a>
      </nav>

      {!isAuthenticated ? (
        <div className="navbar__actions">
          <Button to="/login" variant="ghost" size="sm">
            Sign In
          </Button>
          <Button to="/onboarding" variant="primary" size="sm">
            Get Started
          </Button>
        </div>
      ) : null}
    </header>
  );
}
