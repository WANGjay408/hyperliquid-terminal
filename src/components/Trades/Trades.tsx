"use client";

import { useEffect, useState } from "react";
import * as hl from "@nktkas/hyperliquid";
import { useMarket } from "@/store/useMarket";

const wsTransport = new hl.WebSocketTransport();
const subsClient = new hl.SubscriptionClient({ transport: wsTransport });

type Trade = {
    px: number;          // 价格
    sz: number;          // 数量
    side: "buy" | "sell";// 方向
    time: number;        // ms 时间戳
};

// HTTP 拉取最近成交（兼容不同字段名）
async function fetchRecentTrades(coin: string, n = 50): Promise<Trade[]> {
    const res = await fetch("https://api.hyperliquid.xyz/info", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ type: "recentTrades", req: { coin, n } }),
    });
    if (!res.ok) return [];
    const raw = await res.json();

    // 兼容字段名：有些返回是 px/sz/side/time，有些是 p/s/buyerIsTaker/t
    const mapTrade = (t: any): Trade => ({
        px: Number(t.px ?? t.p ?? 0),
        sz: Number(t.sz ?? t.s ?? 0),
        side:
            (t.side as "buy" | "sell") ??
            (t.buyerIsTaker ? "buy" : "sell"),
        time: Number(t.time ?? t.t ?? Date.now()),
    });

    return Array.isArray(raw) ? raw.map(mapTrade) : [];
}

export default function Trades() {
    const { symbol } = useMarket();
    const [trades, setTrades] = useState<Trade[]>([]);

    useEffect(() => {
        if (!symbol) return;
        let alive = true;
        let sub: hl.Subscription | null = null;

        // 1) 初始化一页
        (async () => {
            const list = await fetchRecentTrades(symbol, 50);
            if (!alive) return;
            // 最新在上
            const sorted = [...list].sort((a, b) => b.time - a.time);
            setTrades(sorted);
        })();

        // 2) 订阅实时成交（注意：方法名是 trades）
        (async () => {
            sub = await subsClient.trades({ coin: symbol }, (batch: any[]) => {
                if (!alive || !Array.isArray(batch)) return;
                const mapped: Trade[] = batch.map((t) => ({
                    px: Number(t.px ?? t.p ?? 0),
                    sz: Number(t.sz ?? t.s ?? 0),
                    side:
                        (t.side as "buy" | "sell") ??
                        (t.buyerIsTaker ? "buy" : "sell"),
                    time: Number(t.time ?? t.t ?? Date.now()),
                }));
                // 新数据插到前面，最多保留 200 条
                setTrades((prev) => [...mapped, ...prev].slice(0, 200));
            });
        })();

        return () => {
            alive = false;
            if (sub) void sub.unsubscribe();
        };
    }, [symbol]);

    return (
        <div className="w-full text-xs sm:text-sm font-mono">
            {/* header 固定 */}
            <div className="grid grid-cols-3 px-3 py-2 text-gray-400 border-y border-gray-800 sticky top-0 bg-gray-900 z-10">
                <div>Price</div>
                <div className="text-center">Size (BTC)</div>
                <div className="text-right">Time</div>
            </div>

            <div className="divide-y divide-gray-800">
                {trades.map((t, i) => {
                    const isBuy = t.side === "buy";
                    const priceCls = isBuy ? "text-emerald-400" : "text-rose-400";
                    const timeStr = new Date(t.time).toLocaleTimeString([], {
                        hour12: false,
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                    });
                    return (
                        <div
                            key={`${t.time}-${i}`}
                            className="grid grid-cols-3 px-3 h-8 items-center hover:bg-gray-800/40"
                        >
                            <div className={priceCls}>{t.px.toLocaleString()}</div>
                            <div className="text-center text-gray-200">
                                {t.sz.toFixed(5)}
                            </div>
                            <div className="flex justify-end items-center gap-1 text-gray-400">
                                <span>{timeStr}</span>
                                {/* 这里的链接按需替换为你的 Explorer 详情地址 */}
                                <a
                                    href={`https://explorer.hyperliquid.xyz/`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-cyan-400 hover:text-cyan-300"
                                    aria-label="open in explorer"
                                    title="Open in explorer"
                                >
                                    ↗
                                </a>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

