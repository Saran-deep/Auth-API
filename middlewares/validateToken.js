const jwt = require("jsonwebtoken");

module.exports = validateToken = (req, res, next) => {
  const token = req.header("auth-token");

  if (!token) return res.status(401).send("Access denied. No token found.");

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).send("Invalid Token");
    req.user = user;
    next();
  });
};
