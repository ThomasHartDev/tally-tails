import { Link, NavLink, useLocation } from "react-router";
import { useEffect, useState } from "react";
import { useCart } from "~/lib/cart-context";

// Routes whose top viewport is a dark photo hero. On those, the nav text
// needs to flip light at scroll-zero so it's readable over the photo.
// On other routes the page bg is cream from the top, so default dark
// text stays correct.
const DARK_HERO_ROUTES = new Set(["/"]);

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const overDarkHero = DARK_HERO_ROUTES.has(pathname);
  const { open: openCart, itemCount } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu whenever the route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Lock body scroll while the mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [menuOpen]);

  return (
    <header
      className={[
        "site-header",
        scrolled || menuOpen ? "is-scrolled" : "",
        overDarkHero ? "over-dark-hero" : "over-light-bg",
        menuOpen ? "menu-open" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="site-header-inner container">
        <Link to="/" className="site-brand" aria-label="TallyTails home">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
              <path
                d="M4 17c0-4 3-7 8-7s8 3 8 7"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
              <path
                d="M7 10c0-2 1.5-3.5 3-3.5S13 8 13 10M11 10c0-2 1.5-3.5 3-3.5S17 8 17 10"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="brand-wordmark">TALLYTAILS</span>
        </Link>

        <nav className="site-nav" aria-label="Primary">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive ? "site-nav-link is-active" : "site-nav-link"
            }
          >
            Home
          </NavLink>
          <a href="/#catalog" className="site-nav-link">
            Shop
          </a>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              isActive ? "site-nav-link is-active" : "site-nav-link"
            }
          >
            About
          </NavLink>
          <NavLink
            to="/blog"
            className={({ isActive }) =>
              isActive ? "site-nav-link is-active" : "site-nav-link"
            }
          >
            Journal
          </NavLink>
        </nav>

        <div className="site-actions">
          <Link
            to="/account"
            className="site-icon-btn site-account-btn"
            aria-label="Account"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.6" />
              <path
                d="M4 21c0-4 4-7 8-7s8 3 8 7"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </Link>
          <button
            type="button"
            className="site-icon-btn site-cart-btn"
            aria-label={`Cart, ${itemCount} item${itemCount === 1 ? "" : "s"}`}
            onClick={openCart}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M6 6h15l-1.5 9h-12L5 3H2"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              <circle cx="9" cy="20" r="1.5" fill="currentColor" />
              <circle cx="18" cy="20" r="1.5" fill="currentColor" />
            </svg>
            {itemCount > 0 && <span className="site-cart-count">{itemCount}</span>}
          </button>
          <button
            type="button"
            className="site-icon-btn site-menu-btn"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <nav
        id="mobile-menu"
        className={`mobile-menu ${menuOpen ? "is-open" : ""}`}
        aria-label="Primary mobile"
        {...(!menuOpen ? { inert: "" } : {})}
      >
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            isActive ? "mobile-menu-link is-active" : "mobile-menu-link"
          }
        >
          Home
        </NavLink>
        <a href="/#catalog" className="mobile-menu-link" onClick={() => setMenuOpen(false)}>
          Shop
        </a>
        <NavLink
          to="/about"
          className={({ isActive }) =>
            isActive ? "mobile-menu-link is-active" : "mobile-menu-link"
          }
        >
          About
        </NavLink>
        <NavLink
          to="/blog"
          className={({ isActive }) =>
            isActive ? "mobile-menu-link is-active" : "mobile-menu-link"
          }
        >
          Journal
        </NavLink>
      </nav>
    </header>
  );
}
