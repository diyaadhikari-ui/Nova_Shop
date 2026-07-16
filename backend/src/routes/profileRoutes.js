import express from "express";
import { authenticate } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import {
  getMyProfile,
  updateMyProfile,
  uploadProfilePhoto
} from "../controllers/profileController.js";

const router = express.Router();

router.get("/me", authenticate, getMyProfile);
router.put("/me", authenticate, updateMyProfile);
router.put("/photo", authenticate, upload.single("avatar"), uploadProfilePhoto);

export default router;