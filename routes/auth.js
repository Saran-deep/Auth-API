const express = require("express");
const User = require("../models/User");
const validate = require("../middlewares/RequestValidator");
const {
  registrationSchema,
  loginSchema,
} = require("../validationSchema/ValidationSchema");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();

router.post(
  "/register",
  validate(registrationSchema),
  async (req, res, next) => {
    try {
      const emailExist = await User.findOne({ email: req.body.email });
      if (emailExist) return res.status(400).send("Email already exist");
    } catch (err) {
      res.status(500).send(err);
    }

    let hashedPassword;

    try {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(req.body.password, salt);
    } catch (err) {
      res.status(500).send(err);
    }

    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });

    try {
      const user = await newUser.save();
      res.status(200).json({ user: user._id });
      next();
    } catch (err) {
      res.status(400).send(err);
    }
  }
);

router.post("/login", validate(loginSchema), async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send("Email doesn't exist.");

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (!validPassword) return res.status(400).send("Password is not correct.");

    const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
    res
      .header("auth-token", token)
      .status(200)
      .json({ id: user._id, token: token });
    next();
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = router;
