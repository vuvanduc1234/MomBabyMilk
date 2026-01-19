const express = require("express");
const {
  updateUser,
  deleteUser,
  viewUser,
  findById,
  createUser,
} = require("../controllers/UserController");

const router = express.Router();

router.get("/", viewUser);
router.get("/:id", findById);
router.post("/", createUser);
router.patch("/:id", updateUser);
router.delete("/:id", deleteUser);

module.exports = router;