"use client";

import { useEffect, useState } from "react";
import * as hl from "@nktkas/hyperliquid";
import { setMarket } from "@/store/marketStore";

const infoClient = new hl.InfoClient({
    transport: new hl.HttpTransport(),
});

interface MarketsModalProps {
    open: boolean;
    onClose: () => void;
    onSelect: (symbol: string) => void;
}

interface Market {
    key: string;
    symbol: string;
    type: "Spot" | "Perp";
    leverage?: number;
    volume: number;
    lastPrice: number;
    change24h: number;
}

// ✅ 工具函数
function toNum(v: any): number {
    const n = Number(v);
    return isNaN(n) ? 0 : n;
}

function pct(a: number, b: number): number {
    if (!b) return 0;
    return ((a - b) / b) * 100;
}

function formatVolume(v: number) {
    if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
    if (v >= 1e6) return `$${(v / 1e6).toFixed(2)}M`;
    if (v >= 1e3) return `$${(v / 1e3).toFixed(2)}K`;
    return `$${v.toFixed(2)}`;
}

function resolveSpotSymbol(u: any, tokens: any[]) {
    // 如果已经是 "AAA/BBB" 格式就直接用
    if (typeof u?.name === "string" && u.name.includes("/")) {
        return u.name;
    }

    // 否则用 tokens 数组映射
    const baseId = Array.isArray(u.tokens) ? u.tokens[0] : undefined;
    const quoteId = Array.isArray(u.tokens) ? u.tokens[1] : undefined;

    const baseToken = tokens.find((t) => t.index === baseId) || tokens[baseId];
    const quoteToken = tokens.find((t) => t.index === quoteId) || tokens[quoteId];

    const base = baseToken?.symbol || baseToken?.name || `@${baseId}`;
    const quote = quoteToken?.symbol || quoteToken?.name || `@${quoteId}`;

    return `${base}/${quote}`;
}

export default function MarketsModal({ open, onClose, onSelect }: MarketsModalProps) {
    const [markets, setMarkets] = useState<Market[]>([]);
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState<"All" | "Perp" | "Spot">("All");
    const [sortDesc, setSortDesc] = useState(true);

    useEffect(() => {
        if (!open) return;

        async function fetchMarkets() {
            try {
                // === 获取 perp 数据 ===
                const perpMeta = await infoClient.metaAndAssetCtxs();
                const perpUniverse = perpMeta[0].universe ?? [];
                const perpStats = perpMeta[1] ?? [];

                const perps: Market[] = perpUniverse.map((m: any, i: number) => {
                    const s = perpStats[i] ?? {};
                    const last = toNum(s.markPx);
                    const prev = toNum(s.prevDayPx);
                    return {
                        key: `PERP:${m.name}`,
                        symbol: `${m.name}-USD`,
                        type: "Perp",
                        leverage: m.maxLeverage,
                        volume: toNum(s.dayNtlVlm ?? 0),
                        lastPrice: last,
                        change24h: pct(last, prev),
                    };
                });

                // === 获取 spot 数据 ===
                const spotMeta = await infoClient.spotMeta();
                const spotStats = await infoClient.spotMetaAndAssetCtxs();
                // console.log("spotStats", spotStats);

                const spotUniverse = spotMeta.universe ?? [];
                const spotTokens = spotMeta.tokens ?? [];
                // console.log("spotTokens", spotTokens);

                const spots: Market[] = spotUniverse.map((u: any, i: number) => {
                    const s = spotStats[1][i] ?? {};
                    const last = toNum(s.markPx);
                    const prev = toNum(s.prevDayPx);
                    const volumeUsd = toNum(s.dayNtlVlm ?? 0);

                    return {
                        key: `SPOT:${u.index}`,
                        symbol: resolveSpotSymbol(u, spotStats),
                        type: "Spot",
                        leverage: undefined,
                        volume: volumeUsd,
                        lastPrice: last,
                        change24h: pct(last, prev),
                    };
                });

                setMarkets([...perps, ...spots]);
            } catch (err) {
                console.error("Failed to fetch markets", err);
            }
        }

        fetchMarkets();
    }, [open]);

    if (!open) return null;

    // ✅ 过滤 Tabs
    const filteredByTab = markets.filter((m) =>
        activeTab === "All" ? true : m.type === activeTab
    );

    // ✅ 搜索
    const filtered = filteredByTab.filter((m) =>
        m.symbol.toLowerCase().includes(search.toLowerCase())
    );

    // ✅ 排序
    const sorted = [...filtered].sort((a, b) =>
        sortDesc ? b.volume - a.volume : a.volume - b.volume
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-gray-900 rounded-lg p-4 w-[900px] h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold">Select Market</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
                </div>

                {/* 搜索框 */}
                <input
                    type="text"
                    placeholder="Search symbol..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full mb-3 px-3 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {/* Tabs */}
                <div className="flex space-x-6 mb-3 text-sm">
                    {["All", "Perp", "Spot"].map((tab) => (
                        <button
                            key={tab}
                            className={`pb-1 ${activeTab === tab ? "border-b-2 border-blue-500 text-white" : "text-gray-400"}`}
                            onClick={() => setActiveTab(tab as "All" | "Perp" | "Spot")}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* 表格 */}
                <div className="flex-1 overflow-y-auto">
                    <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-gray-900 z-10">
                        <tr className="text-gray-400 border-b border-gray-700">
                            <th className="text-left py-2 px-2">Symbol</th>
                            <th
                                className="text-right cursor-pointer px-2"
                                onClick={() => setSortDesc(!sortDesc)}
                            >
                                Volume {sortDesc ? "↓" : "↑"}
                            </th>
                            <th className="text-right px-2">Last Price / 24h Change</th>
                        </tr>
                        </thead>
                        <tbody>
                        {sorted.map((m) => (
                            <tr
                                key={m.key}
                                onClick={() => {
                                    setMarket({ symbol: m.key.split(":")[1], type: m.type });
                                    onSelect(m.symbol);
                                    onClose();
                                }}
                                className="cursor-pointer border-b border-gray-800 hover:bg-gray-800/60 transition-colors duration-200"
                            >
                                {/* Symbol */}
                                <td className="py-3 px-2">
                                    <div className="flex items-center space-x-2">
                                        <span className="font-semibold text-white">{m.symbol}</span>
                                        {m.type === "Perp" && (
                                            <span className="text-xs bg-green-700/80 px-2 py-0.5 rounded-md">{m.leverage}x</span>
                                        )}
                                        {m.type === "Spot" && (
                                            <span className="text-xs bg-blue-700/80 px-2 py-0.5 rounded-md">SPOT</span>
                                        )}
                                    </div>
                                </td>

                                {/* Volume */}
                                <td className="text-right px-2 font-mono text-gray-200">
                                    {formatVolume(m.volume)}
                                </td>

                                {/* Last Price & Change */}
                                <td className="text-right px-2 font-mono">
                                    <div className="text-white font-semibold">{m.lastPrice.toLocaleString()}</div>
                                    <div
                                        className={`text-xs ${
                                            m.change24h >= 0 ? "text-green-400" : "text-red-400"
                                        }`}
                                    >
                                        {m.change24h.toFixed(2)}%
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {sorted.length === 0 && (
                            <tr>
                                <td colSpan={3} className="text-center text-gray-500 py-4">
                                    No markets found
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
