import express from "express"
import dotenv from "dotenv"
import { Request, Response } from "express"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// Routes
import routes from "./routes/index"
app.use(routes)

import productIndex from "./routes/productIndex"
app.use(productIndex)

app.get("/", (req: Request, res: Response) => {
    return res.send("its working fine...")
})


app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`))