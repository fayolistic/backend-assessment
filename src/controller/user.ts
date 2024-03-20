import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import { JwtPayload } from "jsonwebtoken";
import User from "../model/user";

function generateAccessToken(user: any) {
  const payload = {
    email: user.email,
    id: user._id,
  };
  const secret = "Your_secret_key";
  const options = { expiresIn: "1h" };

  return jwt.sign(payload, secret, options);
}

interface AccessTokenPayload extends JwtPayload {
  email: string;
  id: string;
}

export interface CustomRequest extends Request {
  user?: AccessTokenPayload;
}

export function verifyAccessToken(token: string) {
  const secret: string = "Your_secret_key";

  try {
    const decoded = jwt.verify(token, secret) as AccessTokenPayload;
    return { success: true, data: decoded };
  } catch (error) {
    return { success: false, data: (error as Error).message };
  }
}

export function authenticateToken(
  req: CustomRequest,
  res: Response,
  next: NextFunction
) {
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

// Create a new user
export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = new User(req.body);
    const password = req.body.password;
    const hashedPassword = bcrypt.hashSync(password, 10);
    user.password = hashedPassword;
    await user.save();
    res.send(user);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error signing up user");
  }
};

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    res.status(400).json({ error: "please fill all fields" });
  }
  const user = await User.findOne({ email: email });

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
};

// Retrieve all users
export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const allUsers = await User.find({});
    res.status(200).json(allUsers);
  } catch (error) {
    console.error("Error retrieving all users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// View details of a specific user
export const getUserDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ error: "User not found" });
    } else {
      res.status(200).json(user);
    }
  } catch (error) {
    console.error("Error retrieving user details:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Edit a user
export const editUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const requestedId: string = req.params.id;
    const user = await User.findById(requestedId);

    if (!user) {
      return res.status(404).send("User not found");
    }

    Object.keys(req.body).forEach((key: string) => {
      if ((user as any)[key] !== undefined) {
        (user as any)[key] = req.body[key];
      }
    });

    await user.save();
    res.send(user);
  } catch (error) {
    console.error("Error updating user", error);
    res.status(500).send("Internal Server Error");
  }
};

// Delete a user
export const deleteUser = async (req: Request, res: Response) => {
  const requestedId: string = req.params.id;
  const user = await User.findById(requestedId);
  if (!user) {
    res.status(404).json({ message: "No User found" });
  } else {
    await User.deleteOne({ _id: user._id });
  }
  res.status(200).json({ message: "Deleted successfully" });
};
