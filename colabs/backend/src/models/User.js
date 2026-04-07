import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    displayName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    googleAvatar: { type: String, default: null },
    uploadedAvatar: { type: String, default: null },
    googleId: { type: String, sparse: true, unique: true, default: null },
    passwordHash: { type: String, select: false, default: null },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.pre("save", async function (next) {
  if (!this.googleId && !this.passwordHash) {
    return next(new Error("User must have either Google auth or a password"));
  }

  if (this.isModified("passwordHash") && this.passwordHash) {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  }
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.passwordHash) return false;
  return await bcrypt.compare(candidatePassword, this.passwordHash);
};

userSchema.virtual("avatar").get(function () {
  return this.uploadedAvatar ?? this.googleAvatar ?? null;
});

userSchema.index({ googleId: 1 }, { sparse: true });

userSchema.statics.findOrCreateFromGoogle = async function ({
  googleId,
  email,
  displayName,
  googleAvatar,
}) {
  let user = await this.findOne({ googleId });
  if (user) {
    user.googleAvatar = googleAvatar;
    user.displayName = displayName;
    await user.save();
    return { user, linked: false };
  }

  user = await this.findOne({ email });
  if (user) {
    user.googleId = googleId;
    user.googleAvatar = googleAvatar;
    await user.save();
    return { user, linked: true };
  }

  user = await this.create({ googleId, email, displayName, googleAvatar });
  return { user, linked: false };
};

userSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    displayName: this.displayName,
    email: this.email,
    avatar: this.avatar,
    createdAt: this.createdAt,
  };
};

export default mongoose.model("User", userSchema);
