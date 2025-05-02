import express from "express";
const router = express.Router();

import validate from "../validators/validator.request";
import webhookController from "../controllers/webhook.controller";
import userController from "../controllers/user.controller";


export { router };
