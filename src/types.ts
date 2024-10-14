

interface INR_BALANCESType {
    [key: string]: 
    { 
        balance: number, 
        locked: number 
    }
}

interface ORDERBOOKType {
    [currencyPair: string]: {
        yes: {
            [price: string]: {
                total: number;
                orders: {
                    [user: string]: number;
                };
            };
        };
        no: {
            [price: string]: {
                total: number;
                orders: {
                    [user: string]: number;
                };
            };
        };
    };
}

interface STOCK_BALANCESType {
    [user: string]: {
        [stockSymbol: string]: {
            yes: {
                quantity: number;
                locked: number;
            };
            no: {
                quantity: number;
                locked: number;
            };
        };
    };
}
