import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';


export const veryfyToken = (req: Request, res: Response, next: NextFunction): void => {
    const token = req.headers.authorization?.split(' ')[1];
    if(!token){
        res.status(403).json({
            error: "No Token Provided",
        });
        return;
    }

    try{
        const decode = jwt.verify(token, process.env.JWT_SECRET || 'secretchugli');
        req.user = decode as {id: string};
        next();
    } catch(e){
        res.status(500).json({
            error: 'Invalid Token'
        });
    }
}