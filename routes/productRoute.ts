import { Router } from "express"
import { getProducts, getProductsByCategory } from "../controller/productController"

const router = Router()

router.get("/", getProducts)
router.post("/category/:category", getProductsByCategory)

export default router