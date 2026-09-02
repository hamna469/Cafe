import { useState, useEffect } from "react";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/orders/")
      .then((res) => res.json())
      .then((data) => {
        console.log("ORDERS:", data);
        setOrders(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.log("ORDER ERROR:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="orders-page main" style={{ padding: "120px 8% 60px" }}>
      <h1 className="page-title" style={{ marginTop: "20px", marginBottom: "40px" }}>Your Orders 📦</h1>

      {loading ? (
        <h2 style={{ textAlign: "center", color: "#6d4c41" }}>Loading orders...</h2>
      ) : orders.length === 0 ? (
        <p style={{ textAlign: "center", fontSize: "18px", color: "#7b6a58" }}>No orders found</p>
      ) : (
        orders.map((item) => (
          <div
            key={item.id}
            style={{
              padding: "20px",
              border: "1px solid rgba(221, 184, 146, 0.4)",
              margin: "20px auto",
              maxWidth: "800px",
              borderRadius: "16px",
              background: "#fff",
              boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f5ede3", paddingBottom: "10px", marginBottom: "15px" }}>
              <h2 style={{ fontSize: "20px", color: "#3b2521", margin: 0 }}>Order #{item.id}</h2>
              <span
                style={{
                  padding: "5px 12px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  background:
                    item.status === "pending"
                      ? "#ffeecb"
                      : item.status === "processing"
                      ? "#e3f2fd"
                      : item.status === "delivered" || item.status === "completed"
                      ? "#e8f5e9"
                      : "#eaeaea",
                  color:
                    item.status === "pending"
                      ? "#b58105"
                      : item.status === "processing"
                      ? "#0d47a1"
                      : item.status === "delivered" || item.status === "completed"
                      ? "#1b5e20"
                      : "#666",
                }}
              >
                {item.status}
              </span>
            </div>

            <p style={{ margin: "6px 0", fontSize: "15px", color: "#3e2723" }}>
              <strong>Customer:</strong> {item.customer?.name} ({item.customer?.phone})
            </p>
            <p style={{ margin: "6px 0", fontSize: "15px", color: "#3e2723" }}>
              <strong>Email:</strong> {item.customer?.email}
            </p>
            <p style={{ margin: "6px 0", fontSize: "15px", color: "#3e2723" }}>
              <strong>Delivery Address:</strong> {item.customer?.address}, {item.customer?.city} ({item.customer?.postal_code})
            </p>
            
            <p style={{ margin: "15px 0 5px 0", fontSize: "15px", color: "#3e2723" }}>
              <strong>Items Ordered:</strong>
            </p>
            <div style={{ background: "#fdfaf7", padding: "12px 18px", borderRadius: "10px", margin: "10px 0", border: "1px solid #f5ede3" }}>
              {item.items?.map((subItem) => (
                <div key={subItem.id} style={{ display: "flex", justifyContent: "space-between", margin: "6px 0", fontSize: "14px", color: "#5d4037" }}>
                  <span>{subItem.quantity} x {subItem.menu_item?.name}</span>
                  <span style={{ fontWeight: "600" }}>Rs. {(Number(subItem.price) * subItem.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {item.notes && (
              <p style={{ margin: "12px 0", padding: "10px", background: "#fdf8f5", borderRadius: "8px", fontSize: "14px", fontStyle: "italic", color: "#6d4c41", borderLeft: "3px solid #ddb892" }}>
                <strong>Notes:</strong> {item.notes}
              </p>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "15px", paddingTop: "12px", borderTop: "1px solid #f5ede3" }}>
              <span style={{ fontSize: "13px", color: "#7b6a58" }}>
                Ordered on: {new Date(item.created_at).toLocaleString()}
              </span>
              <span style={{ fontSize: "18px", fontWeight: "bold", color: "#8b5e3c" }}>
                Total Price: Rs. {Number(item.total_price).toFixed(2)}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default Orders;