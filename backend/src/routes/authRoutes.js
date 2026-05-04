const express = require("express");

const {
  getCurrentUser,
  login,
  logout,
  register,
} = require("../controllers/authController");
const { authenticate } = require("../middlewares/authMiddleware");
const validateRequest = require("../middlewares/validateRequest");
const { loginValidation, registerValidation } = require("../validations/authValidations");

const router = express.Router();

router.post("/register", registerValidation, validateRequest, register);
router.post("/login", loginValidation, validateRequest, login);
router.post("/logout", authenticate, logout);
router.get("/me", authenticate, getCurrentUser);

module.exports = router;
