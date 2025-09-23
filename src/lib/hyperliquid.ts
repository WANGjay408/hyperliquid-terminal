import * as hl from "@nktkas/hyperliquid";

const http = new hl.HttpTransport();
const ws = new hl.WebSocketTransport();

export const infoClient = new hl.InfoClient({ transport: http });
export const subsClient = new hl.SubscriptionClient({ transport: ws });

export type CandleInterval =
    | "1m" | "3m" | "5m" | "15m" | "30m"
    | "1h" | "2h" | "4h" | "8h" | "12h"
    | "1d" | "3d" | "1w" | "1M";

// 各 interval 的毫秒数（1M 按 30 天近似）
const INTERVAL_MS: Record<CandleInterval, number> = {
    "1m": 60_000,
    "3m": 180_000,
    "5m": 300_000,
    "15m": 900_000,
    "30m": 1_800_000,
    "1h": 3_600_000,
    "2h": 7_200_000,
    "4h": 14_400_000,
    "8h": 28_800_000,
    "12h": 43_200_000,
    "1d": 86_400_000,
    "3d": 259_200_000,
    "1w": 604_800_000,
    "1M": 2_592_000_000,
};

export async function getMarkets() {
    const meta = await infoClient.meta();
    /* eslint-disable @typescript-eslint/no-explicit-any */
    return meta.universe.map((m: any) => `${m.coin}-USDT`);
}

/**
 * 获取历史K线快照
 * @param coin 如 "BTC"
 * @param interval K线周期
 * @param limit 回溯根数（默认500）
 */
export async function getCandles(
    coin: string,
    interval: CandleInterval = "1m",
    limit = 500
) {
    const endTime = Date.now(); // 毫秒时间戳
    const startTime = endTime - INTERVAL_MS[interval] * limit;

    // 👉 SDK 要求 candleSnapshot 需要 startTime（endTime 可选）
    return infoClient.candleSnapshot({ coin, interval, startTime, endTime });
}

/**
 * 订阅实时K线
 * SDK 的订阅不需要 startTime
 */
export async function subscribeCandles(
    coin: string,
    interval: CandleInterval = "1m",
    cb: (candle: hl.Candle) => void
) {
    return subsClient.candle({ coin, interval }, cb);
}

export async function subscribeOrderBook(
    coin: string,
    cb: (book: hl.Book) => void
) {
    return subsClient.l2Book({ coin }, cb);
}

export async function subscribeTrades(
    coin: string,
    cb: (trades: hl.WsTrade[]) => void
) {
    return subsClient.trades({ coin }, cb);
}
