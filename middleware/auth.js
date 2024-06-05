// middleware/auth.js
import jwt from 'jsonwebtoken';
const JWT_SECRET = 'tasktec'; 

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    try {
      const user = jwt.verify(token, JWT_SECRET);
      req.user = user;
    } catch (err) {
      console.error(err);
    }
  }
  next();
};
