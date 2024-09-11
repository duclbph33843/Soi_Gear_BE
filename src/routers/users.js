import express from "express";
import { deleteUsers, getUsers, getUsersByID } from "../controllers/users.js";

const router = express.Router();

router.get(`/users`, getUsers);
router.delete("/users/:id", deleteUsers);
router.get(`/users/:id`, getUsersByID);

export default router;
