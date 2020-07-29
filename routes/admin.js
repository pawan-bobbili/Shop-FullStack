const express = require("express");
const { body } = require("express-validator");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "image");
  },
  filename: function (req, file, cb) {
    cb(null, req.session.userId.toString() + Date.now().toString() + ".jpg");
  },
});
const upload = multer({
  storage: storage,
});

const Admincontroller = require("../controllers/admin.js");
const isAuth = require("../middlware/isauth.js");

const router = express.Router();

router.get("/add-product", isAuth, Admincontroller.getAddProduct);

router.get("/products", isAuth, Admincontroller.displayproducts);

router.post(
  "/product",
  isAuth,
  [
    body("title").trim().isString().isLength({ min: 5 }),
    body("price")
      .isFloat()
      .withMessage("Price should be a valid Number")
      .toFloat(),
    body("dsc")
      .trim()
      .isLength({ min: 3 })
      .withMessage("Describe more about your Product !"),
  ],
  Admincontroller.postAddproduct
);

router.post("/edit/:productid", isAuth, Admincontroller.getEditProduct);

router.post("/delete/:productid", isAuth, Admincontroller.deletefromid);

module.exports = router;
