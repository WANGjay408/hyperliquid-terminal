const mockBids = [
    { price: 35000, size: 0.5 },
    { price: 34990, size: 0.8 },
];
const mockAsks = [
    { price: 35010, size: 1.2 },
    { price: 35020, size: 0.6 },
];

export default function OrderBook() {
    return (
        <div className="bg-gray-800 rounded p-4">
            <h2 className="font-bold mb-2">Order Book</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <h3 className="text-green-400 mb-1">Bids</h3>
                    <ul className="space-y-1">
                        {mockBids.map((bid, i) => (
                            <li key={i} className="flex justify-between">
                                <span>{bid.price}</span>
                                <span>{bid.size}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h3 className="text-red-400 mb-1">Asks</h3>
                    <ul className="space-y-1">
                        {mockAsks.map((ask, i) => (
                            <li key={i} className="flex justify-between">
                                <span>{ask.price}</span>
                                <span>{ask.size}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
