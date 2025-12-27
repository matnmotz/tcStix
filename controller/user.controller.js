const bcrypt = require('bcrypt');
const {createActivityWorkbook, createMembershipWorkbook} = require('../models/excel.model');
const {addUser, getUsers, getUsersUserIdAndName, getUser, updateUser, deleteUser,getBookingTypes, updateBookingType, addActivity, getActivitys, getActivity, updateActivity, getCourts, checkFreeCourt, checkUserAllowedBooking, addBooking, getBookings, allowedToDeleteBooking, deleteBooking, addChampionship, getChampionships, deleteChampionship, addClosure, getActiveClosure, updateClosure} = require('../models/user.model');

const navLinks_dashboard = [
    {
        href: "/user",
        title: "DASHBOARD",
        active: true
    },
    {
        href: "/user/courtmanagement",
        title: "TENNISPLATZ",
        active: false
    },
    {
        href: "/user/usermanagement",
        title: "BENUTZER",
        active: false
    },
    {
        href: "/auth/logout",
        title: "ABMELDEN",
        active: false
    },
]

const navLinks_userManagement = [
    {
        href: "/user",
        title: "DASHBOARD",
        active: false
    },
    {
        href: "/user/courtmanagement",
        title: "TENNISPLATZ",
        active: false
    },
    {
        href: "/user/usermanagement",
        title: "BENUTZER",
        active: true
    },
    {
        href: "/auth/logout",
        title: "ABMELDEN",
        active: false
    },
]

const navLinks_courtManagement = [
    {
        href: "/user",
        title: "DASHBOARD",
        active: false
    },
    {
        href: "/user/courtmanagement",
        title: "TENNISPLATZ",
        active: true
    },
    {
        href: "/user/usermanagement",
        title: "BENUTZER",
        active: false
    },
    {
        href: "/auth/logout",
        title: "ABMELDEN",
        active: false
    },
]

const navLinks_booking = [
    {
        href: "/user",
        title: "DASHBOARD",
        active: false
    },
    {
        href: "/user/courtmanagement",
        title: "TENNISPLATZ",
        active: false
    },
    {
        href: "/user/usermanagement",
        title: "BENUTZER",
        active: false
    },
    {
        href: "/auth/logout",
        title: "ABMELDEN",
        active: false
    },
]

// DASHBOARD

showDashboard = async(req,res) => {
    const bookings = await getBookings(req.session.user.userID);
    const championship = await getChampionships();
    const bookingTypes = await getBookingTypes();
    const closure = await getActiveClosure();
    let bColor = '#000000';
    let chColor = '#000000';
    let clColor = '#000000';
    for(let i = 0; i < bookingTypes.length; i++){
        switch(bookingTypes[i].title){
            case 'reservation':
                bColor = bookingTypes[i].hexCode;
                break
            case 'championship':
                chColor = bookingTypes[i].hexCode;
                break
            case 'closed':
                clColor = bookingTypes[i].hexCode;
                break
        }
    }
    if(req.query.succ){
        res.render("user/dashboard",{navLinks: navLinks_dashboard, bookings, championship, bColor, chColor, clColor, closure, succ: req.query.succ})
    }else if(req.query.err){
        res.render("user/dashboard",{navLinks: navLinks_dashboard, bookings, championship, bColor, chColor, clColor, closure, err: req.query.err})
    }else{
        res.render("user/dashboard",{navLinks: navLinks_dashboard, bookings, championship, bColor, chColor, clColor, closure });
    }
}

// USER MANAGEMENT

showUserManagement = async (req,res) => {
    const user = await getUsers();
    res.render("user/usermanagement", {user,navLinks: navLinks_userManagement});
}

showAddUser = (req,res) => {
    if(req.query.msg){
        res.render("user/addUser", {msg: req.query.msg, headline: 'Neuen Benutzer erstellen', btnTxt: 'Benutzer hinzufügen', action: '/user/usermanagement/add', navLinks: navLinks_userManagement});
    }else{
        res.render("user/addUser", {headline: 'Neuen Benutzer erstellen', btnTxt: 'Benutzer hinzufügen', action: '/user/usermanagement/add', navLinks: navLinks_userManagement});
    }
}

handleAddUser = async(req,res) => {
    const {gender, role, firstname, lastname, email, password, street, houseNumber, zip, city} = req.body;
    if(firstname.trim() != "" && lastname.trim() != "" && email.trim() != "" && password != "" && street != "" && houseNumber != "" && zip != "" && city != ""){
        const pwdHash = await bcrypt.hash(password,10);
        const data = {
            gender: gender,
            role: role,
            firstname: firstname,
            lastname: lastname,
            email: email,
            password: pwdHash,
            street: street,
            houseNumber: houseNumber,
            zip: zip,
            city: city
        }
        await addUser(data);
        res.redirect("/user/usermanagement");
    }else{
        res.redirect("/user/usermanagement/add?msg=Füllen Sie die Daten bitte vollständig aus!");
    }

}

