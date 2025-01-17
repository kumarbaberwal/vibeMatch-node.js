import express, { Request, Response } from 'express';
import { json } from 'body-parser';
import authRouter from './routes/authRoutes';
import conversationsRouter from './routes/conversationRoutes';
import messagesRouter from './routes/messagesRoutes';
import contactsRouter from './routes/contactsRoutes';
import http from 'http';
import { Server } from 'socket.io';
import { saveMessage } from './controllers/messagesController';
import'./cron/cronJob';


const app = express();
const server = http.createServer(app);

app.use(json());

const io = new Server(server, {
    cors: {
        origin: '*',
    }
});

app.get('/', (req: Request, res: Response) => {
    res.send("Server is Working properly");
});

app.use('/auth', authRouter);
app.use('/conversations', conversationsRouter);
app.use('/messages', messagesRouter);
app.use('/contacts', contactsRouter);

io.on('connection', (socket) => {
    console.log('A user connected: ', socket.id);

    socket.on('joinConversation', (conversationId) => {
        socket.join(conversationId);
        console.log('User joined conversation: ' + conversationId);
    });

    socket.on('sendMessage', async (message) => {
        const { conversationId, senderId, content } = message;
        try {
            const savedMessage = await saveMessage(conversationId, senderId, content);
            console.log('sendMessage: ');
            console.log(savedMessage);
            io.to(conversationId).emit('newMessage', savedMessage);

            io.emit('conversationUpdated', {
                conversationId,
                lastMessage: savedMessage.content,
                lastMessageTime: savedMessage.created_at
            })
        } catch (error) {
            console.log('Failed to save message: ', error);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected: ', socket.id);
    })
})

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});