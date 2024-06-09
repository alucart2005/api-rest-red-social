const { Schema, model } = require("mongoose");

const UserSchema = Schema({
  name: {
    type: String,
    require: true,
  },
  surname: String,
  nick: {
    type: String,
    //require: true,
  },
  email: {
    type: String,
    require: true,
  },
  password: {
    type: String,
    require: true,
  },
  role: {
    type: String,
    default: "role_user",
  },
  image: {
    type: String,
    default: "default.png",
  },
  create_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = model("User", UserSchema, "users");

/*  VERSION 2
const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  name: {
    type: String,
    required: true, // Use required for clarity
    trim: true, // Remove leading/trailing whitespace
  },
  surname: {
    type: String,
    trim: true,
  },
  nick: {
    type: String,
    required: true,
    trim: true,
    unique: true, // Enforce unique usernames
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true, // Ensure unique emails for user identification
  },
  role: {
    type: String,
    enum: ["role_user", "role_admin", "role_moderator"], // Define available roles
    default: "role_user",
  },
  image: {
    type: String,
    default: "default.png",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Add indexes for frequently queried fields (name, email, nick)
userSchema.index({ name: 1 });
userSchema.index({ email: 1 }, { unique: true }); // Unique email index for faster searches
userSchema.index({ nick: 1 }, { unique: true }); // Unique nick index for faster searches

module.exports = model("User", userSchema, "users");
*/
