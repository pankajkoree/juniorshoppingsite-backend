import { Router } from "express";
import { registerUser, loginUser, logout, resetPassword, getProfile } from "../controller/userControllers"
import { verifyJWT } from "../middleware/verifyJWT";

const router = Router()

router.post("/register", registerUser)
router.post("/login", loginUser)
router.post("/logout", logout)
router.post("/reset-password", resetPassword)
router.get("/profile", verifyJWT, getProfile)

export default router