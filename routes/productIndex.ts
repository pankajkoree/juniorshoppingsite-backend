import { Router } from "express";
import productRoute from "./productRoute"

const router = Router()

router.use("/api/products", productRoute)

export default router

