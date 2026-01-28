import { Request, Response } from "express"
import { ObjectId } from "bson"
import prisma from "../DB/db.config"
import redis from "../redis/redis.client";

// <------- get all products ------->
export const getProducts = async (req: Request, res: Response) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const cacheKey = `products:page=${page}:limit:${limit}`

        // checking redis first
        const cachedData = await redis.get(cacheKey)

        if (cachedData) {
            return res.status(200).json({
                success: true,
                source: "redis",
                ...JSON.parse(cachedData)
            })
        }

        // if not data from db

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                skip,
                take: limit,

            }),
            prisma.product.count()
        ])

        const responseData = {
            products,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        }

        // store in redis
        await redis.set(
            cacheKey,
            JSON.stringify(responseData),
            "EX",
            60
        )

        // <------- response for successfull ------->
        return res.status(200).json({ success: true, message: "successfully fetched all products", source: "db", ...responseData })
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

// <------- products by name in more than one words ------->
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

// <------- products by id ------->
export const getProductsById = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;

        // <------- checking if id is valid ------->
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid product id" })
        }

        // <------- prisma query for id ------->
        const products = await prisma.product.findUnique({
            where: {
                id
            },
            select: {
                title: true,
                description: true,
                price: true,
                discountPercentage: true,
                rating: true,
                brand: true,
                thumbnail: true,
                category: true,
                stock: true,
                tags: true,
                sku: true,
                weight: true,
                dimensions: true,
                warrantyInformation: true,
                shippingInformation: true,
                availabilityStatus: true,
                reviews: true,
                returnPolicy: true,
                minimumOrderQuantity: true,
                meta: true,
                images: true
            }
        })

        // <------- response if not found ------->
        if (!products) {
            return res.status(404).json({ success: false, message: "product not found" })
        }

        // <-------- response for success ------->
        return res.status(200).json({ success: true, data: products })
    } catch (error) {
        // <------- response for server error ------->
        return res.status(500).json({ message: "server error", error: error })
    }
}