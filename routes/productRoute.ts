import { Router } from "express"
import {
    getProducts,
    getProductsByCategory,
    getProductsByName,
    getProductsById
} from "../controller/productController"

const router = Router()

router.get("/", getProducts)
router.get("/category/:category", getProductsByCategory)
router.get("/search/:productName", getProductsByName)
router.get("/:id", getProductsById)

export default router