import { Router, Request, Response } from "express";
import userRoute from "./userRoute"
import productRoute from "./productRoute"
import { generalLimiter } from "../middleware/rateLimiter"

const router = Router()

// Apply general rate limiting to all routes
router.use(generalLimiter);

// Health check endpoint
router.get("/health", (req: Request, res: Response) => {
    res.status(200).json({ success: true, message: "Server is healthy", timestamp: new Date().toISOString() });
});

router.use("/api/products", productRoute)
router.use("/api/user", userRoute)

export default router

