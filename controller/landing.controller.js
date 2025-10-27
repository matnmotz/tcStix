const navLinks = [
    {
        href: "/auth/login",
        title: "ANMELDEN",
        active: false
    },
    {
        href: "/",
        title: "STARTSEITE",
        active: true
    },
]
showLandingPage = (req,res) => {
    res.render("index", {navLinks,showTitle: true});
}

module.exports = {
    showLandingPage
}