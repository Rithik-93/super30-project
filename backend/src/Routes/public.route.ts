import express, { Request, Response } from 'express';
// import { INR_BALANCES, ORDERBOOK, STOCK_BALANCES } from '../server';

import { INR_BALANCESType, ORDERBOOKType, STOCK_BALANCESType } from '../types';

const router = express.Router();

export let INR_BALANCES: INR_BALANCESType = {
    "user1": {
        balance: 1000000,
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

router.delete('/reset', (req: Request, res: Response) => {
    ORDERBOOK = {};
    STOCK_BALANCES = {};
    INR_BALANCES = {};
    res.json({
        msg: "Reset successful"
    })
});

interface OrderBuyRequestBody {
    userId: string;
    stockSymbol: string;
    quantity: number;
    price: number;
    stocktype: "yes" | "no";
}

router.post('/order/buy', async (req: Request<{}, {}, OrderBuyRequestBody>, res: Response) => {
    const { userId, stockSymbol, quantity, price, stocktype } = req.body;
    const totalCost = quantity * price;

    if (!INR_BALANCES[userId]) {
        res.status(400).json({ msg: "User not found" });
        return
    }
    if (stocktype !== "no" && stocktype !== "yes") {
        res.json({ msg: "Please enter a valid stock type" });
        return;
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
            msg: `${stockSymbol} unavailable in the Orderbook`
        })
        return
    };
    // const userStockType = ORDERBOOK[stockSymbol][userId]

    if (!ORDERBOOK[stockSymbol][stocktype][price] || ORDERBOOK[stockSymbol][stocktype][price].total < quantity) {
        res.json({
            msg: `Not enough ${stocktype} stocks available`
        })
        return
    }
    //  if (stocktype === stockType.yes) {
    //     if (!ORDERBOOK[stockSymbol].yes[price] || ORDERBOOK[stockSymbol].yes[price].total < quantity) {
    //         res.json({
    //             msg: `Not enough Yes stocks available `
    //         })
    //         return
    //     }
    if (!STOCK_BALANCES[userId][stockSymbol]) {
        STOCK_BALANCES[userId][stockSymbol] = { yes: { quantity: 0, locked: 0 }, no: { quantity: 0, locked: 0 } };
    }

    ORDERBOOK[stockSymbol][stocktype][price].total -= quantity;
    STOCK_BALANCES[userId][stockSymbol][stocktype].quantity += quantity;
    INR_BALANCES[userId].balance -= totalCost;
    INR_BALANCES[userId].locked += totalCost;
    if (!STOCK_BALANCES[userId]) {
        STOCK_BALANCES[userId] = {};
    }
    res.json({ msg: "successful ig", stock: STOCK_BALANCES });
    return
});

router.post('/order/sell', async (req: Request, res: Response) => {
    const { userId, stockSymbol, quantity, price, stocktype } = req.body;
    const parsedPrice = price.toString();
    try {
        if (!INR_BALANCES[userId]) {
            res.status(400).json({ msg: "User not found" });
            return
        };
        if (!STOCK_BALANCES[userId][stockSymbol]) {
            res.json({
                msg: `you don't have ${stockSymbol} stocks in your account`
            })
            return
        };
        const totalCost = price * quantity;
        const userBalance = INR_BALANCES[userId].balance;
        if (ORDERBOOK === null) {
            ORDERBOOK = {}
        }
        if (totalCost > userBalance) {
            res.json({
                msg: "insufficient balance"
            })
            return
        };
        if (stocktype === "yes") {
            if (STOCK_BALANCES[userId][stockSymbol].yes.quantity < quantity) {
                res.json({
                    msg: `you don't have ${stockSymbol} yes stocks in your account`
                })
                return
            }
            if (ORDERBOOK === null) {
                ORDERBOOK = {}
            }
            STOCK_BALANCES[userId][stockSymbol].yes.quantity -= quantity;
            ORDERBOOK[stockSymbol].yes[price].total += quantity;
        } else if (stocktype === "no") {
            if (STOCK_BALANCES[userId][stockSymbol].no.quantity < quantity) {
                res.json({
                    msg: `insufficient NO stocks of ${stockSymbol}`
                })
                return
            }
            if (ORDERBOOK === null) {
                ORDERBOOK = {}
            }
            STOCK_BALANCES[userId][stockSymbol].no.quantity -= quantity;
            ORDERBOOK[stockSymbol].no[parsedPrice].total += quantity;
            // console.log(parsedPrice)
            // console.log(ORDERBOOK[stockSymbol].no)
        };

        INR_BALANCES[userId].balance -= totalCost;
        INR_BALANCES[userId].locked += totalCost;
        res.json({
            msg: "Order placed ig"
        });
    } catch (e) {
        console.error(e);
    }
});

router.get('/orderbook/:stockSymbol', (req: Request, res: Response) => {
    const stockSymbol = req.params.stockSymbol;
    if (ORDERBOOK === null) {
        ORDERBOOK = {};
    }
    if (!ORDERBOOK[stockSymbol]) {
        res.json({
            msg: `No ${stockSymbol} stock available in the orderbook`
        });
        return
    };
    res.json({
        ORDERBOOK
    })
})

router.put('/trade/mint', (req: Request, res: Response) => {
    const { stockSymbol, userId, quantity } = req.body;

    if (!INR_BALANCES[userId]) {
        res.json({ message: "No user found" });
        return;
    }

    if (!STOCK_BALANCES[userId][stockSymbol]) {
        res.json({
            msg: `You don't have any ${stockSymbol} available`
        })
        return
    };

    STOCK_BALANCES[userId][stockSymbol].yes.quantity += quantity;
    STOCK_BALANCES[userId][stockSymbol].no.quantity += quantity;
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