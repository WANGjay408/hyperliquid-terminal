import Markets from "@/components/Markets/Markets";
import Chart from "@/components/Chart/Chart";
import OrderBook from "@/components/OrderBook/OrderBook";
import Trades from "@/components/Trades/Trades";

export default function Home() {
  return (
      <main className="min-h-screen bg-gray-900 text-white flex flex-col">
        {/* 顶部：交易对选择 */}
        <header className="p-4 border-b border-gray-700">
          <Markets />
        </header>

        {/* 中间：价格图表 */}
        <section className="flex-1 p-4">
          <Chart />
        </section>

        {/* 底部：订单簿 + 成交 */}
        <section className="p-4 border-t border-gray-700 grid grid-cols-1 md:grid-cols-2 gap-4">
          <OrderBook />
          <Trades />
        </section>
      </main>
  );
}
