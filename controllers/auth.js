const bcryptjs = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const sendgridtransport = require("nodemailer-sendgrid-transport");
const { validationResult } = require("express-validator/check");

const User = require("../models/user.js");
const keys = require("../apikeys");

const transporter = nodemailer.createTransport(
  sendgridtransport({
    auth: {
      api_key: keys.sendGrid,
    },
  })
);

exports.GetLogin = (req, res, next) => {
  res.render("auth/login.ejs", {
    pagetitle: "Login",
    loginmsg: null,
    email: null,
  });
};

exports.GetSignup = (req, res, next) => {
  res.render("auth/signup.ejs", {
    pagetitle: "Sign Up",
    username: null,
    email: null,
    key: null,
    key1: "",
    signupmsg: null,
    usernameError: null,
    emailError: null,
    keyError: null,
    key1Error: null,
  });
};

exports.PostLogin = (req, res, next) => {
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    errors = errors.array();
    let loginmsg = errors[0].msg;
    res.render("auth/login.ejs", {
      pagetitle: "Login",
      loginmsg: loginmsg,
      email: req.body.email,
    });
    return;
  }
  User.findOne({ email: req.body.email })
    .then((loggedin) => {
      req.session.userId = loggedin._id;
      req.session.name = loggedin.name;
      req.session.save((err) => {
        if (err) {
          console.log(err);
          res.redirect("/500");
        } else {
          res.redirect("/");
        }
      });
    })
    .catch((err) => {
      if (err) {
        console.log(err);
        res.redirect("/500");
      }
    });
};

exports.PostLogout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
      res.redirect("/500");
    } else {
      res.redirect("/");
    }
  });
};

exports.PostSignup = (req, res, next) => {
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    errors = errors.array();
    let i = 0,
      size = errors.length;
    let usernameError = "",
      emailError = "",
      keyError = "",
      key1Error = "";
    while (i < size) {
      if (errors[i].param === "username") {
        usernameError = errors[i].msg;
      } else if (errors[i].param === "email") {
        emailError = errors[i].msg;
      } else if (errors[i].param === "key") {
        keyError = errors[i].msg;
      } else if (errors[i].param === "key1") {
        key1Error = errors[i].msg;
      }
      i++;
    }
    res.render("auth/signup.ejs", {
      pagetitle: "Sign Up",
      username: req.body.username,
      email: req.body.email,
      key: req.body.key,
      key1: "",
      signupmsg: null,
      usernameError: usernameError,
      emailError: emailError,
      keyError: keyError,
      key1Error: key1Error,
    });
    return;
  }
  bcryptjs
    .hash(req.body.key, 9)
    .then((pass) => {
      const items = [];
      const user = new User({
        name: req.body.username,
        email: req.body.email,
        password: pass,
        cart: items,
      });
      return user.save();
    })
    .then(() => {
      transporter.sendMail({
        to: req.body.email,
        from: "pawan_11812061@nitkkr.ac.in",
        subject: "Succesful",
        html: "<h1>Great</h1>",
      });
      res.redirect("/login");
    })
    .catch((err) => {
      if (err) {
        console.log(err);
        res.redirect("/500");
      }
    });
};

exports.getresetpass = (req, res, next) => {
  res.render("auth/resetpass.ejs", {
    pagetitle: "Reset Password",
  });
};

exports.postresetpass = (req, res, next) => {
  const token = crypto.randomBytes(32).toString("hex");
  User.findOne({ email: req.body.email })
    .then((user) => {
      user.resetToken = token;
      user.resetTokenExpires = Date.now() + 36000000;
      return user.save();
    })
    .then(() => {
      transporter.sendMail({
        to: req.body.email,
        from: "pawan_11812061@nitkkr.ac.in",
        subject: "Password Reset Request",
        html: `
                <p>Follow this link <a href = "http://localhost:3000/resetpass/${token}">Reset Password</a></p>
            `,
      });
      res.redirect("/");
    })
    .catch((err) => {
      if (err) {
        console.log(err);
        res.redirect("/500");
      }
    });
};

exports.getnewpass = (req, res, next) => {
  const token = req.params.token;
  var newtoken;
  User.findOne({ resetToken: token, resetTokenExpires: { $gt: Date.now() } })
    .then((user) => {
      if (!user) {
        req.flash("loginmsg", "Link Expired !");
        res.redirect("/login");
      } else {
        newtoken = crypto.randomBytes(32).toString("hex");
        user.resetToken = newtoken;
        user.resetTokenExpires = Date.now() + 3200000;
        return user.save();
      }
    })
    .then(() => {
      if (newtoken) {
        res.render("auth/newpass.ejs", {
          pagetitle: "Recover Password",
          token: newtoken,
        });
      }
    })
    .catch((err) => {
      if (err) {
        console.log(err);
        res.redirect("/500");
      }
    });
};

exports.postnewpass = (req, res, next) => {
  const token = req.body.token;
  User.findOne({ resetToken: token, resetTokenExpires: { $gt: Date.now() } })
    .then((user) => {
      if (!user) {
        req.flash("loginmsg", "Link Expired !");
        res.redirect("/login");
      } else {
        if (req.body.key != req.body.key1) {
          res.render("auth/newpass.ejs", {
            pagetitle: "Recover Password",
            token: token,
          });
        } else {
          bcryptjs
            .hash(req.body.key, 9)
            .then((pass) => {
              user.password = pass;
              return user.save();
            })
            .catch((err) => {
              console.log(err);
              res.redirect("/500");
            });
        }
      }
    })
    .then(() => {
      req.flash("loginmsg", "Password Successfully Changed !");
      res.redirect("/login");
    })
    .catch((err) => {
      if (err) {
        console.log(err);
        res.redirect("/500");
      }
    });
};
