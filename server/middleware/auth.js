const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

const checkRole = (roleDuocPhep) => {
  return (req, res, next) => {
    const userRole = req.user.role; 
    if (roleDuocPhep.includes(userRole)) {
      next();
    } else {
      res.status(403).json({ message: "Chặn lại! Bạn không đủ quyền." });
    }
  };
};

module.exports = { authenticateToken, checkRole };
