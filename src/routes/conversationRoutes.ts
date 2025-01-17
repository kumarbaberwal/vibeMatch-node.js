import { Router, Request, Response } from "express";
import { veryfyToken } from "../middlewares/authMiddleware";
import { checkOrCreateConversation, fetchAllConversationsByUserId, getDailyQuestions } from "../controllers/conversationsController";

const router = Router();

router.get('/', veryfyToken, fetchAllConversationsByUserId);
router.post('/check-or-create', veryfyToken, checkOrCreateConversation);
router.get('/:id/daily-question', veryfyToken, getDailyQuestions);


export default router;