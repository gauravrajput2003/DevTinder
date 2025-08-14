const express = require("express");
const authRouter = express.Router();

const { validateSignup } = require("../utils/validation");
const User = require("../models/user");
const bcrypt = require("bcrypt");

const isProd = process.env.NODE_ENV === 'production';
const cookieBase = {
  httpOnly: true,
  sameSite: isProd ? 'None' : 'Lax',
  secure: isProd,
  path: '/',
};

authRouter.post("/signup", async (req, res) => {
  try {
    // Validation of data
    validateSignup(req);

    const { firstName, lastName, password } = req.body;
    const email = (req.body.email || "").toLowerCase().trim();

    // Encrypt the password
    const passwordHash = await bcrypt.hash(password, 10);
    console.log(passwordHash);

    //   Creating a new instance of the User model
    const user = new User({
      firstName,
      lastName,
      email,
      password: passwordHash,
    });

    const savedUser = await user.save();
    const token = await savedUser.getJWT();

    res.cookie("token", token, { ...cookieBase, expires: new Date(Date.now() + 8 * 3600000) });

    res.json({ message: "User Added successfully!", data: savedUser });
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { password } = req.body;
    const email = (req.body.email || "").toLowerCase().trim();

    if (!email || !password) {
      return res.status(400).send("ERROR : Email and password are required");
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("Invalid credentials");
    }
    const isPasswordValid = await user.validatePassword(password);

    if (isPasswordValid) {
      const token = await user.getJWT();

      res.cookie("token", token, { ...cookieBase, expires: new Date(Date.now() + 8 * 3600000) });
      res.send({ user });
    } else {
      throw new Error("Invalid credentials");
    }
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});

authRouter.post("/logout", async (req, res) => {
  res.cookie("token", null, { ...cookieBase, expires: new Date(Date.now()) });
  res.send("Logout Successful!!");
});

module.exports = authRouter;