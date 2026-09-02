function Cart({
  cart = [],
  removeFromCart = () => {},
  placeOrder = () => {},
}) {
  // SAFE TOTAL CALCULATION
  const total = (cart || []).reduce((sum, item) => {
    const price = Number(
      String(item?.price || "").replace("$", "").replace("Rs.", "").trim()
    ) || 0;

    return sum + price;
  }, 0);

  return (
    <div className="cart-page">
      <h1 className="cart-title">
        Your Cart ☕
      </h1>

      {(!cart || cart.length === 0) ? (
        <p className="empty-cart">
          Cart items will appear here.
        </p>
      ) : (
        <>
          {/* CART ITEMS */}
          <div className="cart-container">

            {cart.map((item, index) => (
              <div
                className="cart-item"
                key={item.id || index}
              >

                {/* IMAGE */}
                <img
                  src={
                    item?.image ||
                    "https://via.placeholder.com/150"
                  }
                  alt={item?.name || "item"}
                />

                {/* INFO */}
                <div className="cart-info">
                  <h3>{item?.name}</h3>
                  <p>{item?.desc || item?.description}</p>
                  <span>Rs. {item?.price}</span>
                </div>

                {/* DELETE */}
                <button
                  className="delete-btn"
                  onClick={() =>
                    removeFromCart(index)
                  }
                >
                  ✕
                </button>

                {/* PLACE ORDER */}
                <button
                  className="place-order-btn"
                  onClick={() => placeOrder(item)}
                >
                  Place Order
                </button>

              </div>
            ))}

          </div>

          {/* TOTAL */}
          <div className="cart-total">
            <h2>
              Total: Rs. {total.toFixed(2)}
            </h2>

           
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;