import bcrypt from "bcryptjs"
import { Request, Response } from "express";
import dotenv from "dotenv"
import prisma from "../DB/db.config"
import { registerSchema } from "../schemas/register.schema"
import { generateToken } from "../utils/generateToken";

dotenv.config()

// <------- register ------->
export const registerUser = async (req: Request, res: Response) => {
    try {
        const { username, email, password } = req.body

        // <------- Validation ------->
        if (!username || !email || !password) {
            return res.status(400)
                .json({ message: "All fields are required" })
        }
        const validation = registerSchema.safeParse({ username, email, password })
        if (!validation.success) {
            return res.status(400).json({ success: false, errors: validation.error.format() })
        }

        // <------- checking if user exits ------->
        const existingUser = await prisma.user.findUnique({
            where: { email: email }
        }) !== null;
        if (existingUser) {
            return res.status(400).json({ message: "email acount already exists, please login" })
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
            message: "registration successful",
            user: {
                id: userData.id,
                username: userData.username,
                email: userData.email
            }
        })

    } catch (error) {
        // <------- response for server error ------->
        return res.status(500)
            .json({ message: "server error", error: error })
    }
}

// <------- login ------->
export const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

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

        // <-------- reponse if user not found ------->
        if (!user) {
            return res.status(400).json({ message: "user not found, please register" })
        }

        // <------- response for password if not found ------->
        if (!user.password) {
            return res.status(400).json({ message: "user password not found" })
        }

        // <------- comparing password ------->
        const isValidPassword = await bcrypt.compare(password, user.password)
        if (!isValidPassword) {
            return res.status(400).json({ message: "invalid password" })
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
            message: "login successful",
            generatedToken,
            data: {
                id: user.id,
                username: user.username,
                email: user.email,
            }
        })
    } catch (error) {
        return res.status(500).json({ message: "server error", error: error })
    }
}

// <------- logout------->
export const logout = async (req: Request, res: Response) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
        })
        // <------- response for successful logout ------->
        return res.status(200).json({ message: "logged out successfully" })
    } catch (error) {
        // <------- response for server error ------->
        return res.status(500).json({ message: "server error", error: error })
    }
}