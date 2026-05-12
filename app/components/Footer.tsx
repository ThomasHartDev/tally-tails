import { Link } from "react-router";
import "./Footer.css";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner container">
        <div className="footer-grid">
          <div className="footer-brand">
            <span className="footer-wordmark">TALLYTAILS</span>
            <p className="footer-tag">
              Cat side or dog side. Every order tips the score. One storefront,
              two tribes, an ongoing tally between them.
            </p>
          </div>

          <div>
            <h2 className="footer-heading">Shop</h2>
            <ul className="footer-list">
              <li><a href="/#catalog">All products</a></li>
              <li><a href="/#catalog">Cat side</a></li>
              <li><a href="/#catalog">Dog side</a></li>
              <li><a href="/#catalog">Bundles</a></li>
            </ul>
          </div>

          <div>
            <h2 className="footer-heading">Brand</h2>
            <ul className="footer-list">
              <li><Link to="/about">About</Link></li>
              <li><Link to="/blog">Journal</Link></li>
              <li><a href="mailto:support@tallytails.com">Contact</a></li>
            </ul>
          </div>

          <div>
            <h2 className="footer-heading">The weekly tally</h2>
            <p className="footer-newsletter-copy">
              One email a week. Who's winning, what's new, no spam.
            </p>
            <form className="footer-newsletter" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                aria-label="Email"
                placeholder="you@yourbrand.com"
                className="footer-newsletter-input"
              />
              <button type="submit" className="btn btn-primary footer-newsletter-btn">
                Join
              </button>
            </form>
          </div>
        </div>

        <div className="footer-bottom">
          <span>&copy; TallyTails {new Date().getFullYear()}</span>
          <span>Custom-built by HARTECHO.</span>
        </div>
      </div>
    </footer>
  );
}
