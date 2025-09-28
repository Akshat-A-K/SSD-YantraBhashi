import express from 'express';
import { aiHealth, aiTest, aiCorrect } from '../controllers/aiController.js';

const router = express.Router();

router.get('/health', aiHealth);
router.get('/test', aiTest);



router.options('/correct', (req, res) => {
	const origin = req.headers.origin || '*';
	res.setHeader('Access-Control-Allow-Origin', origin);
	res.setHeader('Access-Control-Allow-Credentials', 'true');
	res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Code');
	return res.status(204).send();
});

router.post('/correct', aiCorrect);

export default router;
