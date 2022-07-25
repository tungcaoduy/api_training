const express = require("express");
const morgan = require("morgan");
const productsRoute = require("./routers/products.route");
const ordersRoute = require("./routers/order.route");
const usersRoute = require("./routers/user.route");
const cors = require('cors');

const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const middleware = require("./middleware/check-auth");

mongoose.connect(
  "mongodb+srv://tungcd:anhtung1@cluster0.ls7es.mongodb.net/myFirstDatabase?retryWrites=true&w=majority", {
    useNewUrlParser: true,
  }
);

mongoose.Promise = global.Promise;

const app = express();
app.use(morgan("dev"));
app.use("/upload", express.static("upload"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(cors());

app.use(
  "/api/products",
  middleware,
  productsRoute
);
app.use(
  "/api/orders",
  middleware,
  ordersRoute
);
app.use("/api/users", usersRoute);

app.use((req, res, next) => {
  const error = new Error("Not found!");
  error.status(404);
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});

module.exports = app;