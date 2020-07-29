const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const session = require("express-session");
const MongoStore = require("connect-mongodb-session")(session); // Mongostore will now be a constructor function
const flash = require("connect-flash");
const csrf = require("csurf");
const multer = require("multer");
const cookieParser = require("cookie-parser"); //For the false website

const AdminRoutes = require("./routes/admin");
const ShopRoutes = require("./routes/shop");
const AuthRoutes = require("./routes/auth.js");
const ErrorController = require("./controllers/error.js");
const keys = require("./apikeys");

const mongoose = require("mongoose");

const app = express();
const store = new MongoStore({
  uri: keys.mongoURI,
  collection: "sessions",
});
const csrfProtection = csrf();
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "image"); // We should create the image folder on our own
  },
  filename: function (req, file, cb) {
    cb(
      null,
      req.session.userId.toString() +
        Date.now().toString() +
        file.mimetype.split("/")[1]
    ); // file.filename and file.destination are undefined. Req.body will have those attributes which are defined earlier then this image in form
  },
});
const filefilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const upload = multer({
  storage: storage,
  fileFilter: filefilter,
});

app.set("view-engine", "ejs");
app.set("views", "views");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "image")));
app.use(
  session({
    secret: keys.sessionSecret,
    saveUninitialized: false,
    resave: false,
    store: store,
  }) // creates req.session object.
); // refer captures    . Placed above multer(upload) to use req.session.userId (See in adminRoutes)
app.use(bodyParser.urlencoded({ extended: false })); // Need to be above of all those middlewares which uses data coming from pages. i.e csrfprotection as this middleware is used to create and validate tokens, but not needed to put above flash
app.use(cookieParser());
app.use(upload.single("image"));

app.use(flash()); // Put this only after creating session
//app.use(csrfProtection);                                                                         // Put this only after creating session, because secret is stored in session
app.use((req, res, next) => {
  //console.log(req.cookies);
  res.locals.logged = false;
  res.locals.csrfToken = null; // why explicitily defined null ?
  if (req.session && req.session.userId) {
    res.locals.logged = true;
    return csrfProtection(req, res, next); // Why return ?? Because Next should be called only once. Refer Captures . will create req.csrfToken
  }
  next();
});
app.use((req, res, next) => {
  if (req.session && req.session.userId) {
    res.locals.csrfToken = req.csrfToken();
  } else {
    res.locals.csrfToken = null;
  }
  next();
});
app.use("/admin", AdminRoutes);
app.use(ShopRoutes);
app.use(AuthRoutes);
app.use("/500", ErrorController.get500page);
app.use(ErrorController.get404page);
app.use((err, req, res, next) => {
  console.log(err);
  //res.redirect('/500');                                                this will create Infinite loop when error is above routes
  res.render("500.ejs", {
    pagetitle: "500 Error !",
  });
});
mongoose
  .connect(keys.mongoURI)
  .then(() => {
    console.log("Connected");
    app.listen(3000);
  })
  .catch((err) => console.log(err));
