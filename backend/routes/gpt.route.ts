import express from 'express';
import * as gptController from '../controllers/gpt.controller';
import * as authController from '../controllers/auth.controller';

const router = express.Router();

router.use(authController.protect);
router.post('/gpt-pure-reply', gptController.getReplyFromGPT)


export default router;