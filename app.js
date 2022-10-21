const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = express();
const authRoute = require("./routes/auth");
const postRoute = require("./routes/posts");

app.use(express.json());

dotenv.config();

mongoose.connect(process.env.DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Database connection error: "));
db.once("open", function () {
  console.log("Connected to database successfully");
});

app.use("/API/auth", authRoute);
app.use("/API/posts", postRoute);

try {
  app.listen(3000, () => {
    console.log("Api running at: http://localhost:3000");
  });
} catch (err) {
  console.error(err);
  process.exit();
}
