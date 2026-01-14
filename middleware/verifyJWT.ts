import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../DB/db.config";

export const verifyJWT = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const token = req.cookies?.token
    if (!token) {
        return res.status(401).json({
            message: "Unauthorized - missing token",
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
            id: string;
        };

        const validToken = await prisma.token.findUnique({ where: { token } });
        if (!validToken) {
            return res.status(401).json({
                message: "invalid or expred token while validating the token",
            });
        }
        (req as any).userId = decoded.id;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};