module.exports = (req, res, next) => {
    if(!req.session || !req.session.userId){
        res.render('auth/login.ejs',{
            pagetitle: 'Login',
            loginmsg : 'Get Authorization First',
            email    :  null,
        });
    }
    else{
        next();
    }
}