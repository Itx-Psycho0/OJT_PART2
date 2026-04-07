import jwt from "jsonwebtoken";
import config from "../config/config.js";
import User from "../models/User.js";

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

export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email is already in use" });
    }

    const displayName = `${firstName} ${lastName}`.trim();
    const user = await User.create({ email, displayName, passwordHash: password });
    
    const token = signToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      secure: config.nodeEnv === "production",
      sameSite: config.nodeEnv === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({ success: true, user: user.toPublicJSON() });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ success: false, message: "Internal server error during registration" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const user = await User.findOne({ email }).select("+passwordHash");
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const token = signToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      secure: config.nodeEnv === "production",
      sameSite: config.nodeEnv === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ success: true, user: user.toPublicJSON() });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Internal server error during login" });
  }
};
