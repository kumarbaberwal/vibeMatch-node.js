import { Request, Response } from "express";
import pool from "../models/db";
import { AI_BOT_ID } from "../configs";

export const fetchAllConversationsByUserId = async (req: Request, res: Response) => {
    let userId = null;
    if (req.user) {
        userId = req.user.userId;
    }

    try {
        const result = await pool.query(
            `
                SELECT 
                    c.id AS conversation_id,
                    CASE 
                        WHEN u1.id = $1 THEN u2.username
                        ELSE u1.username
                    END AS participant_name,
                    m.content AS last_message,
                    m.created_at AS last_message_time
                FROM conversations c
                JOIN users u1 ON u1.id = c.participant_one
                JOIN users u2 ON u2.id = c.participant_two
                LEFT JOIN LATERAL (
                    SELECT 
                        content, created_at
                    FROM messages
                    WHERE conversation_id = c.id
                    ORDER BY created_at DESC 
                    LIMIT 1
                ) m ON TRUE
                WHERE c.participant_one = $1 OR c.participant_two = $1
                ORDER BY m.created_at DESC;
            `,
            [userId]
        );

        res.status(200).json(result.rows);
    }
    catch (e) {
        console.log(`error: ${e}`)
        res.status(500).json({ message: 'Failed to fetch the conversation' })
    }
}

export const checkOrCreateConversation = async (req: Request, res: Response): Promise<any> => {
    let userId = null;
    if (req.user) {
        userId = req.user.userId;
    }

    const { contactId } = req.body;

    try {
        const existingConversation = await pool.query(
            `
                SELECT id FROM conversations
                WHERE (participant_one = $1 AND participant_two = $2)
                OR (participant_one = $2 AND participant_two = $1)
                LIMIT 1;
            `,
            [userId, contactId]
        );

        if (existingConversation.rowCount != null && existingConversation.rowCount > 0) {
            return res.status(200).json({
                conversationId: existingConversation.rows[0].id
            });
        }

        const newConversation = await pool.query(
            `
                INSERT INTO conversations (participant_one, participant_two)
                VALUES ($1, $2)
                RETURNING id;
            `,
            [userId, contactId]
        );

        res.status(200).json({
            conversationId: newConversation.rows[0].id
        });
    } catch (error) {
        console.error('Error Checking or Creating Conversation: ', error);
        res.status(500).json({
            error: 'Failed to checking or create conversation'
        });
    }
}

export const getDailyQuestions = async (req: Request, res: Response) : Promise<any> => {
    const conversationId = req.params.id;
     // Validate conversation ID
     if (!conversationId) {
        return res.status(400).json({ error: 'Conversation ID is required' });
    }
    try {
        const result = await pool.query(
            `
            SELECT content 
            FROM messages
            WHERE conversation_id = $1 AND sender_id = $2
            ORDER BY created_at DESC
            LIMIT 1;
            `,
            [conversationId, AI_BOT_ID]
        );

        if(result.rowCount === 0){
            return res.status(404).json({error: 'No daily question found'});
        }

        return res.status(200).json({
            question: result.rows[0].content
        });
    } catch (error) {
        console.log('Error fetching daily question: ', error);
        res.status(500).json({error: 'Failed to fetch daily question'});
    }
}