showEditUser = async(req,res) => {
    const userID = req.params.id;
    const user = await getUser(userID);
    
    if(req.query.msg){
        res.render("user/addUser", {msg: req.query.msg, headline: "Benutzer bearbeiten", isEdit: true, user, btnTxt: 'Speichern', action: '/user/usermanagement/edit', navLinks: navLinks_userManagement});
    }else{
        res.render("user/addUser", {headline: "Benutzer bearbeiten", isEdit: true, user, btnTxt: 'Speichern', action: '/user/usermanagement/edit', navLinks: navLinks_userManagement});
    }
}

handleEditUser = async(req,res) => {
    try{
        const {userID, gender, role, firstname, lastname, email, street, houseNumber, zip, city} = req.body;
        if(userID.trim() != "" && gender.trim() != "" && role.trim() != "" && firstname.trim() != "" && lastname.trim() != "" && email.trim() != "" && street.trim() != "" && houseNumber.trim() != "" && zip.trim() != "" && city.trim() != ""){
            const data = {
                userID: userID,
                gender: gender,
                role: role,
                firstname: firstname,
                lastname: lastname,
                email: email,
                street: street,
                houseNumber: houseNumber,
                zip: zip,
                city: city
            }
            await updateUser(data);
            res.redirect("/user/usermanagement");
        }else{
            res.redirect("/user/usermanagement/edit/"+userID+"?msg=Füllen Sie die Daten bitte vollständig aus!");
        }
    }catch(err){
        console.log(err);
    }
}

showDeleteUser = async(req,res) => {
    const id = req.params.id;
    const user = await getUser(id);
    res.render("user/deleteUser", {user, navLinks_userManagement});
}

handleDeleteUser = async(req,res) => {
    const {userID} = req.body;
    await deleteUser(userID);
    res.redirect("/user/usermanagement");
}

// COURT MANAGEMENT

showCourtManagement = async(req,res) => {
    const bookingTypes = await getBookingTypes();
    const activitys = await getActivitys();
    res.render("user/courtmanagement", {navLinks: navLinks_courtManagement, bookingTypes, activitys});
}

handleChangeBookingType = async(req,res) => {
    const translation = {
        Reservierung: "reservation",
        Meisterschaft: "championship",
        Gesperrt: "closed"
    }
    const {hexCode, title} = req.body;
    if(hexCode.startsWith('#') && (hexCode.length >= 4 && hexCode.length <= 7)){
        const data = {
            title: translation[title],
            hexCode: hexCode
        }
        await updateBookingType(data);
        res.redirect("/user/courtmanagement");
    }else{
        res.redirect("/user/courtmanagement?msg=Bitte geben Sie einen gültigen HEX-Code ein!");
    }
}

showActivity = async(req,res) => {
    const user = await getUsers();
    if(req.params.id){
        const activity = await getActivity(req.params.id);
        res.render("user/addActivity", {navLinks: navLinks_courtManagement, user, activity});
    }else{
        res.render("user/addActivity", {navLinks: navLinks_courtManagement, user});
    }
}

handleAddActivity = async(req,res) => {
    const {title, time, date, users, activityID} = req.body;
    let txt = users.split(";");
    let list = [];
    for(let i = 0; i < txt.length; i++){
        list.push(txt[i]);
    }
    console.log(activityID);
    if(activityID.trim() != "" && activityID != undefined){
        const data = {
            activityID: activityID,
            title: title,
            time: time,
            date: date,
            users: list
        }
        await updateActivity(data);
    }else{ 
        const data = {
            title: title,
            time: time,
            date: date,
            users: list
        }
        await addActivity(data);
    }
    res.redirect("/user/courtmanagement");
}

showActivityDownload = async(req,res) => {
    const year = req.params.year;
    const workbook = await createActivityWorkbook(year,7);
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
        'Content-Disposition',
        `attachment; filename="Aktivitäten_${year}.xlsx"`
    );
    await workbook.xlsx.write(res);
    res.end();
}

showMembershipDownload = async(req,res) => {
    const year = req.params.year;
    const workbook = await createMembershipWorkbook(year, 7, 105, 15);
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
        'Content-Disposition',
        `attachment; filename="Mitgliedsbeitrag_${year}.xlsx"`
    );
    await workbook.xlsx.write(res);
    res.end();
}

