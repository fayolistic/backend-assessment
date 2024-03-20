"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_1 = require("../controller/user");
const router = express_1.default.Router();
// Routes
// Create a signup User
router.post("/signup", user_1.createUser);
// login a signup User
router.post("/login", user_1.loginUser);
// Retrieve all users
router.get("/", user_1.getAllUsers);
// View details of a specific user
router.get("/:id", user_1.getUserDetails);
// Edit a user
router.put("/:id", user_1.editUser);
// Delete a user
router.delete("/:id", user_1.deleteUser);
exports.default = router;
