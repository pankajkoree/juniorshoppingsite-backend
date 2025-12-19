import prisma from "../DB/db.config";
import { Request, Response } from "express";
import validator from "validator"
export const registerUser = async (req: Request, res: Response) => {

    try {
        const { name, email, password } = req.body

        // <------- Validation ------->
        if (!name || !email || !password) {
            return res.status(400)
                .json({ message: "All fields are required" })
        }
        if (name.length < 2) {
            return res.status(400)
                .json({ message: "name should be atleast 2 characters long" })
        }
        if (!validator.isEmail(email)) {
            return res.status(400)
                .json({ message: "email not valid" })
        }
    } catch (error) {
        return res.status(500)
            .json({ message: "server error", error: error })
    }



}