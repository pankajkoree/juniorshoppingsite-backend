import { Router } from "express";
import { registerUser, loginUser } from "../controller/userControllers"

const router = Router()

router.post("/register", registerUser)
router.post("/login", loginUser)

export default router