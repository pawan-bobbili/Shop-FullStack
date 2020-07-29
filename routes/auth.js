const express = require("express");
const bcryptjs = require("bcryptjs");
const { body } = require("express-validator");

const AuthController = require("../controllers/auth.js");
const isAuth = require("../middlware/isauth.js");
const User = require("../models/user.js");
const { Promise } = require("mongoose");
const { stringify } = require("querystring");

const router = express.Router();

router.get("/login", AuthController.GetLogin);

router.get("/signup", AuthController.GetSignup);

router.get("/logout", isAuth, AuthController.PostLogout);

router.get("/resetpass", AuthController.getresetpass);

router.get("/resetpass/:token", AuthController.getnewpass);

router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .withMessage("Not a Valid Email !!")
      .bail()
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (!userDoc) {
            //throw new Error('No Account Found !');
            return Promise.reject("No Account Found !");
          } else {
            return bcryptjs
              .compare(req.body.password, userDoc.password)
              .then((match) => {
                if (!match) {
                  //throw new Error('Invalid Password !');
                  return Promise.reject("Invalid Password !");
                }
                return true;
              });
          }
        });
      }),
  ],
  AuthController.PostLogin
);

router.post(
  "/signup",
  [
    body("username")
      .isAlphanumeric()
      .withMessage("User name should contain only Letters and Numbers"),
    body("email")
      .isEmail()
      .withMessage("Invalid Email")
      .custom((value) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (!userDoc) {
            return true;
          }
          return Promise.reject("Email Already Exists !");
        });
      }),
    body("key")
      .isLength({ min: 5 })
      .withMessage("Password Should Have atleast 5 Characters"),
    body("key1").custom((value, { req }) => {
      if (value !== req.body.key) {
        throw new Error("Passwords Didn't Match ! ");
      }
      return true;
    }),
  ],
  AuthController.PostSignup
);

router.post("/resetpass", AuthController.postresetpass);

router.post("/newpass", AuthController.postnewpass);

module.exports = router;
