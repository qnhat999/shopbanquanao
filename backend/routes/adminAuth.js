const express = require("express");
const router = express.Router();

/* LOGIN ADMIN */
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  // tài khoản admin cố định
  if (username === "admin" && password === "123456") {
    req.session.user = {
      username: "admin",
      role: "admin"
    };
    return res.json({ message: "Đăng nhập thành công" });
  }

  res.status(401).json({ message: "Sai tài khoản hoặc mật khẩu" });
});

/* LOGOUT */
router.post("/logout", (req, res) => {
  req.session.destroy();
  res.json({ message: "Đã đăng xuất" });
});

module.exports = router;
