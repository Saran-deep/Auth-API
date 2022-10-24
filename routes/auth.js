const express = require("express");
const User = require("../models/User");
const Tokens = require("../models/Tokens");
const validate = require("../middlewares/RequestValidator");
const {
  registrationSchema,
  loginSchema,
} = require("../validationSchema/ValidationSchema");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();

router.post("/register", validate(registrationSchema), async (req, res) => {
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

    const newToken = new Tokens({
      _userId: user._id,
      accessToken: generateToken(user),
      refreshToken: generateRereshToken(user),
    });

    const token = await newToken.save();

    res
      .header("auth-token", token.accessToken)
      .status(200)
      .json({ ...token._doc });
  } catch (err) {
    res.status(400).send(err);
  }
});

router.post("/login", validate(loginSchema), async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send("Email doesn't exist.");

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (!validPassword) return res.status(400).send("Password is not correct.");

    const accessToken = generateToken(user);
    const refreshToken = generateRereshToken(user);

    const newToken = await Tokens.findOneAndUpdate(
      { _userId: user._id },
      { $set: { accessToken: accessToken, refreshToken: refreshToken } },
      { new: true }
    );

    if (!newToken)
      return res
        .status(500)
        .send("No Token found in the database for the user");

    res.header("auth-token", newToken.accessToken).status(200).json(newToken);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.post("/refresh-token", async (req, res) => {
  const refreshToken = req.body.refreshToken;

  if (!refreshToken) return res.status(500).send("No refresh token found.");

  let user;
  try {
    user = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
  } catch (err) {
    return res.status(500).send("Invalid Token");
  }

  const newAccessToken = generateToken(user);
  const newRefreshToken = generateRereshToken(user);

  try {
    const tokenInDB = await Tokens.findOne({
      $and: [{ userId: user._id }, { refreshToken: refreshToken }],
    });

    if (!tokenInDB)
      return res.status(400).send("User or Token doesn't exist in the DB");

    const newToken = await Tokens.findOneAndUpdate(
      { _userId: user._id },
      { $set: { accessToken: newAccessToken, refreshToken: newRefreshToken } },
      { new: true }
    );

    if (!newToken)
      return res
        .status(500)
        .send("No Token found in the database for the user");

    res.header("auth-token", newToken.accessToken).status(200).json({
      accessToken: newToken.accessToken,
      refreshToken: newToken.refreshToken,
    });
  } catch (err) {
    return res.status(500).send(err);
  }
});

const generateToken = (user) => {
  return jwt.sign({ _id: user._id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15s",
  });
};

const generateRereshToken = (user) => {
  return jwt.sign({ _id: user._id }, process.env.REFRESH_TOKEN_SECRET);
};

module.exports = router;
