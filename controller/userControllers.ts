import bcrypt from "bcryptjs"
import { Request, Response } from "express";
import dotenv from "dotenv"
import prisma from "../DB/db.config"
import { registerSchema } from "../schemas/register.schema"
import { loginSchema } from "../schemas/login.schema";
import { resetPasswordSchema } from "../schemas/resetPassword.schema";
import { generateToken } from "../utils/generateToken";
import jwt from "jsonwebtoken"
import logger from "../utils/logger";

dotenv.config()

// <------- profile ------->
export const getProfile = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId
        const user = await prisma.user.findUnique({
            where: { id: userId }, select: {
                id: true,
                username: true,
                email: true,
            }
        })

        // <------- response if user not found ------->
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" })
        }

        // <------- response for success ------->
        return res.status(200).json({
            success: true, message: "User found", user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        })
    } catch (error) {
        logger.error('Error in getProfile:', error);
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
}

// <------- current user ------->
export const getCurrentUser = async (req: Request, res: Response) => {
    try {
        const token = req.cookies?.token

        // <------- response if token missing ------->
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized - missing token",
            });
        }

        const validToken = await prisma.token.findUnique({
            where: { token },
        });

        // <------- response for invalid token ------->
        if (!validToken) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired token",
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET!
        ) as { id: string };

        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                username: true,
                email: true,
            },
        });

        // <------- response if user not found ------->
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        (req as any).userId = user.id;

        // <------- response for success -------> 
        return res.status(200).json({
            success: true,
            message: "User found",
            user,
        });
    } catch (error) {
        // <------- response for server error ------->
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
}

// <------- register ------->
export const registerUser = async (req: Request, res: Response) => {
    try {
        const { username, email, password } = req.body

        // <------- Validation ------->
        const validation = registerSchema.safeParse({ username, email, password })
        if (!validation.success) {
            return res.status(400).json({ success: false, errors: validation.error.format() })
        }

        // <------- checking if user exits ------->
        const existingUser = await prisma.user.findUnique({
            where: { email: email }
        }) !== null;
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Email account already exists, please login" })
        }

        // <------- hashing the password ------->
        const hashedPassword = await bcrypt.hash(password, 12)

        // <------- creating user ------->
        const userData = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword
            }
        })

        // <------- response for 200 ------->
        return res.status(200).json({
            success: true,
            message: "Registration successful",
            user: {
                id: userData.id,
                username: userData.username,
                email: userData.email
            }
        })

    } catch (error) {
        // <------- response for server error ------->
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
}

// <------- login ------->
export const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // <------- validation ------->
        const validation = loginSchema.safeParse({ email, password })
        if (!validation.success) {
            return res.status(400).json({ success: false, errors: validation.error.format() })
        }

        // <------- fetching user if exists ------->
        const user = await prisma.user.findUnique({
            where: {
                email: email
            },
            select: {
                id: true,
                username: true,
                email: true,
                password: true,
            }
        })

        // <-------- response if user not found ------->
        if (!user) {
            return res.status(400).json({ success: false, message: "User not found, please register" })
        }

        // <------- response for password if not found ------->
        if (!user.password) {
            return res.status(400).json({ success: false, message: "User password not found" })
        }

        // <------- comparing password ------->
        const isValidPassword = await bcrypt.compare(password, user.password)
        if (!isValidPassword) {
            return res.status(400).json({ success: false, message: "Invalid password" })
        }

        // <------- token for login ------->
        const generatedToken = generateToken(user.id.toString())
        await prisma.token.create({
            data: {
                userId: user.id,
                token: generatedToken
            }
        })

        // <------- cookie ------->
        res.cookie("token", generatedToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })

        // <------- response if success ------->
        return res.status(200).json({
            success: true,
            message: "Login successful",
            generatedToken,
            data: {
                id: user.id,
                username: user.username,
                email: user.email,
            }
        })
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
}

// <------- logout------->
export const logout = async (req: Request, res: Response) => {
    try {
        const token = req.cookies?.token;
        if (token) {
            // Delete the token from database
            await prisma.token.deleteMany({
                where: { token }
            });
        }

        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
        })
        // <------- response for successful logout ------->
        return res.status(200).json({ success: true, message: "Logged out successfully" })
    } catch (error) {
        // <------- response for server error ------->
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
}

// <------- reset password------->
export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { identifier, newPassword } = req.body;

        // <------- validation ------->
        const validation = resetPasswordSchema.safeParse({ newPassword })
        if (!validation.success) {
            return res.status(400).json({ success: false, errors: validation.error.format() })
        }

        // <------ checking required fields ------>
        if (!identifier || !newPassword) {
            return res.status(400).json({ success: false, message: "Both fields are required" })
        }

        // <------- finding if user exists, so can proceed with reseting password ------->
        let user;
        if (identifier.includes("@")) {
            user = await prisma.user.findUnique({
                where: { email: identifier.toLowerCase() },
                select: {
                    id: true, username: true, email: true, password: true,
                }
            })
        } else {
            user = await prisma.user.findUnique({
                where: { username: identifier.toLowerCase() },
                select: {
                    id: true, username: true, email: true, password: true,
                }
            })
        }

        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" })
        }
        // <------- hashing the password -------> 
        const hashedPassword = await bcrypt.hash(newPassword, 12)

        // <------- updating the user ------->
        const userData = await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword }
        })

        // Invalidate all existing tokens for security
        await prisma.token.deleteMany({
            where: { userId: user.id }
        });

        // <------- response for success ------->
        return res.status(200).json({
            success: true,
            message: "Password reset successful. You can now login with new password"
        })
    } catch (error) {
        // <------- response for server error ------->
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
}