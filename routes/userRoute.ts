import { Router } from "express";
import { registerUser } from "../controllers/userController"
import { loginUser } from "../controllers/userController";

const router = Router()

router.post("/register", registerUser)
router.post("/login", loginUser)

export default router