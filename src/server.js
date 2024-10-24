const express = require("express");
const path = require("path");
const app = express();
const session = require("express-session");
const PORT = 3000;
const connectToMongo = require("./db");
const User = require("./UserSchema");
const bcrypt = require("bcrypt");
require("dotenv").config();
connectToMongo();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "views"));

app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/login", (req, res) => {
  res.render("login.ejs", { error: req.session.errorMessage || "" });
  req.session.errorMessage = "";
});

app.get("/register", (req, res) => {
  res.render("register.ejs", { error: req.session.errorMessage || "" });
  req.session.errorMessage = "";
});

app.get("/dashboard", (req, res) => {
  if (!req.session.username) {
    return res.redirect("/login");
  }
  res.render("dashboard.ejs", { user: req.session.username });
});

app.post("/login", async (req, res) => {
  const { username: inputUsername, password } = req.body;
  const user = await User.findOne({ username: inputUsername });
  if (!user) {
    req.session.errorMessage = "User not found";
    return res.redirect("/login");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (isPasswordValid) {
    req.session.username = inputUsername;
    return res.redirect("/dashboard");
  } else {
    req.session.errorMessage = "Incorrect password";
    return res.redirect("/login");
  }
});

app.post("/register", async (req, res) => {
  const { username: newUsername, password } = req.body;
  const existingUser = await User.findOne({ username: newUsername });
  if (existingUser) {
    req.session.errorMessage = "Username already exists";
    return res.redirect("/register");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({
    username: newUsername,
    password: hashedPassword,
  });

  await user.save();
  res.redirect("/login");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
