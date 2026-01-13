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
        "https://juniorshoppingsite.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,

}))

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Routes
import routes from "./routes/index";
app.use(routes);

app.get("/", (_req: Request, res: Response) => {
    res.send("its working fine...");
});

app.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`);
});