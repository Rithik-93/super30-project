import express, { Request, Response } from 'express';
import { INR_BALANCES, STOCK_BALANCES } from './public.route';

const router = express.Router();

router.post('/create/:userId', (req: Request, res: Response) => {
    const userId = req.params.userId;
    if (INR_BALANCES[userId]) {
        res.json({ msg: "User already exists" });
    } else {
        INR_BALANCES[userId] = {
            balance: 0,
            locked: 0
        }
    }
    res.json({ msg: "User created successfully" });
});

router.get('/stockbalance/:userId', async (req: Request, res: Response) => {
    const userId  = req.params.userId;

    if (!STOCK_BALANCES[userId]) {
        res.json({
            msg : "this user doesn't have any stock yet"
        })
    }

    if (STOCK_BALANCES[userId]) {
        res.json({ stock_balance: STOCK_BALANCES[userId] });
    } else {
        res.status(404).json('User does not exist');
    }
});

router.get('/balance/inr/:userId', (req: Request, res: Response) => {
    const userId = req.params.userId;
    if (INR_BALANCES[userId]) {
        const { balance } = INR_BALANCES[userId];
        res.json({ balance });
    } else {
        res.status(404).json({ error: "no user found" });
    };
});

router.put('/onramp/inr', async (req: Request, res: Response) => {
    const { userId, amount } = req.body;
    if (!INR_BALANCES[userId]) {
        res.json({
            msg : "user doesn't exist"
        })
        return
    }

    if (INR_BALANCES[userId]) {
        INR_BALANCES[userId].balance += amount / 100;
        res.json({ userId, balance: INR_BALANCES[userId].balance });
    } else {
        res.status(404).json({ error: 'User not found' });
    }
});

export default router;