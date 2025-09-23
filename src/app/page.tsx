"use client";

import { useState } from "react";
import Chart from "@/components/Chart/Chart";
import OrderBook from "@/components/OrderBook/OrderBook";
import Trades from "@/components/Trades/Trades";
import MarketsModal from "@/components/Markets/MarketsModal";

export default function Home() {
    const [activeTab, setActiveTab] = useState<"chart" | "orderbook" | "trades">("chart");
    const [pair, setPair] = useState("BTC-USD");
    const [showMarkets, setShowMarkets] = useState(false);

    return (
        <div className="flex flex-col h-screen bg-gray-900 text-white">
            {/* Header */}
            <header className="flex justify-between items-center p-4 border-b border-gray-700">
                <div>
                    <h1
                        className="text-xl font-bold cursor-pointer"
                        onClick={() => setShowMarkets(true)}
                    >
                        {pair}
                    </h1>
                    <p className="text-green-400">
                        49.131 <span className="text-red-400">-7.25%</span>
                    </p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-1 bg-teal-500 rounded">Connect</button>
                    <button className="px-2">⚙️</button>
                </div>
            </header>

            {/* Tabs */}
            <div className="flex border-b border-gray-700">
                <button
                    className={`flex-1 py-2 ${activeTab === "chart" ? "bg-gray-800" : ""}`}
                    onClick={() => setActiveTab("chart")}
                >
                    Chart
                </button>
                <button
                    className={`flex-1 py-2 ${activeTab === "orderbook" ? "bg-gray-800" : ""}`}
                    onClick={() => setActiveTab("orderbook")}
                >
                    Order Book
                </button>
                <button
                    className={`flex-1 py-2 ${activeTab === "trades" ? "bg-gray-800" : ""}`}
                    onClick={() => setActiveTab("trades")}
                >
                    Trades
                </button>
            </div>

            {/* Main */}
            <main className="flex-1 p-4 overflow-y-auto">
                {activeTab === "chart" && <Chart />}
                {activeTab === "orderbook" && <OrderBook />}
                {activeTab === "trades" && <Trades />}
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-700 p-2 text-sm flex justify-around">
                <button>Balances</button>
                <button>Positions</button>
                <button>Open Orders</button>
                <button>Trade History</button>
            </footer>

            {/* Markets Modal */}
            <MarketsModal
                open={showMarkets}
                onClose={() => setShowMarkets(false)}
                onSelect={(symbol) => setPair(symbol)}
            />
        </div>
    );
}
