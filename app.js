const express = require("express");
const path = require("path");
const hbs = require("hbs");
const session = require('express-session');

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
    admin: "Admin",
    groundskeeper: "Platzwart",
    member: "Mitglied"
  };

  return translations[role] || role;
});
hbs.registerHelper("translateBookingType", function (bookingType) {
  const translations = {
    reservation: "Reservierung",
    championship: "Meisterschaft",
    closed: "Gesperrt"
  };

  return translations[bookingType] || bookingType;
});
hbs.registerHelper('not', function(value) {
  return !value;
});
hbs.registerHelper('formatDate', function(date) {
  date = new Date(date);
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0"); // +1 für korrekten Monat
  const yy = date.getFullYear();
  return `${dd}.${mm}.${yy}`;
});
hbs.registerHelper("weekdayName", function (day) {
    const days = [
        "Sonntag",
        "Montag",
        "Dienstag",
        "Mittwoch",
        "Donnerstag",
        "Freitag",
        "Samstag"
    ];
    return days[day];
});


app.use(session({
  secret: "aZ83nXf2QW7rGpM1yT0uVc9bDjHsL4", // sollte lang und sicher sein!
  resave: false,                   // Session nicht jedes Mal speichern, wenn nichts geändert wurde
  saveUninitialized: false,        // keine leeren Sessions speichern
  cookie: {
    maxAge: 1000 * 60 * 60,        // 1 Stunde gültig
    secure: false                  // true, wenn HTTPS aktiv ist
  }
}));

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

const {appendToLogs} = require("./models/error.model");
app.get("/test",(req,res) =>{
  appendToLogs('TEST');
  res.end();
});


app.listen(port, () => {
  console.log(`✅ Server läuft auf http://0.0.0.0:${port}`);
});
