import { Router } from "express";
import userRoute from "./userRoute"
import productRoute from "./productRoute"

const router = Router()

router.use("/api/products", productRoute)
router.use("/api/user", userRoute)

export default router

