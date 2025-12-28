import { Router } from "express";
import { registerUser, loginUser, logout, resetPassword } from "../controller/userControllers"

const router = Router()

router.post("/register", registerUser)
router.post("/login", loginUser)
router.post("/logout", logout)
router.post("/reset-password", resetPassword)

export default router