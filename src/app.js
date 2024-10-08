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
// import { requireAuth, users } from "@clerk/clerk-sdk-node"; 
// import { Clerk } from "@clerk/clerk-sdk-node";

const app = express();
dotenv.config();

app.use(express.json());
app.use(cors());
app.use(morgan("tiny"));

// app.use(requireAuth());

connectDB(process.env.DB_URI);
// console.log(process.env.DB_URI);



app.use(`/api/v1/`, authRouter);
app.use(`/api/v1/`, productRouter);
app.use(`/api/v1/`, usersRouter);
app.use(`/api/v1/`, categoryRouter);
app.use(`/api/v1/`, cartRouter);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// app.use("/api/v1/protected-route", requireAuth(), (req, res) => {
//   res.send("This route is protected by Clerk");
// });


export const viteNodeApp = app;
