import { Link } from "react-router-dom";

import Button from "../common/Button";

export default function Navbar() { 
  return (
    <header className="navbar">
      <div className="navbar__brand">
        <Link to="/" className="navbar__logo">
          <span className="navbar__logo-mark">S</span>
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

      <div className="navbar__actions">
        <Button to="/login" variant="ghost" size="sm">
          Sign In
        </Button>
        <Button to="/onboarding" variant="primary" size="sm">
          Get Started
        </Button>
      </div>
    </header>
  );
}
