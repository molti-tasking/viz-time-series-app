import jsonData from "./20250228T15:39_stock_sp500_data.json?raw";

const minTimeout = 2000;

type SP500StockData = {
  timestamp: number;
  [x: string]: number | null;
};

const stockData: SP500StockData[] = JSON.parse(jsonData);
export async function* streamStockSP500Data(): AsyncGenerator<SP500StockData> {
  console.log("Stream of stocks: ", stockData.length);

  for (const item of stockData) {
    yield new Promise<SP500StockData>((resolve) => {
      safeRequestIdleCallback(() => resolve(item), minTimeout);
    });
  }
}

function safeRequestIdleCallback(callback: () => void, minTimeout = 1000) {
  if ("requestIdleCallback" in window) {
    return setTimeout(() => requestIdleCallback(callback), minTimeout);
  } else {
    return setTimeout(callback, minTimeout);
  }
}
