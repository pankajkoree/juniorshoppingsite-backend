import { Router } from "express"
import { getProducts, getProductsByCategory, getProductsByName } from "../controller/productController"

const router = Router()

router.get("/", getProducts)
router.post("/category/:category", getProductsByCategory)
router.post("/:productName", getProductsByName)

export default router