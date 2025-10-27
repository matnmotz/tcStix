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
router.get("/", userController.showDashboard);

router.get("/usermanagement", userController.showUserManagement);

router.get("/usermanagement/add", userController.showAddUser);
router.post("/usermanagement/add", userController.handleAddUser);

router.get("/usermanagement/edit/:id", userController.showEditUser);
router.post("/usermanagement/edit", userController.handleEditUser);

router.get("/usermanagement/delete/:id", userController.showDeleteUser);
router.post("/usermanagement/delete", userController.handleDeleteUser);
module.exports = router;