import { Router } from "express";
import { veryfyToken } from "../middlewares/authMiddleware";
import { addContact, fetchContacts } from "../controllers/contactsController";

const router = Router();

router.get('/', veryfyToken, fetchContacts);
router.post('/', veryfyToken, addContact);


export default router;