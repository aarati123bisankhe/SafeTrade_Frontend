import { Link } from "react-router-dom";

import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Navbar from "../../components/layout/Navbar";

const trustIndicators = [
  {
    title: "Escrow Protected",
    description: "Payments stay protected until the buyer confirms the product has been received.",
  },
  {
    title: "Secure Authentication",
    description: "SafeTrade supports strong account protection so buyers and sellers can trade safely.",
  },
  {
    title: "Verified Transaction Flow",
    description: "Every purchase follows a clear path from payment hold to release and dispute handling.",
  },
];

const categories = ["Books", "Electronics", "Clothes", "Furniture", "Handmade"];

const whySafetrade = [
  "Fraud reduction through escrow-protected payments",
  "Protected local transactions for buyers and sellers",
  "Dispute support when something goes wrong",
  "Secure account protection and transaction visibility",
];

export default function LandingPage() {
  return (
    <div className="landing-shell">
      <Navbar />

      <main className="landing-page">
        <section className="hero">
          <div className="hero__content">
            <span className="section-tag">Trusted local marketplace</span>
            <h1>Buy and Sell Locally. Trade with Confidence.</h1>
            <p className="hero__copy">
              SafeTrade protects local buyers and sellers with secure accounts,
              escrow-protected payments, and fair dispute resolution.
            </p>
            <div className="hero__actions">
              <Button to="/onboarding" size="lg">
                Get Started
              </Button>
              <Button to="/products" variant="secondary" size="lg">
                Browse Products
              </Button>
            </div>
            <p className="hero__subcopy">
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </div>

          <Card className="hero-visual">
            <div className="hero-visual__badge">Escrow active</div>
            <div className="hero-visual__grid">
              <div>
                <span>Buyer payment</span>
                <strong>Held securely</strong>
              </div>
              <div>
                <span>Seller status</span>
                <strong>Awaiting confirmation</strong>
              </div>
              <div>
                <span>Dispute support</span>
                <strong>Available when needed</strong>
              </div>
              <div>
                <span>Account protection</span>
                <strong>Security-first access</strong>
              </div>
            </div>
            <div className="hero-visual__timeline">
              <span>Payment Held</span>
              <span>Seller Accepted</span>
              <span>Shipped</span>
              <span>Funds Released</span>
            </div>
          </Card>
        </section>

        <section className="trust-strip">
          {trustIndicators.map((indicator) => (
            <Card key={indicator.title} className="trust-card">
              <span className="trust-card__icon" aria-hidden="true">
                ●
              </span>
              <h2>{indicator.title}</h2>
              <p>{indicator.description}</p>
            </Card>
          ))}
        </section>

        <section id="how-it-works" className="content-section">
          <div className="section-heading">
            <span className="section-tag">How SafeTrade Works</span>
            <h2>Protection built into every local transaction</h2>
          </div>
          <div className="steps-grid">
            {[
              "Find a product",
              "Pay through protected escrow",
              "Receive and confirm",
              "Seller receives payment",
            ].map((step, index) => (
              <Card key={step} className="step-card">
                <span className="step-card__number">0{index + 1}</span>
                <h3>{step}</h3>
              </Card>
            ))}
          </div>
        </section>

        <section className="content-section">
          <div className="section-heading">
            <span className="section-tag">Popular categories</span>
            <h2>Browse the kinds of products people actually trade locally</h2>
          </div>
          <div className="category-grid">
            {categories.map((category) => (
              <Card key={category} className="category-card">
                <h3>{category}</h3>
              </Card>
            ))}
          </div>
        </section>

        <section id="why-safetrade" className="content-section content-section--split">
          <Card className="why-card">
            <span className="section-tag">Why SafeTrade</span>
            <h2>Designed to reduce friction without reducing safety</h2>
            <ul className="feature-list">
              {whySafetrade.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Card>

          <Card className="cta-card">
            <span className="section-tag">Start securely</span>
            <h2>Join buyers and sellers using protected local trading</h2>
            <p>
              Create an account, complete onboarding, and start trading with
              escrow-backed confidence.
            </p>
            <div className="cta-card__actions">
              <Button to="/onboarding">Get Started</Button>
              <Button to="/register" variant="ghost">
                Create Account
              </Button>
            </div>
          </Card>
        </section>
      </main>

      <footer className="site-footer">
        <div>
          <strong>SafeTrade</strong>
          <p>Secure local marketplace with escrow protection and dispute support.</p>
        </div>
        <div className="site-footer__links">
          <Link to="/products">Browse Products</Link>
          <Link to="/register">Create Account</Link>
          <Link to="/login">Sign In</Link>
        </div>
      </footer>
    </div>
  );
}
