
showImprint = (req,res) =>{
    res.render("legal/imprint.hbs");
}
showDGSVO = (req,res) =>{
    res.render("legal/privacy.hbs");
}

module.exports = {
    showImprint,
    showDGSVO
}