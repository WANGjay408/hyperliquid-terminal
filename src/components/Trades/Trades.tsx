const mockTrades = [
    { price: 35005, size: 0.1, side: "buy", time: "12:01:02" },
    { price: 34995, size: 0.3, side: "sell", time: "12:01:05" },
];

export default function Trades() {
    return (
        <div className="bg-gray-800 rounded p-4">
            <h2 className="font-bold mb-2">Latest Trades</h2>
            <ul className="space-y-1 text-sm">
                {mockTrades.map((t, i) => (
                    <li
                        key={i}
                        className="flex justify-between"
                    >
            <span
                className={t.side === "buy" ? "text-green-400" : "text-red-400"}
            >
              {t.price}
            </span>
                        <span>{t.size}</span>
                        <span className="text-gray-400">{t.time}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
