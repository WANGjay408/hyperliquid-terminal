"use client";

import { useEffect, useState } from "react";
import { getMarkets } from "@/lib/hyperliquid";

export default function Markets({ onSelectPair }: { onSelectPair: (p: string) => void }) {
    const [pairs, setPairs] = useState<string[]>([]);
    const [selected, setSelected] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const list = await getMarkets();
                setPairs(list);
                if (list.length > 0) {
                    setSelected(list[0]);
                    onSelectPair(list[0]);
                }
            } catch (err) {
                console.error("Failed to load markets:", err);
            }
        })();
    }, [onSelectPair]);

    return (
        <div className="flex gap-2 overflow-x-auto">
            {pairs.map((pair) => (
                <button
                    key={pair}
                    onClick={() => {
                        setSelected(pair);
                        onSelectPair(pair);
                    }}
                    className={`px-3 py-1 rounded ${
                        selected === pair ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300"
                    }`}
                >
                    {pair}
                </button>
            ))}
        </div>
    );
}

