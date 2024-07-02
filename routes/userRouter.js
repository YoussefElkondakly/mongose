const express = require("express");

const authController = require("./../controllers/authController");
const userController = require("./../controllers/userController");
const router = express.Router();

router.post("/signUp", authController.signUp);
router.post("/login", authController.login);
router.get("/logout", authController.logout);
router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);

router.use(authController.protect)

router.get(
  "/user",
 
  userController.getMe,
  userController.getUser
);
router.patch(
  "/updatePassword",
 
  authController.updatePassword
);
router.patch("/updateMe", userController.updateMe);

router.delete("/deleteMe", userController.deleteMe);
router.get("/:id", userController.getUser);
 
router.get("",authController.restrictTo("admin", "lead-guide"), userController.getAllusers);

module.exports = router;
