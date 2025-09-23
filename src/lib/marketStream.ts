// src/lib/marketStream.ts
import { webSocket } from "rxjs/webSocket";
import { filter, map, shareReplay } from "rxjs/operators";
import { Observable } from "rxjs";

// 假设你的行情 WebSocket 地址
const WS_URL = "wss://api.hyperliquid.xyz/ws";

interface MarketUpdate {
    symbol: string;
    price: number;
    volume: number;
    change24h: number;
}

// 创建一个共享的 WebSocket Subject
const subject = webSocket<any>(WS_URL);

// 定义一个函数：订阅某个 symbol 的行情
export function marketStream(symbol: string): Observable<MarketUpdate> {
    // 发送订阅请求
    subject.next({ type: "subscribe", channel: "market", symbol });

    return subject.pipe(
        filter((msg) => msg?.symbol === symbol),
        map((msg) => ({
            symbol: msg.symbol,
            price: Number(msg.price),
            volume: Number(msg.volume),
            change24h: Number(msg.change24h),
        })),
        shareReplay(1) // 所有订阅者共享数据流
    );
}
