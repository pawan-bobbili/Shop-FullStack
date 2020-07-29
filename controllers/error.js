exports.get404page = (req,res,next) => {
    res.status(404).render('404.ejs',{pagetitle : "PageNotFound"}); // As app.use('views','views') is defined in app.js
};

exports.get500page = (req, res, next) => {
    res.status(500).render('500.ejs',{
        pagetitle: '500 Error !',
    });
}