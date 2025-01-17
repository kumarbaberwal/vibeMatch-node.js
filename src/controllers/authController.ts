import { Request, Response } from "express";
import pool from "../models/db";
import bcrypt from 'bcrypt';
import Jwt from "jsonwebtoken";
import { error } from "console";

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'secretchugli';
const randomImages = [
    'https://i.pinimg.com/736x/58/67/ff/5867ff1964d400c203eee4a98e50c8f6.jpg',
    'https://i.pinimg.com/736x/84/fc/c3/84fcc3282da548061a1513b3d354d071.jpg',
    'https://i.pinimg.com/736x/56/85/25/5685259d7ee04e575eb052041ba62de4.jpg',
    'https://i.pinimg.com/736x/75/6e/50/756e50b386d12e2865c45836d9628e41.jpg'
]


export const register = async (req: Request, res: Response): Promise<any> => {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    try {
        const isAlreadyUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (isAlreadyUser.rows.length > 0) {
            return res.status(400).json({ error: "User already exists" });
        }
        const randomImage = randomImages[Math.floor(Math.random() * randomImages.length)];
        const result = await pool.query('INSERT INTO users (username, email, password, profile_image) VALUES ($1, $2, $3, $4) RETURNING *', [username, email, hashedPassword, randomImage]);
        const user = result.rows[0];
        const token = Jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "15d" });
        res.status(201).json({ user: { ...user, token } });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to register' });
    }
}
export const login = async (req: Request, res: Response): Promise<any> => {
    const { email, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const isMatch = bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(404).json({
                error: "Invalid credentials"
            });
        }
        const token = Jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "15d" });
        res.status(201).json({ user: { ...user, token } });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to login' });
    }
}
