// 
const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const { validateSignup } = require("../utils/validation");
const authRouter = express.Router();
const isProd = process.env.NODE_ENV === "production";
const cookieBase = {
  httpOnly: true,
  sameSite: isProd ? "None" : "Lax",
  secure: isProd,
  path: "/",
};

// Signup
authRouter.post("/signup", async (req, res) => {
  try {
    validateSignup(req);

    const { firstName, lastName, password } = req.body;
    const email = (req.body.email || "").toLowerCase().trim();

    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      email,
      password: passwordHash,
    });

    const savedUser = await user.save();
    const token = await savedUser.getJWT();

    res.cookie("token", token, {
      ...cookieBase,
      expires: new Date(Date.now() + 8 * 3600000),
    });

    res.json({ message: "User added successfully!", data: savedUser });
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});

// Login
authRouter.post("/login", async (req, res) => {
  try {
    const { password } = req.body;
    const email = (req.body.email || "").toLowerCase().trim();

    if (!email || !password) {
      return res.status(400).send("ERROR : Email and password are required");
    }

    const user = await User.findOne({ email });
    if (!user) throw new Error("Invalid credentials");

    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) throw new Error("Invalid credentials");

    const token = await user.getJWT();

    res.cookie("token", token, {
      ...cookieBase,
      expires: new Date(Date.now() + 8 * 3600000),
    });

    res.send({ user });
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});

// Logout
authRouter.post("/logout", async (req, res) => {
  res.cookie("token", null, {
    ...cookieBase,
    expires: new Date(Date.now()),
  });
  res.send("Logout successful!");
});

module.exports = authRouter;
