import prisma from "../DB/db.config";
import { Request, Response } from "express";
import { registerSchema } from "../schemas/register.schema"
import bcrypt from "bcryptjs"

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

        // <------- hashing the password ------->
        const hashedPassword = await bcrypt.hash(password, 12)

        const userData = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword
            }
        })

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
        return res.status(500)
            .json({ message: "server error", error: error })
    }
}


export const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({
            where: {
                email: email
            },
            select: {
                username: true,
                email: true,
            }
        })
        return res.status(200).json({ message: "login successful", data: user })
    } catch (error) {
        return res.status(500).json({ message: "server error", error: error })
    }
}