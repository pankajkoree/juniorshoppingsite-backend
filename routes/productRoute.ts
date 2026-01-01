import { Router } from "express"
import { getProducts } from "../controller/productController"

const router = Router()

router.get("/", getProducts)

export default router