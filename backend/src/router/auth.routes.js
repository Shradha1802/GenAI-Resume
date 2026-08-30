const express = require("express");
const AuthController = require("../controllers/auth.controller")
const authRoute = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");

/**
 * @route POST /api/auth/register
 * @description Register a new user
 * @access Public
 */

authRoute.post("/register", AuthController.registerUserController);

/**
 * @route POST /api/auth/login
 * @description login user with email and password
 * @access Public
 */

authRoute.post("/login", AuthController.loginUserController);

/**
 * @route GET /api/auth/logout
 * @description clear token from user cookie and add the token in blacklist
 * @access Public
 */

authRoute.get("/logout", AuthController.logoutUserController);

/**
 * @route GET /api/auth/get-me
 * @description get the current logged in user details
 * @access private
 */
authRoute.get("/get-me", authMiddleware.authUser , AuthController.getMeController);

module.exports = authRoute;