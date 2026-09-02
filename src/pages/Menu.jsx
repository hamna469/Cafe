import { useState, useEffect } from "react";

function Menu({ addToCart, openOrderModal }) {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draggedItem, setDraggedItem] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/menu/")
      .then((res) => res.json())
      .then((data) => {
        setMenu(data);
        setLoading(false);
        console.log("MENU DATA:", data);
      })
      .catch((err) => {
        console.log("ERROR:", err);
        setLoading(false);
      });
  }, []);

  // Drag start
  const handleDragStart = (item) => {
    setDraggedItem(item);
  };

  // Drop
  const handleDrop = (targetItem) => {
    if (!draggedItem || draggedItem.id === targetItem.id) {
      return;
    }

    const updatedMenu = [...menu];

    const draggedIndex = updatedMenu.findIndex(
      (item) => item.id === draggedItem.id
    );

    const targetIndex = updatedMenu.findIndex(
      (item) => item.id === targetItem.id
    );

    // Remove dragged item
    const [removedItem] = updatedMenu.splice(draggedIndex, 1);

    // Insert dragged item at target position
    updatedMenu.splice(targetIndex, 0, removedItem);

    setMenu(updatedMenu);
    setDraggedItem(null);
  };

  // Drag end
  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  return (
    <div className="main">
      <section className="menu-section">

        {/* HEADING */}
        <div className="menu-heading">
          <p className="small-title">BREW HAVEN SPECIAL</p>

          <h1 className="page-title">Our Menu ☕</h1>

          <p className="menu-subtitle">
            Fresh coffee, desserts & cozy café favorites
          </p>

          <p style={{ textAlign: "center", color: "#777" }}>
            Drag and drop menu items to reorder them
          </p>
        </div>

        {/* LOADING */}
        {loading ? (
          <h2 style={{ textAlign: "center" }}>
            Loading Menu...
          </h2>
        ) : (

          <div className="menu-grid">

            {menu.map((item) => (

              <div
                className="menu-card"
                key={item.id}
                draggable={true}
                onDragStart={() => handleDragStart(item)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(item)}
                onDragEnd={handleDragEnd}
                style={{
                  cursor: "grab",
                }}
              >

                <img
  src={
    item.image?.startsWith("http")
      ? item.image
      : `http://127.0.0.1:8000${item.image}`
  }
  alt={item.name}
/>


                <div className="menu-content">

                  <h3>{item.name}</h3>

                  <p>{item.description}</p>

                  <div className="menu-bottom">

                    <span>Rs. {item.price}</span>

                    <div className="btns">

                      <button
                        onClick={() => addToCart(item)}
                      >
                        Add to Cart
                      </button>

                      <button
                        className="order"
                        onClick={() => openOrderModal(item)}
                      >
                        Place Order
                      </button>

                    </div>

                  </div>

                </div>

              </div>

            ))}

          </div>
        )}

      </section>
    </div>
  );
}

export default Menu;
