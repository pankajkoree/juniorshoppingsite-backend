import { Request, Response } from "express"
import prisma from "../DB/db.config"

// <------- get all products ------->
export const getProducts = async (req: Request, res: Response) => {
    try {
        const products = await prisma.product.findMany()

        // <------- response for successfull ------->
        return res.status(200).json({ success: true, message: "successfully fetched all products", data: products })
    } catch (error) {
        // <------- response for server error ------->
        return res.status(500).json({ message: "server error", error: error })
    }
}

// <------- products by category ------->
export const getProductsByCategory = async (req: Request, res: Response) => {
    try {
        const category = req.params.category

        // search products with matching category
        const fetchedProducts = await prisma.product.findMany({
            where: { category: category },
            select: {
                id: true,
                title: true,
                description: true,
                price: true,
                discountPercentage: true,
                rating: true,
                brand: true,
                thumbnail: true,
            }
        })

        // <------- response if no product exists with entered category ------->
        if (fetchedProducts.length === 0) {
            return res.status(404).json({ success: false, message: `no products for ${category}` })
        }

        // <------- response for success ------->
        return res.status(201).json({ success: true, total: fetchedProducts.length, data: fetchedProducts })
    } catch (error) {
        // <------- response for server error ------->
        return res.status(500).json({ message: "server error", error: error })
    }
}

// <------- search specific products ------->
export const getProductsByName = async (req: Request, res: Response) => {
    try {
        const productName = (req.params.productName as string).trim()

        if (!productName) {
            return res.status(400).json({ message: "product name required" })
        }
        // spillting original entered product name into words
        const productInWords = productName.split(" ").filter(Boolean)

        // searching product with matching product name
        const fetchedProducts = await prisma.product.findMany({
            where: {
                OR: productInWords.map((productNameInWord) => ({
                    title: {
                        contains: productNameInWord,
                        mode: "insensitive"
                    }
                }))

            },
            select: {
                id: true,
                title: true,
                description: true,
                price: true,
                discountPercentage: true,
                rating: true,
                brand: true,
                thumbnail: true,
            }
        })

        // <------- response if no product matches ------->
        if (fetchedProducts.length === 0) {
            return res.status(404).json({ success: false, message: `no matching products for ${productName}` })
        }

        // <------- response for success ------->
        return res.status(201).json({ success: true, total: fetchedProducts.length, data: fetchedProducts })
    } catch (error) {
        // <------- response for server error ------->
        return res.status(500).json({ message: "server error", error: error })
    }
}