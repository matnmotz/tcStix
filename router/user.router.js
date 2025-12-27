const express = require("express");
const router = express.Router();
const userController = require("../controller/user.controller");

const navLinks = [
    {
        href: "/auth/login",
        title: "ANMELDEN",
        active: true
    }
]

// DASHBOARD

router.get("/", userController.showDashboard);

// USER MANAGEMENT

router.get("/usermanagement", userController.showUserManagement);

router.get("/usermanagement/add", userController.showAddUser);
router.post("/usermanagement/add", userController.handleAddUser);

router.get("/usermanagement/edit/:id", userController.showEditUser);
router.post("/usermanagement/edit", userController.handleEditUser);

router.get("/usermanagement/delete/:id", userController.showDeleteUser);
router.post("/usermanagement/delete", userController.handleDeleteUser);

// COURT MANAGEMENT

router.get("/courtmanagement", userController.showCourtManagement);

router.post("/courtmanagement/bookingtype", userController.handleChangeBookingType)

router.get("/courtmanagement/activity/:id", userController.showActivity);
router.get("/courtmanagement/activity", userController.showActivity);
router.post("/courtmanagement/activity", userController.handleAddActivity);

router.get("/courtmanagement/download-activitys/:year", userController.showActivityDownload);
router.get("/courtmanagement/download-membership/:year", userController.showMembershipDownload);

//BOOKING MANAGEMENT

router.get("/booking", userController.showBooking);
router.post("/booking", userController.handleBooking);

router.post("/booking/delete", userController.handleDeleteBooking);

router.post("/championship", userController.handleChampionship);
router.post("/championship/delete", userController.handleDeleteChampionship);

router.post("/closure", userController.handleClosure);
router.post("/closure/update", userController.handleClosureUpdate);

module.exports = router;