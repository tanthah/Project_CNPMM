import express from 'express';
import { getSettings } from '../controllers/settingController.js';

const router = express.Router();

router.get('/', getSettings);

export default router;
