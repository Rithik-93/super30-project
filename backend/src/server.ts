import express, { Request, Response } from 'express';
import  userRoutes from './Routes/user.route';
import publicRoutes from './Routes/public.route'
import { INR_BALANCES, ORDERBOOK, STOCK_BALANCES } from './Routes/public.route'
import cors from 'cors';


const app = express();
app.use(express.json());
app.use(cors());

app.use('/api/v1/user', userRoutes);

app.use('/api/v1/', publicRoutes );

const port = 3000;
app.listen(port, () => {
    console.log(`server running on ${port}`)
});

export default app;