const jsonServer = require("json-server");

const server = jsonServer.create();
const router = jsonServer.router("./backend/db.json");
const middlewares = jsonServer.defaults();

server.use(middlewares);

// Payload validation
server.use("/menu", (req, res, next) => {
  if (req.method === "POST" || req.method === "PUT") {
    const { name, price, type, discount } = req.body;

    // Required fields
    if (!name) {
      return res.status(400).json({
        error: "name is required"
      });
    }

    if (price === undefined) {
      return res.status(400).json({
        error: "price is required"
      });
    }

    if (!type) {
      return res.status(400).json({
        error: "type is required"
      });
    }

    // Data type validation
    if (typeof price !== "number") {
      return res.status(400).json({
        error: "price must be a number"
      });
    }

    // Extra field validation
    if (discount !== undefined) {
      return res.status(400).json({
        error: "discount is not allowed"
      });
    }
  }

  next();
});

server.use(router);

server.listen(3000, () => {
  console.log("JSON Server is running on http://localhost:3000");
});