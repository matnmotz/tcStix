const express = require("express");
const path = require("path");
const hbs = require("hbs");

// ROUTER
const userRouter = require('./router/user.router');
const authRouter = require('./router/auth.router');
const legalRouter = require('./router/legal.router');

//CONTROLLER
const landingController = require("./controller/landing.controller");

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

hbs.registerHelper("json", function(context) {
  return JSON.stringify(context);
});
hbs.registerHelper("translateRole", function (role) {
  const translations = {
    president: "Obmann",
    treasurer: "Kassier",
    secretary: "Schriftführer",
    groundskeeper: "Platzwart",
    member: "Mitglied"
  };

  return translations[role] || role; // Fallback, falls nicht bekannt
});
hbs.registerHelper('not', function(value) {
  return !value;
});


app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));
hbs.registerPartials(path.join(__dirname, "views/partials"));


app.use(express.static(path.join(__dirname, "public")));

// PATHS
app.use("/user",userRouter);
app.use("/auth",authRouter);
app.use("/legal",legalRouter);

//Landing-page
app.get("/",landingController.showLandingPage);


app.listen(port, () => {
  console.log(`✅ Server läuft auf http://0.0.0.0:${port}`);
});
