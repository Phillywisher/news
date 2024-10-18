const express = require("express");
const { getUsers } = require("../controllers/controller.js");

const router = express.Router();

router.get("/", getUsers);

module.exports = router;
