import express from "express"
import dotenv from "dotenv"
import { Request, Response } from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors({
    origin: [
        "http://localhost:3000",
        "https://juniorshoppingsite-backend-1.onrender.com"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,

}))

app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: false }))

// Routes
import routes from "./routes/index"
app.use(routes)

app.get("/", (req: Request, res: Response) => {
    return res.send("its working fine...")
})

const server = app.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`)
})
