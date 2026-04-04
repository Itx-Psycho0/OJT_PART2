import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as JwtStrategy } from "passport-jwt";
import config from "./config.js";
import User from "../models/User.js";

const cookieExtractor = (req) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies.token;
  }
  return token;
};

passport.use(
  new GoogleStrategy(
    {
      clientID: config.google.clientId,
      clientSecret: config.google.clientSecret,
      callbackURL: config.google.callbackUrl,
      scope: ["profile", "email"],
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const googleAvatar = profile.photos?.[0]?.value ?? null;

        if (!email) {
          return done(new Error("Google account has no email address"), null);
        }

        const { user } = await User.findOrCreateFromGoogle({
          googleId: profile.id,
          email,
          displayName: profile.displayName,
          googleAvatar,
        });

        return done(null, user);
      } catch (err) {
        if (err.code === 11000) {
          return done(
            new Error("An account with this email already exists"),
            null
          );
        }
        return done(err, null);
      }
    }
  )
);

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: cookieExtractor,
      secretOrKey: config.jwtSecret,
      algorithms: ["HS256"],
    },
    async (payload, done) => {
      try {
        const user = await User.findById(payload.sub).select("-passwordHash");
        if (!user || !user.isActive) return done(null, false);
        return done(null, user);
      } catch (err) {
        return done(err, false);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export default passport;