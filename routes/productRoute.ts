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
router.post("/:productName", getProductsByName)
router.post("/:id", getProductsById)

export default router