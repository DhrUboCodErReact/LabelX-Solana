import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
import { z } from "zod";
import { Request, Response, NextFunction } from "express";

interface RequestWithUser extends Request {
  user?: {
    userId: number;
    iat?: number;
    exp?: number;
  };
}

export const auth = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const tokenSchema = z.string();
    const authHeader = req.header("Authorization");

    if (!authHeader) {
      return res.status(401).json({ message: "No token provided", success: false });
    }

    const token = tokenSchema.parse(authHeader.replace("Bearer ", ""));
    console.log("🔐 Received token:", token);

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ message: "JWT secret not configured", success: false });
    }

    try {
      const decoded = jwt.verify(token, secret) as jwt.JwtPayload;

      const userId = Number(decoded.userId); // ✅ Convert to number
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid token user ID", success: false });
      }

      req.user = {
        userId,
        iat: decoded.iat,
        exp: decoded.exp,
      };

      next(); // proceed to next middleware/route handler
    } catch (error) {
      return res.status(401).json({
        message: "Unauthorized: Invalid or expired token",
        success: false,
      });
    }

  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong during authentication",
      success: false,
      error: (error as Error).message,
    });
  }
};
