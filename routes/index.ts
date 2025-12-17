import { Router } from "express";
import userRoute from "./userRoute"

const router = Router()

router.use("/api/user", userRoute)

export default router

