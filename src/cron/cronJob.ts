import cron from 'node-cron';
import pool from '../models/db';
import { generateDailyQuestion } from '../services/openaiService';
import { AI_BOT_ID } from '../configs';

// * * * * *
// 0 10 * * *

cron.schedule('0 10 * * *', async () => {
    console.log('Starting daily question cron job...');
    try {
        const conversations = await pool.query(
            `
                SELECT id FROM conversations;
            `
        );

        console.log(conversations.rowCount);

        for (const conversation of conversations.rows) {
            const question = await generateDailyQuestion();
            await pool.query(
                `
                    INSERT INTO messages (conversation_id, sender_id, content)
                    VALUES ($1, $2, $3);
                `,
                [conversation.id, AI_BOT_ID,question]
            );

            console.log(`Daily question sent for conversation ${conversation.id}`)
        }
    } catch (error) {
        console.log(`Error in daily question job: `, error)
    }
});