import { useState, useEffect, useCallback } from 'react';
import { Button } from "./components/ui/button"
import { Input } from "./components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select"
import axios from 'axios';
import toast from 'react-hot-toast';
// import dotenv from 'dotenv';

// dotenv.config();
const BACKEND = "http://localhost:3000";

type INRBalance = {
  balance: number;
  locked: number;
};

type StockBalance = {
  [symbol: string]: {
    yes: { quantity: number; locked: number };
    no: { quantity: number; locked: number };
  };
};

type OrderbookEntry = {
  total: number;
  orders: { [userId: string]: number };
};

type Orderbook = {
  [symbol: string]: {
    yes: { [price: string]: OrderbookEntry };
    no: { [price: string]: OrderbookEntry };
  };
};

export default function TradingApp() {
  const [inrBalances, setInrBalances] = useState<{ [userId: string]: INRBalance }>({});
  const [stockBalances, setStockBalances] = useState<{ [userId: string]: StockBalance }>({});
  const [orderbook, setOrderbook] = useState<Orderbook>({});
  const [userId, setUserId] = useState('');
  const [stockSymbol, setStockSymbol] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [stockType, setStockType] = useState<"yes" | "no">("yes");

  useEffect(() => {
    fetchBalances();
    fetchOrderbook();
  }, []);

  const fetchBalances = useCallback(async () => {
    try {
      const inrResponse = await axios.get(`${BACKEND}/api/v1/balances/inr`);
      // const inrData = await inrResponse.json();
      // console.log('asd',inrResponse.data.INR_BALANCES);
      setInrBalances(inrResponse.data.INR_BALANCES);

      const stockResponse = await axios.get(`${BACKEND}/api/v1/balances/stock`);
      // const stockData = await stockResponse.json();
      setStockBalances(stockResponse.data.STOCK_BALANCES);
      // console.log(stockResponse.data)
    } catch (error) {
      console.error('Error fetching balances:', error);
    }
  }, []);

  const fetchOrderbook = async () => {
    try {
      const response = await axios.get(`${BACKEND}/api/v1/balances/orderbook`);
      // const data = await response.json();
      // console.log(response);
      setOrderbook(response.data.ORDERBOOK);
    } catch (error) {
      console.error('Error fetching orderbook:', error);
    }
  };

  const handleBuy = async () => {
    try {
      const response = await axios.post(`${BACKEND}/api/v1/order/buy`, {
          userId,
          stockSymbol, 
          quantity: Number(quantity), 
          price: Number(price), 
          stocktype: stockType 
      });
      // const data = await response.json();
      console.log(response);
      toast.success("SUCCESSPUL")
      fetchBalances();
      fetchOrderbook();
    } catch (error) {
      console.error('Error placing buy order:', error);
    }
  };

  const handleSell = async () => {
    try {
      await axios.post(`${BACKEND}/api/v1/order/sell`, {
          userId, 
          stockSymbol, 
          quantity: Number(quantity), 
          price: Number(price), 
          stocktype: stockType
      });
      // const data = await response.json();
      // alert(data.msg);
      fetchBalances();
      fetchOrderbook();
    } catch (error) {
      console.error('Error in handleSell:', error);
      alert('An error occurred while processing your sell order.');
    }
  };

  const handleCreateSymbol = async () => {
    try {
      await axios.post(`${BACKEND}/api/v1/symbol/create/${stockSymbol}`);
      // const data = await response.json();
      // alert(response.data.msg);

      // console.log(response)
      fetchOrderbook();
    } catch (error) {
      console.error('Error creating symbol:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Trading App</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>INR Balances</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm overflow-auto max-h-60">{JSON.stringify(inrBalances, null, 2)}</pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stock Balances</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm overflow-auto max-h-60">{JSON.stringify(stockBalances, null, 2)}</pre>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Orderbook</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-sm overflow-auto max-h-60">{JSON.stringify(orderbook, null, 2)}</pre>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Place Order</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input placeholder="User ID" value={userId} onChange={(e) => setUserId(e.target.value)} />
            <Input placeholder="Stock Symbol" value={stockSymbol} onChange={(e) => setStockSymbol(e.target.value)} />
            <Input placeholder="Quantity" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            <Input placeholder="Price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
            <Select value={stockType} onValueChange={(value: "yes" | "no") => setStockType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select stock type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
            <div className="sm:col-span-2 flex justify-between gap-4">
              <Button onClick={handleBuy} className="flex-1">Buy</Button>
              <Button onClick={handleSell} className="flex-1">Sell</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Create Stock Symbol</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input placeholder="Stock Symbol" value={stockSymbol} onChange={(e) => setStockSymbol(e.target.value)} className="flex-1" />
            <Button onClick={handleCreateSymbol}>Create Symbol</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}