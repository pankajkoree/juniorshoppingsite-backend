import { Router } from "express";
import { registerUser, loginUser, logout, resetPassword, getProfile } from "../controller/userControllers"
import { verifyJWT } from "../middleware/verifyJWT";
import { authLimiter } from "../middleware/rateLimiter";

const router = Router()

router.post("/register", authLimiter, registerUser)
router.post("/login", authLimiter, loginUser)
router.post("/logout", logout)
router.post("/reset-password", authLimiter, resetPassword)
router.get("/profile", verifyJWT, getProfile)

export default router