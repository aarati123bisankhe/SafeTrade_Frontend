import { Link } from "react-router-dom";

const footerColumns = [
  {
    title: "Marketplace",
    links: [
      { label: "Browse Products", to: "/products" },
      { label: "Books", to: "/products#books" },
      { label: "Electronics", to: "/products#electronics" },
      { label: "Clothing", to: "/products#clothing" },
      { label: "Furniture", to: "/products#furniture" },
      { label: "Handmade", to: "/products#handmade" },
    ],
  },
  {
    title: "Buying",
    links: [
      { label: "How Escrow Works", to: "/onboarding#escrow" },
      { label: "My Purchases", to: "/my-purchases" },
      { label: "Transaction Protection", to: "/buyer/dashboard#protection" },
      { label: "Raise a Dispute", to: "/disputes/new" },
      { label: "Buyer Safety", to: "/onboarding#buyer-safety" },
    ],
  },
  {
    title: "Selling",
    links: [
      { label: "Become a Seller", to: "/register" },
      { label: "Create Listing", to: "/seller/dashboard#add-product" },
      { label: "My Products", to: "/seller/dashboard#products" },
      { label: "My Sales", to: "/seller/dashboard#sales" },
      { label: "Seller Protection", to: "/seller/dashboard#protection" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", to: "/onboarding#support" },
      { label: "Contact Support", to: "/onboarding#contact" },
      { label: "Dispute Resolution", to: "/disputes" },
      { label: "Report a User", to: "/admin/dashboard#users" },
      { label: "Safety Guidelines", to: "/onboarding#safety" },
    ],
  },
  {
    title: "Security",
    links: [
      { label: "Secure Login", to: "/login" },
      { label: "Two-Factor Authentication", to: "/profile" },
      { label: "OAuth Login", to: "/login" },
      { label: "Privacy", to: "/onboarding#privacy" },
      { label: "Terms & Conditions", to: "/onboarding#terms" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About SafeTrade", to: "/" },
      { label: "How It Works", to: "/onboarding" },
      { label: "Contact Us", to: "/onboarding#contact" },
      { label: "Privacy Policy", to: "/onboarding#privacy" },
      { label: "Terms of Service", to: "/onboarding#terms" },
    ],
  },
];

export default function DashboardFooter() {
  return (
    <footer className="dashboard-footer">
      <div className="dashboard-footer__grid">
        <div className="dashboard-footer__brand">
          <strong>SafeTrade</strong>
        </div>

        {footerColumns.map((column) => (
          <div key={column.title} className="dashboard-footer__column">
            <h4>{column.title}</h4>
            {column.links.map((link) => (
              <Link key={link.label} to={link.to}>
                {link.label}
              </Link>
            ))}
          </div>
        ))}
      </div>

      <div className="dashboard-footer__bottom">
        <span>&copy; 2026 SafeTrade. All rights reserved.</span>
        <span>Secure local trading with escrow protection.</span>
      </div>
    </footer>
  );
}
