import express, { Request, Response, NextFunction } from "express";
import {
  createUser,
  loginUser,
  getAllUsers,
  getUserDetails,
  editUser,
  deleteUser,
} from "../controller/user";

const router = express.Router();

// Routes

// Create a signup User
router.post("/signup", createUser);

// login a signup User
router.post("/login", loginUser);

// Retrieve all users
router.get("/", getAllUsers);

// View details of a specific user
router.get("/:id", getUserDetails);

// Edit a user
router.put("/:id", editUser);

// Delete a user
router.delete("/:id", deleteUser);

export default router;
