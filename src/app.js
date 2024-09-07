import express from "express";
import authRouter from "./routers/auth.js";
import productRouter from "./routers/product.js";
import usersRouter from "./routers/users.js";
import categoryRouter from "./routers/category.js";
import cartRouter from "./routers/cart.js";
import cors from "cors";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";
import morgan from "morgan";

const app = express();
dotenv.config();

app.use(express.json());
app.use(cors());
app.use(morgan("tiny"));

connectDB(process.env.DB_URI);

app.use(`/api/v1/`, authRouter);
app.use(`/api/v1/`, productRouter);
app.use(`/api/v1/`, usersRouter);
app.use(`/api/v1/`, categoryRouter);
app.use(`/api/v1/`, cartRouter);

export const viteNodeApp = app;
