// Route handler for /api/send-mail
import express from 'express';
import mailController from '../controllers/mailController.js';

const router = express.Router();
router.post('/send-mail', mailController.sendMail);

export default router;
