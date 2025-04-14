// middlewares/adminMiddleware.js - Admin role check middleware

module.exports = (req, res, next) => {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Admin privileges required' });
    }
    next();
  };