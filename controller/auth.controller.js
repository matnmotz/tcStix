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
    res.render("auth/login", {navLinks});
}

handleLogin = (req,res) => {
    
    res.redirect("/user");
}

module.exports = {
    showLogin,
    handleLogin
}