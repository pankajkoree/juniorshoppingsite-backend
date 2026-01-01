import { Request, Response } from "express"
import prisma from "../DB/db.config"

export const getProducts = async (req: Request, res: Response) => {
    try {
        const products = await prisma.product.findMany()
        return res.status(200).json({ success: true, message: "successfully fetched all products", data: products })
    } catch (error) {
        // <------- response for server error ------->
        return res.status(500).json({ message: "server error", error: error })
    }
}