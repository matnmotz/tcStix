const bcrypt = require('bcrypt');
const {createActivityWorkbook, createMembershipWorkbook} = require('../models/excel.model');
const {addUser, getUsers, getUser, updateUser, deleteUser,getBookingTypes, updateBookingType, addActivity, getActivitys, getActivity, updateActivity} = require('../models/user.model');

const navLinks_dashboard = [
    {
        href: "/user",
        title: "DASHBOARD",
        active: true
    },
    {
        href: "/user/usermanagement",
        title: "BENUTZERVERWALTUNG",
        active: false
    },
    {
        href: "/user/courtmanagement",
        title: "TENNISPLATZ",
        active: false
    },
    {
        href: "/user/usermanagement",
        title: "BUCHUNGEN",
        active: false
    },
    {
        href: "/auth/logout",
        title: "LOGOUT",
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
        href: "/user/usermanagement",
        title: "BENUTZERVERWALTUNG",
        active: true
    },
    {
        href: "/user/courtmanagement",
        title: "TENNISPLATZ",
        active: false
    },
    {
        href: "/user/usermanagement",
        title: "BUCHUNGEN",
        active: false
    },
    {
        href: "/auth/logout",
        title: "LOGOUT",
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
        href: "/user/usermanagement",
        title: "BENUTZERVERWALTUNG",
        active: false
    },
    {
        href: "/user/courtmanagement",
        title: "TENNISPLATZ",
        active: true
    },
    {
        href: "/user/usermanagement",
        title: "BUCHUNGEN",
        active: false
    },
    {
        href: "/auth/logout",
        title: "LOGOUT",
        active: false
    },
]

showDashboard = (req,res) => {
    res.render("user/dashboard",{navLinks: navLinks_dashboard});
}

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
    showMembershipDownload
}