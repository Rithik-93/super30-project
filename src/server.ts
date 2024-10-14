import express, { Request, Response } from 'express';
import  userRoutes from './Routes/user.route';
import publicRoutes from './Routes/public.route'
import { INR_BALANCES, ORDERBOOK, STOCK_BALANCES } from './Routes/public.route'

const app = express();
app.use(express.json());

app.use('/api/v1/user', userRoutes);

app.use('/api/v1/', publicRoutes );


app.listen(3000, () => {
    console.log("server running on 3000")
});