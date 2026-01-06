import { Router } from "express"
import {
    getProducts,
    getProductsByCategory,
    getProductsByName,
    getProductsById
} from "../controller/productController"

const router = Router()

router.get("/", getProducts)
router.post("/category/:category", getProductsByCategory)
router.post("/product-name/:productName", getProductsByName)
router.post("/product-id/:id", getProductsById)

export default router