// BOOKING MANAGEMENT

showBooking = async(req,res) => {
    const users = await getUsersUserIdAndName();
    const courts = await getCourts();
    res.render("user/booking", {navLinks: navLinks_booking, users, courts});
}

handleBooking = async(req,res) => {
    const {date,from,to,court,partner} = req.body;
    if(date != null && date != ''){
        const data = {
            date,
            from,
            to,
            court,
            partner,
            booking_type: 'reservation'
        }
        res.redirect(await validateBooking(data, req.session.user.role, req.session.user.userID));
    }else{
        res.redirect("/user?err=Bitte gültiges Datum auswählen!");
    }
}

handleDeleteBooking = async(req,res) => {
    const bookingID = req.body.bookingID;
    if(await allowedToDeleteBooking(req.session.user.userID, bookingID) || req.session.role == 'admin'){
        await deleteBooking(bookingID);
        res.redirect("/user?succ=Buchung erfolgreich gelöscht!");
    }else{
        res.redirect("/user?err=Nicht berechtigt diese Buchung zu löschen!");
    }
}

handleChampionship = async(req,res) => {
    if(req.session.user != null && req.session.user.role == 'admin'){
        const {opponent, champDate, champFrom, champTo} = req.body;
        if(champDate != null && champDate != ""){
            await addChampionship(opponent, champDate, champFrom, champTo, req.session.user.userID);
            res.redirect("/user?succ=Meisterschaftstermin erfolgreich hinzugefügt!");
        }else{
            res.redirect("/user?err=Bitte gültiges Datum auswählen!");
        }
    }else{
        res.redirect("/user?err=Zugriff verweigert!");
    }
    
}

handleDeleteChampionship = async(req,res) => {
    const formatDateToISO = (dateStr) => {
        const [day, month, year] = dateStr.split(".");
        return `${year}-${month}-${day}`;
    }

    if(req.session.user != null && req.session.user.role == 'admin'){
        const {date} = req.body;
        await deleteChampionship(formatDateToISO(date));
        res.redirect("/user?succ=Meisterschaftstermin entfernt!");
    }else{
        res.redirect("/user?err=Zugriff verweigert!");
    }
}

handleClosure = async(req,res) => {
    const {from,to,court} = req.body;
    if((from != null && from != "") && (to != null && to != "")){
        if(from < to){
            await addClosure(from,to,court,req.session.user.userID);
            res.redirect("/user?succ=Sperrung erfolgreich eingetragen!");
        }else{
            res.redirect("/user?err=Bitte wählen Sie mögliche Zeiten!");
        }
    }else{
        res.redirect("/user?err=Bitte gültiges Datum ein!");
    }
}

handleClosureUpdate = async(req,res) => {
    const {enddate, noteID} = req.body;
    if(enddate != "" && enddate != null){
        await updateClosure(noteID, enddate, req.session.user.userID);
        res.redirect("/user?succ=Sperrung erfolgreich aktualisiert!");
    }else{
        res.redirect("/user?err=Bitte wählen Sie ein gültiges Datum!");
    }
}




//private methods
validateBooking = async(data, role, userID) => {
    const freeCourt = await checkFreeCourt(data);
    const allowed = await checkUserAllowedBooking(data, role, userID);
    if(freeCourt && allowed){
        //Platz frei & Stunden frei => Buchung einfügen
        await addBooking(data,userID);
        return "/user?succ=Reservierung erfolgreich!";
    }else if(!freeCourt && allowed){
        //Platz zu dieser Zeit belegt
        return "/user?err=Platz ist zu dieser Zeit belegt!";
    }else if(freeCourt && !allowed){
        //Platz frei, alle Stunden aufgebraucht
        return "/user?err=Ihnen stehen diese Woche keine Stunden mehr zur Verfügung!";
    }else{
        //Platz nicht frei und alle Stunden verbraucht
        return "/user?err=Platz ist zu dieser Zeit belegt & Ihnen stehen diese Woche keine Stunden mehr zur Verfügung!";
    }
}



module.exports = {
    showDashboard,
    showUserManagement,
    showAddUser,
    handleAddUser,
    showEditUser,
    handleEditUser,
    showDeleteUser,
    handleDeleteUser,
    showCourtManagement,
    handleChangeBookingType,
    showActivity,
    handleAddActivity,
    showActivityDownload,
    showMembershipDownload,
    showBooking,
    handleBooking,
    handleDeleteBooking,
    handleChampionship,
    handleDeleteChampionship,
    handleClosure,
    handleClosureUpdate
}
