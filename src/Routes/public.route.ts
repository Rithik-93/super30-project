import express, { Request, Response } from 'express';
// import { INR_BALANCES, ORDERBOOK, STOCK_BALANCES } from '../server';

const router = express.Router();

export let INR_BALANCES: INR_BALANCESType = {
    "user1": {
        balance: 10,
        locked: 0
    },
    "user2": {
        balance: 20,
        locked: 20
    }
};

export let ORDERBOOK: ORDERBOOKType | null = {
    "BTC_USDT": {
        "yes": {
            "9.5": {
                "total": 12,
                orders: {
                    "user1": 2,
                    "user2": 10,
                }
            },
            "8.5": {
                "total": 12,
                orders: {
                    "user1": 6,
                    "user2": 6,
                }
            },
            "7.5": {
                "total": 15,
                orders: {
                    "user1": 1,
                    "user2": 14,
                }
            },
            "6.5": {
                "total": 8,
                orders: {
                    "user2": 4,
                    "user1": 4,
                }
            }
        },
        "no": {
            "9.0": {
                "total": 10,
                orders: {
                    "user2": 5,
                    "user1": 5
                }
            },
            "8.0": {
                "total": 20,
                orders: {
                    "user1": 10,
                    "user2": 10,
                }
            },
            "7.0": {
                "total": 5,
                orders: {
                    "user1": 3,
                    "user2": 2
                }
            },
            "6.0": {
                "total": 6,
                orders: {
                    "user1": 4,
                    "user2": 2,
                }
            }
        }
    }
};

export let STOCK_BALANCES: STOCK_BALANCESType = {
    "user1": {
        "BTC_USDT": {
            "yes": {
                "quantity": 13,
                "locked": 0
            },
            "no": {
                "quantity": 22,
                "locked": 0
            }
        }
    },
    "user2": {
        "BTC_USDT": {
            "no": {
                "quantity": 19,
                "locked": 4
            },
            "yes": {
                "quantity": 13,
                "locked": 0
            }
        }
    }
}

router.get('/balances/orderbook', (req: Request, res: Response) => {
    res.json({
        ORDERBOOK
    })
    return
});

router.get('/balances/inr', (req: Request, res: Response) => {
    res.json({
        INR_BALANCES
    })
    return
});

router.get('/balances/stock', (req: Request, res: Response) => {
    res.json({
        STOCK_BALANCES
    })
    return
});

router.post('/reset', (req: Request, res: Response) => {
    ORDERBOOK = {};
    STOCK_BALANCES = {};
    INR_BALANCES = {};
    res.json({
        msg: "Reset successful"
    })
});

router.post('/order/buy', async (req: Request, res: Response) => {
    const { userId, stockSymbol, quantity, price, stocktype } = req.body;
    const totalCost = quantity * price;

    if (!INR_BALANCES[userId]) {
        res.status(400).json({ msg: "User not found" });
        return
    }
    if (ORDERBOOK === null) {
        ORDERBOOK = {}
    }
    const userBalance = INR_BALANCES[userId].balance;
    if (totalCost > userBalance) {
        res.status(400).json({ msg: "Not enough INR" });
        return
    }

    if (!ORDERBOOK[stockSymbol]) {
        res.json({
            msg : `${stockSymbol} unavailable in the Orderbook`
        })
    }

    if (stocktype === "yes") {
        if (!ORDERBOOK[stockSymbol].yes[price].total < quantity) {
            res.json({
                msg: `there's only ${ORDERBOOK[stockSymbol].yes[price].total} available `
            })
            return
        } 
        ORDERBOOK[stockSymbol].yes[price].total -= quantity;
        INR_BALANCES[userId].balance -= totalCost;
        INR_BALANCES[userId].locked += totalCost;

    } else if (stocktype === "no") {
        if (!ORDERBOOK[stockSymbol].no[price].total < quantity) {
            res.json({
                msg: `there's only ${ORDERBOOK[stockSymbol].no[price].total} available `
            })
            return
        }
        ORDERBOOK[stockSymbol].no[price].total -= quantity;
    }


    // if (!ORDERBOOK[stockSymbol].yes[price]) {
    //     ORDERBOOK[stockSymbol].yes[price] = { total: 0, orders: {} };
    // }
    // ORDERBOOK[stockSymbol].yes[price].orders[userId] = (ORDERBOOK[stockSymbol].yes[price].orders[userId] || 0) + quantity;

    res.json({ msg: "successful ig", stock: ORDERBOOK });
    return
});

router.post('/order/no', async (req: Request, res: Response) => {
    const { userId, stockSymbol, quantity, price } = req.body;
    const totalCost = quantity * price;

    if (!INR_BALANCES[userId]) {
        res.status(400).json({ msg: "User not found" });
        return
    }

    const userBalance = INR_BALANCES[userId].balance;
    if (totalCost > userBalance) {
        res.status(400).json({ msg: "Not enough INR" });
        return
    }

    INR_BALANCES[userId].balance -= totalCost;
    INR_BALANCES[userId].locked += totalCost;

    if (ORDERBOOK === null) {
        ORDERBOOK = {}
    }

    if (!ORDERBOOK[stockSymbol]) {
        ORDERBOOK[stockSymbol] = { yes: {}, no: {} };
    }

    if (!ORDERBOOK[stockSymbol].no[price]) {
        ORDERBOOK[stockSymbol].no[price] = { total: 0, orders: {} };
    }

    ORDERBOOK[stockSymbol].no[price].total += quantity;
    ORDERBOOK[stockSymbol].no[price].orders[userId] = (ORDERBOOK[stockSymbol].no[price].orders[userId] || 0) + quantity;

    res.json({ msg: "successful ig", stock: ORDERBOOK });
    return
});

router.post('/trade/mint', (req: Request, res: Response) => {
    const { stockSymbol, userId, quantity } = req.body;

    if (!INR_BALANCES[userId]) {
        res.json({ message: "No user found" });
        return;
    }

    if (ORDERBOOK === null) {
        ORDERBOOK = {}
    }

    if (ORDERBOOK[stockSymbol]) {

        if (!STOCK_BALANCES[userId][stockSymbol]) {
            res.json({ message: "No stockSymbol there in stock balance" });
            return;
        }

        STOCK_BALANCES[userId][stockSymbol]["yes"].quantity += quantity;
        STOCK_BALANCES[userId][stockSymbol]["yes"].locked += quantity;

        res.json({ msg: "Successful ig", stockBalance: STOCK_BALANCES[userId][stockSymbol]["yes"] });
        return;
    } else {
        res.json({ msg: "No stock symbol" });
        return
    }
});

router.post('/symbol/create/:stockSymbol', (req: Request, res: Response) => {
    const stockSymbol = req.params.stockSymbol;

    if (ORDERBOOK === null) {
        ORDERBOOK = {};
    }
    if (ORDERBOOK[stockSymbol]) {
        res.json({ msg: "stockSymbol already exists" });
        return;
    }

    ORDERBOOK[stockSymbol] = {
        yes: {},
        no: {}
    };

    res.json({ msg: "stockSymbol created successfully" });
});

export default router;