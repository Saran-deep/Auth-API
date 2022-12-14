const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: "string",
    required: true,
    min: 6,
    max: 255,
  },
  email: {
    type: "string",
    required: true,
    min: 6,
    max: 255,
  },
  password: {
    type: "string",
    required: true,
    min: 6,
    max: 1024,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", userSchema);
