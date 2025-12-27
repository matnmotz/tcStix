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
    if(!req.query.msg){
        res.render("auth/login", {navLinks, showTitle: true});
    }else{
        res.render("auth/login", {navLinks, showTitle: true, msg: req.query.msg});
    }
}

handleLogin = async(req,res) => {
    const {email, password} = req.body;
    const user = await getUserByEmail(email);
    if(user != undefined && await bcrypt.compare(password, user.password) && email == user.email){
        req.session.user = user;
        res.redirect("/user");
    }else{
        res.redirect("/auth/login?msg=E-Mail Adresse und/oder Passwort ist falsch!");
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