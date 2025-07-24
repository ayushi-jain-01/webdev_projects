import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  console.log("Authorization header:", authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("Missing or malformed Authorization header.");
    return res.status(401).json({ error: "Access Denied. Token missing or invalid format." });
  }

  const token = authHeader && authHeader.split(" ")[1];
  console.log("Token extracted:", token);

  try {
    const verified = jwt.verify(token, process.env.TOKEN_SECRET);
    console.log("Token verified payload:", verified);
    req.user = {userId : verified.userId};
    next();
  } catch (err) {
    console.log("Token verification error:", err.message);
    return res.status(401).json({ error: "Unauthorized - Token invalid or expired"});
  }
};

export default verifyToken;