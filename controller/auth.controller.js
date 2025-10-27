const {getUserByEmail} = require("../models/auth.model");
const bcrypt = require('bcrypt');
const navLinks = [
    {
        href: "/auth/login",
        title: "ANMELDEN",
        active: true
    },
    {
        href: "/",
        title: "STARTSEITE",
        active: false
    }
]

showLogin = (req,res) => {
    res.render("auth/login", {navLinks, showTitle: true});
}

handleLogin = async(req,res) => {
    const {email, password} = req.body;
    const user = await getUserByEmail(email);
    if(await bcrypt.compare(password, user.password) && email == user.email){
        req.session.user = user;
        console.log(req.session.user);
        res.redirect("/user");
    }else{
        res.redirect("/auth/login");
    }
}

showLogout = (req,res) =>{
    req.session.destroy(err => {
        if(err){
            console.log(err);
        }
    })
    res.redirect("/");
}

module.exports = {
    showLogin,
    handleLogin,
    showLogout
}