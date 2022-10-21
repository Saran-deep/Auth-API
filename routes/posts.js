const express = require("express");
const router = express.Router();
const validateToken = require("../middlewares/validateToken");

router.get("/", validateToken, (req, res) => {
  res.status(200).json({ ...req.user });
});

module.exports = router;
