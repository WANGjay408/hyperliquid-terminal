"use client";

import {useEffect, useMemo, useState} from "react";
import * as hl from "@nktkas/hyperliquid";
import {useMarket} from "@/store/useMarket";

// SDK 客户端（HTTP 初始化一次，WS 订阅）
const httpTransport = new hl.HttpTransport();
const wsTransport = new hl.WebSocketTransport();
const infoClient = new hl.InfoClient({transport: httpTransport});
const subsClient = new hl.SubscriptionClient({transport: wsTransport});

type RawLevel = { px: string; sz: string; n: number };
type Side = RawLevel[];

type Row = {
    price: number;
    size: number;
    cum: number; // 累计量
};

function groupAndCumulate(levels: Side, step: number, isBids: boolean): Row[] {
    // 1) 价格聚合：把同一价格桶的 size 累加
    const bucket = new Map<number, number>();
    for (const lv of levels) {
        const p = Number(lv.px);
        const s = Number(lv.sz);
        if (!Number.isFinite(p) || !Number.isFinite(s)) continue;

        // bids(买)：向下取整；asks(卖)：向上取整，保持中线对齐感
        const key = isBids
            ? Math.floor(p / step) * step
            : Math.ceil(p / step) * step;

        bucket.set(key, (bucket.get(key) ?? 0) + s);
    }

    // 2) 排序：bids 从高到低；asks 从低到高
    const prices = Array.from(bucket.keys()).sort((a, b) =>
        isBids ? b - a : a - b
    );

    // 3) 累计量
    let acc = 0;
    const rows: Row[] = [];
    for (const price of prices) {
        const size = bucket.get(price)!;
        acc += size;
        rows.push({price, size, cum: acc});
    }
    return rows;
}

