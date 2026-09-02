import { Link } from "react-router-dom";

function Home() {

  return (

    <div className="main">

      <section className="hero">

        {/* ===== LEFT SIDE ===== */}

        <div className="hero-text">

          <p className="hero-tag">Brew Haven Cafe</p>

          <h2>
            Taste the <br />
            Perfect Brew
          </h2>

          <p className="hero-description">

            Experience warm handcrafted coffee,
            delicious desserts, cakes and pastries
            in a cozy premium atmosphere made for
            coffee lovers.

          </p>

          <div className="buttons">

            <Link to="/menu">

              <button className="menu-btn">
                Explore Menu
              </button>

            </Link>

            <Link to="/cart">

              <button className="order-btn">
                Order Now
              </button>

            </Link>

          </div>

        </div>

        {/* ===== RIGHT SIDE ===== */}

        <div className="hero-image">

          <img
            src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8Y29mZmV8ZW58MHx8MHx8fDA%3D"
            alt="coffee"
          />

        </div>

      </section>

    </div>

  );
}

export default Home;