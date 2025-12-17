import prisma from "../DB/db.config";
import { Request } from "express";
import { Response } from "express";
export const store = async (req: Request, res: Response) => {
    const { name, email, orgName } = req.body

    const user = await prisma.user.create({
        data: {
            name,
            email,
            orgName
        }


    })
    return res.status(200).json({ user, message: "User added successfully" })

}