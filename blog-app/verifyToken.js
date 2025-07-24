import jwt from 'jsonwebtoken';

const verifyToken = (req, res, next) => {
  const authHeader = req.header("Authorization");
  console.log("Authorization header:", authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("Missing or malformed Authorization header.");
    return res.status(401).json({ error: "Access Denied. Token missing or invalid format." });
  }

  const token = authHeader.split(" ")[1];
  console.log("Token extracted:", token);

  try {
    const verified = jwt.verify(token, process.env.TOKEN_SECRET);
    console.log("Token verified payload:", verified);
    req.user = verified;
    next();
  } catch (err) {
    console.log("Token verification error:", err.message);
    res.status(400).json({ error: "Invalid Token" });
  }
};

export default verifyToken;
