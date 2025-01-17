import { Router } from "express";
import { veryfyToken } from "../middlewares/authMiddleware";
import { fetchMessagesByConversationId } from "../controllers/messagesController";

const router = Router();

router.get('/:conversationId', veryfyToken, fetchMessagesByConversationId);

export default router;