const Product = require("../models/product.js");
const { validationResult } = require("express-validator");

exports.getAddProduct = (req, res, next) => {
  let titleError = req.flash("titleError");
  if (titleError.length) {
    titleError = titleError[0];
  } else {
    titleError = null;
  }
  let priceError = req.flash("priceError");
  if (priceError.length) {
    priceError = priceError[0];
  } else {
    priceError = null;
  }
  let dscError = req.flash("dscError");
  if (dscError.length) {
    dscError = dscError[0];
  } else {
    dscError = null;
  }
  res.render("admin/add-product.ejs", {
    pagetitle: "Add Product",
    title: "Title of The Book",
    price: 0,
    id: null,
    dsc: "Description Of The Book",
    titleError: titleError,
    priceError: priceError,
    dscError: dscError,
  });
};

exports.getEditProduct = (req, res, next) => {
  let titleError = req.flash("titleError");
  if (titleError.length) {
    titleError = titleError[0];
  } else {
    titleError = null;
  }
  let priceError = req.flash("priceError");
  if (priceError.length) {
    priceError = priceError[0];
  } else {
    priceError = null;
  }
  let dscError = req.flash("dscError");
  if (dscError.length) {
    dscError = dscError[0];
  } else {
    dscError = null;
  }
  const prodId = req.params.productid;
  Product.findById(prodId)
    .then((product) => {
      if (
        req.session &&
        req.session.userId &&
        product.userId.toString() == req.session.userId.toString()
      ) {
        res.render("admin/add-product.ejs", {
          pagetitle: "Edit Product",
          title: product.title,
          id: product._id,
          price: product.price,
          dsc: product.dsc,
          titleError: titleError,
          priceError: priceError,
          dscError: dscError,
        });
      } else {
        req.flash("loginmsg", "Get Authorization First");
        res.redirect("/");
      }
    })
    .catch((err) => {
      if (err) {
        console.log(err);
        res.redirect("/500");
      }
    });
};

exports.postAddproduct = (req, res, next) => {
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    errors = errors.array();
    let i = 0,
      size = errors.length;
    while (i < size) {
      req.flash(errors[i].param + "Error", errors[i].msg);
      i++;
    }
    res.redirect("/admin/add-product");
  }
  const prodId = req.body.id;

  if (prodId) {
    Product.findById(prodId)
      .then((product) => {
        // Mongoose will automatically convert string type of prodId to Object Id type while searching
        if (!product) {
          const newProduct = new Product({
            title: req.body.title,
            price: req.body.price,
            dsc: req.body.dsc,
            userId: req.session.userId, // Mongoose will automatically convert
            imgUrl: req.file.filename,
          });
          return newProduct.save();
        } else {
          product.title = req.body.title;
          product.price = req.body.price;
          product.dsc = req.body.dsc;
          return product.save(); // this method overwrites if another product with same _id is present. So, suitable for editing
        }
      })
      .then(() => {
        res.redirect("/");
      })
      .catch((err) => {
        if (err) {
          console.log(err);
          res.redirect("/500");
        }
      });
  } else {
    const newProduct = new Product({
      title: req.body.title,
      price: req.body.price,
      dsc: req.body.dsc,
      userId: req.session.userId,
      imgUrl: req.file.filename,
    });
    newProduct
      .save()
      .then(() => {
        res.redirect("/");
      })
      .catch((err) => {
        if (err) {
          console.log(err);
          res.redirect("/500");
        }
      });
  }
};

exports.deletefromid = (req, res, next) => {
  const prodId = req.params.productid;
  Product.findById(prodId)
    .then((product) => {
      // product is a mongoose object, i.e having all functionalities
      if (product.userId.toString() == req.session.userId.toString()) {
        // Why not working without .toString?? , Because Objects cant be compared .. always gives false          // Both are already of Object Id type
        product.remove().then(() => {
          res.redirect("/admin/products");
        });
      } else {
        // Function execution doesn't stop even after sending response.
        req.flash("loginmsg", "Get Authorization !");
        res.redirect("/login");
      }
    })
    .catch((err) => {
      if (err) {
        console.log(err);
        res.redirect("/500");
      }
    });
};

exports.displayproducts = (req, res, next) => {
  Product.find({ userId: req.session.userId })
    .then((products) => {
      res.render("admin/product_list(admin).ejs", {
        pagetitle: "Admin Products",
        products: products,
      });
    })
    .catch((err) => {
      if (err) {
        console.log(err);
        res.redirect("/500");
      }
    });
};
