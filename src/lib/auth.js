module.exports = {
    isLoggedIn (req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        // return res.redirect('/ingreso');
        return res.status(500).send('redireccionar al ingreso ')
    }
};