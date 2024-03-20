"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.editUser = exports.getUserDetails = exports.getAllUsers = exports.loginUser = exports.createUser = exports.authenticateToken = exports.verifyAccessToken = void 0;
const jwt = __importStar(require("jsonwebtoken"));
const bcrypt = __importStar(require("bcrypt"));
const user_1 = __importDefault(require("../model/user"));
function generateAccessToken(user) {
    const payload = {
        email: user.email,
        id: user._id,
    };
    const secret = "Your_secret_key";
    const options = { expiresIn: "1h" };
    return jwt.sign(payload, secret, options);
}
function verifyAccessToken(token) {
    const secret = "Your_secret_key";
    try {
        const decoded = jwt.verify(token, secret);
        return { success: true, data: decoded };
    }
    catch (error) {
        return { success: false, data: error.message };
    }
}
exports.verifyAccessToken = verifyAccessToken;
function authenticateToken(req, res, next) {
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res
            .status(401)
            .json({ message: "Missing or invalid Authorization header" });
        return;
    }
    const token = authHeader.substring("Bearer ".length);
    if (!token) {
        return res.sendStatus(401);
    }
    const result = verifyAccessToken(token);
    if (!result.success) {
        return res.status(403).json({ error: result.data });
    }
    if (typeof result.data !== "string") {
        req.user = result.data;
        next();
    }
}
exports.authenticateToken = authenticateToken;
// Create a new user
const createUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = new user_1.default(req.body);
        const password = req.body.password;
        const hashedPassword = bcrypt.hashSync(password, 10);
        user.password = hashedPassword;
        yield user.save();
        res.send(user);
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Error signing up user");
    }
});
exports.createUser = createUser;
const loginUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.body.email;
    const password = req.body.password;
    if (!email || !password) {
        res.status(400).json({ error: "please fill all fields" });
    }
    const user = yield user_1.default.findOne({ email: email });
    if (!user) {
        return res.status(403).json({ error: "Email not found" });
    }
    const match = bcrypt.compareSync(password, user.password);
    if (!match) {
        return res.status(403).json({ error: "Incorrect Password" });
    }
    next();
    const accessToken = generateAccessToken(user);
    res
        .status(200)
        .json({ message: "Login Successful", accessToken: accessToken });
});
exports.loginUser = loginUser;
// Retrieve all users
const getAllUsers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const allUsers = yield user_1.default.find({});
        res.status(200).json(allUsers);
    }
    catch (error) {
        console.error("Error retrieving all users:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.getAllUsers = getAllUsers;
// View details of a specific user
const getUserDetails = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.id;
        const user = yield user_1.default.findById(userId);
        if (!user) {
            res.status(404).json({ error: "User not found" });
        }
        else {
            res.status(200).json(user);
        }
    }
    catch (error) {
        console.error("Error retrieving user details:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.getUserDetails = getUserDetails;
// Edit a user
const editUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const requestedId = req.params.id;
        const user = yield user_1.default.findById(requestedId);
        if (!user) {
            return res.status(404).send("User not found");
        }
        Object.keys(req.body).forEach((key) => {
            if (user[key] !== undefined) {
                user[key] = req.body[key];
            }
        });
        yield user.save();
        res.send(user);
    }
    catch (error) {
        console.error("Error updating user", error);
        res.status(500).send("Internal Server Error");
    }
});
exports.editUser = editUser;
// Delete a user
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const requestedId = req.params.id;
    const user = yield user_1.default.findById(requestedId);
    if (!user) {
        res.status(404).json({ message: "No User found" });
    }
    else {
        yield user_1.default.deleteOne({ _id: user._id });
    }
    res.status(200).json({ message: "Deleted successfully" });
});
exports.deleteUser = deleteUser;
