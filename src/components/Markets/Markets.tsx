"use client";

import { useState } from "react";

const mockPairs = ["BTC-USDT", "ETH-USDT", "SOL-USDT", "AVAX-USDT"];

export default function Markets() {
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState("BTC-USDT");

    const filtered = mockPairs.filter((p) =>
        p.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <div className="flex gap-2">
                <input
                    type="text"
                    placeholder="Search pair..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 px-3 py-2 rounded bg-gray-800 border border-gray-700 text-sm"
                />
            </div>
            <div className="mt-2 flex gap-2 overflow-x-auto">
                {filtered.map((pair) => (
                    <button
                        key={pair}
                        onClick={() => setSelected(pair)}
                        className={`px-3 py-1 rounded ${
                            selected === pair
                                ? "bg-blue-600"
                                : "bg-gray-700 hover:bg-gray-600"
                        }`}
                    >
                        {pair}
                    </button>
                ))}
            </div>
        </div>
    );
}
