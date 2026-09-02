import { useState, useEffect } from "react";
import "./OrderModal.css";

function OrderModal({ isOpen, onClose, items, onOrderSuccess }) {
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    postal_code: "",
  });

  const [notes, setNotes] = useState("");
  const [orderItems, setOrderItems] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState("");
  
  // STATE FOR SECURITY BANNER VISIBILITY
  const [showSecurityBanner, setShowSecurityBanner] = useState(true);

  // Initialize order items
  useEffect(() => {
    if (!items) return;

    const itemsArray = Array.isArray(items) ? items : [items];
    const grouped = {};

    itemsArray.forEach((item) => {
      if (!item) return;

      const cleanPrice =
        Number(
          String(item.price)
            .replace("$", "")
            .replace("Rs.", "")
            .trim()
        ) || 0;

      if (grouped[item.id]) {
        grouped[item.id].quantity += 1;
      } else {
        grouped[item.id] = {
          menu_item: item,
          quantity: 1,
          price: cleanPrice,
        };
      }
    });

    setOrderItems(Object.values(grouped));
    setSubmitSuccess(false);
    setError("");
  }, [items, isOpen]);

  if (!isOpen) return null;

  // ==========================================
  // onChange TEST
  // ==========================================
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    console.log("ONCHANGE WORKING:", name, value);

    setCustomerInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==========================================
  // onBlur TEST
  // ==========================================
  const handleInputBlur = (e) => {
    const { name, value } = e.target;

    console.log("ONBLUR WORKING:", name, value);
  };

  // ==========================================
  // Quantity
  // ==========================================
  const updateQuantity = (itemId, change) => {
    setOrderItems((prev) =>
      prev
        .map((item) => {
          if (item.menu_item.id === itemId) {
            const newQty = item.quantity + change;

            return {
              ...item,
              quantity: newQty,
            };
          }

          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  // ==========================================
  // Calculate Total
  // ==========================================
  const calculateTotal = () => {
    return orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  };

  // ==========================================
  // onSubmit TEST
  // ==========================================
  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("ONSUBMIT WORKING");

    setError("");

    // Validation
    if (!customerInfo.name.trim()) {
      return setError("Full Name is required.");
    }

    if (!customerInfo.phone.trim()) {
      return setError("Phone Number is required.");
    }

    if (!customerInfo.email.trim()) {
      return setError("Email Address is required.");
    }

    if (!customerInfo.address.trim()) {
      return setError("Delivery Address is required.");
    }

    if (!customerInfo.city.trim()) {
      return setError("City is required.");
    }

    if (!customerInfo.postal_code.trim()) {
      return setError("Postal Code is required.");
    }

    if (orderItems.length === 0) {
      return setError("No items in order.");
    }

    setIsSubmitting(true);

    const payload = {
      customer: {
        name: customerInfo.name,
        phone: customerInfo.phone,
        email: customerInfo.email,
        address: customerInfo.address,
        city: customerInfo.city,
        postal_code: customerInfo.postal_code,
      },

      items: orderItems.map((item) => ({
        menu_item_id: item.menu_item.id,
        quantity: item.quantity,
        price: item.price.toFixed(2),
      })),

      notes: notes,

      total_price: calculateTotal().toFixed(2),
    };

    console.log("ORDER PAYLOAD:", payload);

    fetch("http://127.0.0.1:8000/api/order/", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        const data = await res.json();

        if (res.ok) {
          console.log("ORDER SUBMITTED SUCCESSFULLY");

          setSubmitSuccess(true);
          setIsSubmitting(false);

          if (onOrderSuccess) {
            onOrderSuccess();
          }
        } else {
          console.error("ORDER ERROR:", data);

          setIsSubmitting(false);

          setError(
            data.email
              ? `Email field error: ${data.email.join(", ")}`
              : data.phone
              ? `Phone field error: ${data.phone.join(", ")}`
              : "Failed to place order. Please check your information."
          );
        }
      })

      .catch((err) => {
        console.error("Order submit error:", err);

        setIsSubmitting(false);

        setError("Network error. Unable to connect to server.");
      });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ position: 'relative', overflow: 'hidden' }} // Added to contain banner if needed, but we use fixed
      >
        {/* ==========================================
            🔒 SECURITY BANNER (ADDED FOR TESTING)
            ========================================== */}
        {showSecurityBanner && (
          <div
            className="security-banner"
            style={{
              position: 'fixed',
              top: '10px',
              left: '10px',
              right: '10px',
              zIndex: 9999, // Highest z-index to stay above mobile menu
              background: '#d4edda',
              color: '#155724',
              padding: '12px 20px',
              borderRadius: '8px',
              border: '1px solid #c3e6cb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              fontFamily: 'Arial, sans-serif',
              fontSize: '14px',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '20px' }}>🔒</span>
              <span>
                <strong>Secure System:</strong> Your order details are being submitted over an encrypted connection.
              </span>
            </span>
            <button
              onClick={() => setShowSecurityBanner(false)}
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                color: '#155724',
                padding: '0 5px',
              }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Close Button */}
        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
        >
          ✕
        </button>

        {/* Success Message */}
        {submitSuccess ? (
          <div className="success-container">
            <span className="success-icon">☕🎉</span>

            <h2>Order Placed Successfully!</h2>

            <p>
              Thank you for ordering from Brew Haven. Your order details
              have been saved, and our chef is preparing your fresh treats.
            </p>

            <button
              type="button"
              className="submit-btn"
              onClick={onClose}
            >
              Awesome
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="modal-header">
              <h2>Place Your Order</h2>

              <p>
                Please enter your information to complete your order.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {/* FORM */}
            <form onSubmit={handleSubmit}>
              <div className="form-grid">

                {/* Name */}
                <div className="form-group full-width">
                  <label htmlFor="name">
                    Full Name
                  </label>

                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={customerInfo.name}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                {/* Phone */}
                <div className="form-group">
                  <label htmlFor="phone">
                    Phone Number
                  </label>

                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={customerInfo.phone}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    placeholder="e.g. 0300-1234567"
                    required
                  />
                </div>

                {/* Email */}
                <div className="form-group">
                  <label htmlFor="email">
                    Email Address
                  </label>

                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={customerInfo.email}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    placeholder="e.g. customer@email.com"
                    required
                  />
                </div>

                {/* Address */}
                <div className="form-group full-width">
                  <label htmlFor="address">
                    Delivery Address
                  </label>

                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={customerInfo.address}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    placeholder="Street name, house number, etc."
                    required
                  />
                </div>

                {/* City */}
                <div className="form-group">
                  <label htmlFor="city">
                    City
                  </label>

                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={customerInfo.city}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    placeholder="e.g. Lahore"
                    required
                  />
                </div>

                {/* Postal Code */}
                <div className="form-group">
                  <label htmlFor="postal_code">
                    Postal Code
                  </label>

                  <input
                    type="text"
                    id="postal_code"
                    name="postal_code"
                    value={customerInfo.postal_code}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    placeholder="e.g. 54000"
                    required
                  />
                </div>

                {/* Notes */}
                <div className="form-group full-width">
                  <label htmlFor="notes">
                    Special Instructions (Optional)
                  </label>

                  <textarea
                    id="notes"
                    name="notes"
                    value={notes}
                    onChange={(e) => {
                      console.log(
                        "ONCHANGE WORKING: notes",
                        e.target.value
                      );

                      setNotes(e.target.value);
                    }}
                    onBlur={handleInputBlur}
                    placeholder="e.g. Extra sugar, deliver by 6 PM"
                  />
                </div>
              </div>

              {/* Order Items */}
              <div className="order-items-summary">
                <h3>Order Items</h3>

                {orderItems.map((item) => (
                  <div
                    className="summary-item"
                    key={item.menu_item.id}
                  >
                    <div className="summary-item-info">
                      <img
                        src={item.menu_item.image}
                        alt={item.menu_item.name}
                      />

                      <div>
                        <div className="summary-item-name">
                          {item.menu_item.name}
                        </div>

                        <div
                          style={{
                            fontSize: "12px",
                            color: "#8d6e63",
                          }}
                        >
                          Rs. {item.price.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {/* Quantity */}
                    <div className="quantity-controls">
                      <button
                        type="button"
                        className="qty-btn"
                        onClick={() =>
                          updateQuantity(
                            item.menu_item.id,
                            -1
                          )
                        }
                      >
                        -
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        type="button"
                        className="qty-btn"
                        onClick={() =>
                          updateQuantity(
                            item.menu_item.id,
                            1
                          )
                        }
                      >
                        +
                      </button>
                    </div>

                    {/* Price */}
                    <div className="summary-item-price">
                      Rs.{" "}
                      {(
                        item.price * item.quantity
                      ).toFixed(2)}
                    </div>
                  </div>
                ))}

                {/* Total */}
                <div className="total-summary">
                  <span>Grand Total:</span>

                  <span>
                    Rs. {calculateTotal().toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Placing Order..."
                  : "Confirm & Place Order"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default OrderModal;