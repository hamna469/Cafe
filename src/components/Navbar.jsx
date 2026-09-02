import { useState } from "react";
import { Link } from "react-router-dom";

function Navbar({
  cartCount = 0,
  user,
  onLogout,
  onLoginClick,
  onSignupClick
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">

      <Link
        to="/"
        className="navbar-brand"
        onClick={closeMenu}
      >
        <img
          src="/logo.png"
          alt="Brew Haven Logo"
          width="45"
          height="45"
        />

        <h1>Brew Haven</h1>
      </Link>


      {/* MOBILE MENU BUTTON */}

      <button
        type="button"
        className="menu-toggle"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label={
          menuOpen
            ? "Close navigation menu"
            : "Open navigation menu"
        }
        aria-expanded={menuOpen}
        aria-controls="main-navigation"
      >
        ☰
      </button>


      {/* NAVIGATION */}

      <ul
        id="main-navigation"
        className={`navbar-links ${menuOpen ? "open" : ""}`}
      >

        <li>
          <Link to="/" onClick={closeMenu}>
            Home
          </Link>
        </li>

        <li>
          <Link to="/menu" onClick={closeMenu}>
            Menu
          </Link>
        </li>

        <li>
          <Link
            to="/cart"
            className="cart-link"
            onClick={closeMenu}
            aria-label={
              cartCount > 0
                ? `Shopping cart, ${cartCount} items`
                : "Shopping cart"
            }
          >
            Cart

            {cartCount > 0 && (
              <span
                className="cart-badge"
                aria-hidden="true"
              >
                {cartCount}
              </span>
            )}
          </Link>
        </li>

        <li>
          <Link to="/orders" onClick={closeMenu}>
            Orders
          </Link>
        </li>

        <li>
          <Link to="/reviews" onClick={closeMenu}>
            Reviews
          </Link>
        </li>

        <li>
          <Link to="/contact" onClick={closeMenu}>
            Contact
          </Link>
        </li>


        {/* AUTHENTICATION CONTROLS */}

        {user ? (
          <>
            <li className="navbar-user-item">
              <span className="navbar-user-info">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="currentColor"
                  className="nav-user-icon"
                  aria-hidden="true"
                >
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>

                {user.name}
              </span>
            </li>

            <li>
              <button
                type="button"
                className="nav-logout-btn"
                onClick={() => {
                  onLogout();
                  closeMenu();
                }}
              >
                Log Out
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <button
                type="button"
                className="nav-login-btn"
                onClick={() => {
                  onLoginClick();
                  closeMenu();
                }}
              >
                Log In
              </button>
            </li>

            <li>
              <button
                type="button"
                className="nav-signup-btn"
                onClick={() => {
                  onSignupClick();
                  closeMenu();
                }}
              >
                Sign Up
              </button>
            </li>
          </>
        )}

      </ul>

    </nav>
  );
}

export default Navbar;