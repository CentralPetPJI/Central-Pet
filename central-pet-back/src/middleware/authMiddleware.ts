import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request {
    user?: {
        _id: string;
    };
}

interface JwtPayload {
    user: {
        _id: string;
    };
}

const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ msg: "Token inexistente, authorização negada" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
        req.user = decoded?.user;
        next();
    } catch (error) {
        res.status(401).json({ msg: 'Token não é válido'});
    }
};

export default authMiddleware;