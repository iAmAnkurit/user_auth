const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const path = require("path");
const userModel = require("./models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/create", (req, res) => {
  const { username, email, password, age } = req.body;

  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, async (err, hash) => {
      let createduser = await userModel.create({
        username,
        email,
        password: hash,
        age,
      });
      let token = jwt.sign({ email: email }, "ankurit");
      res.cookie("token", token);

      res.send(createduser);
    });
  });
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  let user = await userModel.findOne({ email: req.body.email });
  if (!user) {
    res.send("something went wrong");
  } else {
    bcrypt.compare(req.body.password, user.password, (err, result) => {
      if (result === true) {
        let token = jwt.sign({ email: user.email }, "ankurit");
        console.log(token);
        res.cookie("token", token);
        res.send(user.username);
      } else {
        res.send("Something went wrong");
      }
    });
  }
});

app.get("/logout", (req, res) => {
  res.cookie("token", "");
  res.redirect("/");
});

app.listen(3000);
