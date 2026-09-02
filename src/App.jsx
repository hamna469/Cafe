import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Cart from "./pages/Cart";
import Reviews from "./pages/Reviews";
import Contact from "./pages/Contact";
import Orders from "./pages/Orders";

import OrderModal from "./components/OrderModal";
import { ToastContainer } from "./components/Toast";
import AuthModal from "./components/AuthModal";
import AuthPage from "./pages/AuthPage";
import AutofillTest from "./AutofillTest";

function App() {

  // =========================================================
  // AUTH STATE
  // =========================================================

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");

    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      localStorage.removeItem("user");
      return null;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState("login");

  // =========================================================
  // CART STATE
  // =========================================================

  const [cart, setCart] = useState([]);

  // =========================================================
  // TOAST STATE
  // =========================================================

  const [toasts, setToasts] = useState([]);

  // =========================================================
  // ORDER MODAL STATE
  // =========================================================

  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderModalItems, setOrderModalItems] = useState([]);
  const [isFromCart, setIsFromCart] = useState(false);

  // =========================================================
  // HANDLE AUTH SUCCESS
  // =========================================================

  const handleAuthSuccess = (loggedInUser) => {
    setUser(loggedInUser);
  };

  // =========================================================
  // TRIGGER TOAST NOTIFICATION
  // =========================================================

  const triggerToast = (message) => {
    const newToast = {
      id: Date.now() + Math.random(),
      message
    };

    setToasts((prev) => [...prev, newToast]);
  };

  // =========================================================
  // ADD TO CART
  // =========================================================

  const addToCart = (item) => {
    setCart([...cart, item]);

    triggerToast("Item added to cart successfully!");
  };

  // =========================================================
  // REMOVE TOAST
  // =========================================================

  const removeToast = (id) => {
    setToasts((prev) =>
      prev.filter((toast) => toast.id !== id)
    );
  };

  // =========================================================
  // REMOVE FROM CART
  // =========================================================

  const removeFromCart = (indexToRemove) => {
    setCart(
      cart.filter(
        (item, index) => index !== indexToRemove
      )
    );
  };

  // =========================================================
  // OPEN ORDER MODAL
  // =========================================================

  const openOrderModal = (items, fromCart = false) => {
    setOrderModalItems(items);
    setIsFromCart(fromCart);
    setIsOrderModalOpen(true);
  };

  // =========================================================
  // HANDLE ORDER SUCCESS
  // =========================================================

  const handleOrderSuccess = () => {
    if (isFromCart) {
      setCart([]);
    }
  };

  // =========================================================
  // HANDLE LOGOUT
  // =========================================================

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);

    triggerToast("Logged out successfully.");
  };

  // =========================================================
  // OPEN LOGIN MODAL
  // =========================================================

  const handleLoginClick = () => {
    setAuthModalTab("login");
    setIsAuthModalOpen(true);
  };

  // =========================================================
  // OPEN SIGNUP MODAL
  // =========================================================

  const handleSignupClick = () => {
    setAuthModalTab("signup");
    setIsAuthModalOpen(true);
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <BrowserRouter>

      {/* NAVBAR */}
      <Navbar
        cartCount={cart.length}
        user={user}
        onLogout={handleLogout}
        onLoginClick={handleLoginClick}
        onSignupClick={handleSignupClick}
      />

      {/* ROUTES */}
      <Routes>

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/menu"
          element={
            <Menu
              addToCart={addToCart}
              openOrderModal={openOrderModal}
            />
          }
        />
        <Route
  path="/autofill-test"
  element={<AutofillTest />}
/>

        {/* CART */}
        <Route
          path="/cart"
          element={
            <Cart
              cart={cart}
              removeFromCart={removeFromCart}
              placeOrder={(items) =>
                openOrderModal(items, true)
              }
            />
          }
        />

        {/* ORDERS */}
        <Route
          path="/orders"
          element={<Orders />}
        />

        {/* REVIEWS */}
        <Route
          path="/reviews"
          element={<Reviews />}
        />

        {/* CONTACT */}
        <Route
          path="/contact"
          element={<Contact />}
        />

        {/* LOGIN PAGE */}
        <Route
          path="/login"
          element={
            <AuthPage
              defaultMode="login"
              onSuccess={handleAuthSuccess}
              triggerToast={triggerToast}
            />
          }
        />

        {/* SIGNUP PAGE */}
        <Route
          path="/signup"
          element={
            <AuthPage
              defaultMode="signup"
              onSuccess={handleAuthSuccess}
              triggerToast={triggerToast}
            />
          }
        />

      </Routes>

      {/* ORDER FORM MODAL */}
      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        items={orderModalItems}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* NORMAL AUTH POPUP */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        tab={authModalTab}
        onSuccess={handleAuthSuccess}
        triggerToast={triggerToast}
      />

      {/* TOAST NOTIFICATIONS */}
      <ToastContainer
        toasts={toasts}
        removeToast={removeToast}
      />

    </BrowserRouter>
  );
}

export default App;