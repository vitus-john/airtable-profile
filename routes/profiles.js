const express = require("express");

const limiter = require("../middlewares/rateLimiter");
const validateProfileName = require("../middlewares/validateProfileName");
const {
  createProfile,
  getProfileById,
  listProfiles,
  deleteProfile,
} = require("../controllers/profiles");

const router = express.Router();

router.post("/profiles", limiter, validateProfileName, createProfile);
router.get("/profiles/:id", limiter, getProfileById);
router.get("/profiles", limiter, listProfiles);
router.delete("/profiles/:id", limiter, deleteProfile);

module.exports = router;
