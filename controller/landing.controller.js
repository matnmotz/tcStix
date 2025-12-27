const {getBookingTypes, getAllBookingsBetween} = require('../models/user.model');
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
showLandingPage = async(req,res) => {
    const bookingTypes = await getBookingTypes();
    const bookingsForTable = await getAllBookingsBetween(getWeekRange().monday, getWeekRange().sunday);
    res.render("index", {navLinks,showTitle: true, bookingTypes, bookingsForTable});
}

//private function
getWeekRange = () => {
  const today = new Date();

  const monday = new Date(today);
  const day = monday.getDay();

  const diffToMonday = day === 0 ? -6 : 1 - day;
  monday.setDate(monday.getDate() + diffToMonday);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 20);

  return {
    monday: formatSQLDate(monday),
    sunday: formatSQLDate(sunday)
  };
}

module.exports = {
    showLandingPage
}