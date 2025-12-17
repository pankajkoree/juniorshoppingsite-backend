import { Router } from "express";
import { store } from "../controllers/userController";
const router = Router()

router.post("/", store)

export default router