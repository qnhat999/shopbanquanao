module.exports = (req, res, next) => {
  if (!req.session || !req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({ message: 'Không có quyền admin' });
  }
  next();
};
