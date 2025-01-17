import { Router } from "express";
import { veryfyToken } from "../middlewares/authMiddleware";
import { addContact, fetchContacts, recentContacts } from "../controllers/contactsController";

const router = Router();

router.get('/', veryfyToken, fetchContacts);
router.post('/', veryfyToken, addContact);
router.get('/recent', veryfyToken, recentContacts);


export default router;