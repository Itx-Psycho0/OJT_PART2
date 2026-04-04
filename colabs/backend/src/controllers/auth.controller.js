import jwt from "jsonwebtoken";
import config from "../config/config.js";

function signToken(user) {
  return jwt.sign({ sub: user._id }, config.jwtSecret, { expiresIn: "7d" });
}

export const googleCallback = (req, res) => {
  const token = signToken(req.user);

  res.cookie("token", token, {
    httpOnly: true,
    secure: config.nodeEnv === "production",
    sameSite: config.nodeEnv === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.redirect(config.clientUrl);
};

export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: config.nodeEnv === "production",
    sameSite: config.nodeEnv === "production" ? "none" : "lax",
  });

  req.logout((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Logout failed" });
    }
    res.json({ success: true, message: "Logged out successfully" });
  });
};

export const getMe = (req, res) => {
  res.json({ success: true, user: req.user.toPublicJSON() });
};
