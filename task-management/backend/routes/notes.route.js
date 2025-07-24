import express from "express";
import {
  createNote,
  getUserNotes,
  updateNote,
  deleteNote,
} from "../controllers/note.controller.js";

import verifyToken from './verifyToken.js';

const router = express.Router();

// Secure all note routes
router.post("/", verifyToken, createNote);
router.get("/", verifyToken, getUserNotes);
router.put("/:id", verifyToken, updateNote);
router.delete("/:id", verifyToken, deleteNote);

export default router;
