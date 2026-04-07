import express from "express";
import passport from "passport";
import config from "../config/config.js";
import { googleCallback, logout, getMe, register, login } from "../controllers/auth.controller.js";

const router = express.Router();

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${config.clientUrl}/login`,
  }),
  googleCallback
);

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

router.get(
  "/me",
  passport.authenticate("jwt", { session: false }),
  getMe
);

export default router;