export default function OrderBook() {
    const {symbol} = useMarket(); // 例如 "BTC"
    const [rawBids, setRawBids] = useState<Side>([]);
    const [rawAsks, setRawAsks] = useState<Side>([]);
    const [step, setStep] = useState<number>(1); // 价格聚合粒度
    const [mid, setMid] = useState<number | null>(null);

    // 初始化 + WS 订阅
    useEffect(() => {
        if (!symbol) return;
        let active = true;
        let sub: hl.Subscription | null = null;

        const loadOnce = async () => {
            const book = await infoClient.l2Book({coin: symbol});
            if (!book || !active) return;
            setRawBids(book.levels[0] ?? []);
            setRawAsks(book.levels[1] ?? []);

            // 用最优买/卖算 mid
            const bestBid = book.levels[0]?.[0]?.px ? Number(book.levels[0][0].px) : null;
            const bestAsk = book.levels[1]?.[0]?.px ? Number(book.levels[1][0].px) : null;
            if (bestBid && bestAsk) setMid((bestBid + bestAsk) / 2);
        };

        const subscribe = async () => {
            sub = await subsClient.l2Book({coin: symbol}, (book) => {
                if (!active) return;
                setRawBids(book.levels[0] ?? []);
                setRawAsks(book.levels[1] ?? []);

                const bid = book.levels[0]?.[0]?.px ? Number(book.levels[0][0].px) : null;
                const ask = book.levels[1]?.[0]?.px ? Number(book.levels[1][0].px) : null;
                if (bid && ask) setMid((bid + ask) / 2);
            });
        };

        loadOnce();
        subscribe();

        return () => {
            active = false;
            if (sub) void sub.unsubscribe();
        };
    }, [symbol]);

    // 聚合 + 累计
    const bids = useMemo(() => groupAndCumulate(rawBids, step, true), [rawBids, step]);
    const asks = useMemo(() => groupAndCumulate(rawAsks, step, false), [rawAsks, step]);

    // 统一显示行数（对齐）
    const rowCount = Math.max(bids.length, asks.length);
    const padBids = [...bids, ...Array(Math.max(0, rowCount - bids.length)).fill(null)];
    const padAsks = [...asks, ...Array(Math.max(0, rowCount - asks.length)).fill(null)];

    // 归一化用的最大累计量（左右取最大，让左右色条对称）
    const maxCum = useMemo(() => {
        const leftMax = bids.length ? bids[bids.length - 1].cum : 0;
        const rightMax = asks.length ? asks[asks.length - 1].cum : 0;
        return Math.max(leftMax, rightMax, 1e-9);
    }, [bids, asks]);

    return (
        <div className="w-full text-xs sm:text-sm font-mono">
            {/* 顶部：聚合粒度选择（左） + 中间标题 + 右侧单位 */}
            <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                    <span className="text-gray-400">Agg</span>
                    <select
                        value={step}
                        onChange={(e) => setStep(Number(e.target.value))}
                        className="bg-gray-800/60 border border-gray-700 rounded px-2 py-1"
                    >
                        {[0.1, 0.5, 1, 2, 5, 10, 50, 100].map((v) => (
                            <option key={v} value={v}>
                                {v}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="text-base sm:text-lg font-semibold">Order Book</div>
                <div className="text-right text-gray-400">BTC</div>
            </div>

            {/* 表头 */}
            <div
                className="grid grid-cols-[110px_1fr_1px_1fr_110px] items-center px-2 py-2 text-gray-400 border-y border-gray-800 sticky top-0 bg-gray-900 z-10">
                <div>Total (BTC)</div>
                <div className="text-center">Price</div>
                <div className="h-5 w-px bg-gray-700 mx-2"/>
                <div className="text-center">Price</div>
                <div className="text-right">Total (BTC)</div>
            </div>

            {/* 行：左右对称，色块从中线向两侧延伸 */}
            <div className="divide-y divide-gray-800">
                {Array.from({length: rowCount}).map((_, i) => {
                    const bid = padBids[i] as Row | null;
                    const ask = padAsks[i] as Row | null;

                    const bidWidth = bid ? Math.min(100, (bid.cum / maxCum) * 100) : 0;
                    const askWidth = ask ? Math.min(100, (ask.cum / maxCum) * 100) : 0;

                    return (
                        <div
                            key={i}
                            className="relative grid grid-cols-[110px_1fr_1px_1fr_110px] items-center h-8"
                        >
                            {/* 左累计 */}
                            <div className="pl-2 text-gray-200">
                                {bid ? bid.cum.toFixed(5) : ""}
                            </div>

                            {/* 左价（买）+ 从中线向左的背景条 */}
                            <div className="relative flex items-center justify-end pr-3">
                                {bid && (
                                    <>
                                        <div
                                            className="absolute right-0 top-0 h-full bg-emerald-800/40"
                                            style={{width: `${bidWidth}%`}}
                                        />
                                        <span className="relative z-10 text-emerald-400">
                      {bid.price.toLocaleString()}
                    </span>
                                    </>
                                )}
                            </div>

                            {/* 中线 */}
                            <div className="h-full w-px bg-gray-700"/>

                            {/* 右价（卖）+ 从中线向右的背景条 */}
                            <div className="relative flex items-center justify-start pl-3">
                                {ask && (
                                    <>
                                        <div
                                            className="absolute left-0 top-0 h-full bg-rose-900/45"
                                            style={{width: `${askWidth}%`}}
                                        />
                                        <span className="relative z-10 text-rose-400">
                      {ask.price.toLocaleString()}
                    </span>
                                    </>
                                )}
                            </div>

                            {/* 右累计 */}
                            <div className="pr-2 text-right text-gray-200">
                                {ask ? ask.cum.toFixed(5) : ""}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* 中间价格（可选显示） */}
            {mid && (
                <div className="flex justify-center py-2 text-sm text-gray-300">
                    Mid: <span className="ml-2 font-semibold">{mid.toLocaleString()}</span>
                </div>
            )}
        </div>
    );
}


