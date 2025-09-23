"use client";

import { useEffect, useRef } from "react";
import {
    createChart,
    IChartApi,
    ISeriesApi,
    CandlestickData,
    HistogramData,
    UTCTimestamp,
} from "lightweight-charts";
import * as hl from "@nktkas/hyperliquid";
import { useMarket } from "@/store/useMarket";

// ✅ 初始化 Hyperliquid 客户端
const httpTransport = new hl.HttpTransport();
const wsTransport = new hl.WebSocketTransport();
const infoClient = new hl.InfoClient({ transport: httpTransport });
const subsClient = new hl.SubscriptionClient({ transport: wsTransport });

export default function Chart() {
    const { symbol } = useMarket();

    const wrapRef = useRef<HTMLDivElement | null>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
    const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);

    const interval: hl.CandleSnapshotParameters["interval"] = "1m";

    // ✅ 初始化图表
    useEffect(() => {
        if (!wrapRef.current) return;

        const chart = createChart(wrapRef.current, {
            layout: {
                background: { color: "#1e1e1e" },
                textColor: "#d1d4dc",
            },
            width: wrapRef.current.clientWidth,
            height: wrapRef.current.clientHeight,
            grid: {
                vertLines: { color: "#2B2B43" },
                horzLines: { color: "#2B2B43" },
            },
            rightPriceScale: {
                borderVisible: false,
            },
            timeScale: {
                borderVisible: false,
            },
        });

        const candleSeries = chart.addCandlestickSeries();
        const volumeSeries = chart.addHistogramSeries({
            priceFormat: { type: "volume" },
            priceScaleId: "",
        });

        chart.priceScale("").applyOptions({
            scaleMargins: {
                top: 0.8,
                bottom: 0,
            },
        });

        chartRef.current = chart;
        candleSeriesRef.current = candleSeries;
        volumeSeriesRef.current = volumeSeries;

        const ro = new ResizeObserver((entries) => {
            for (const entry of entries) {
                chart.applyOptions({
                    width: entry.contentRect.width,
                    height: entry.contentRect.height,
                });
            }
        });
        ro.observe(wrapRef.current);

        return () => {
            ro.disconnect();
            chart.remove();
        };
    }, []);

    // ✅ 加载历史数据
    useEffect(() => {
        if (!symbol || !candleSeriesRef.current || !volumeSeriesRef.current) return;

        const loadCandles = async () => {
            try {
                const now = Date.now();
                const oneDay = 24 * 60 * 60 * 1000;

                const candles = await infoClient.candleSnapshot({
                    coin: symbol,
                    interval,
                    startTime: now - oneDay,
                    endTime: now,
                });

                const candleData: CandlestickData[] = candles.map((c) => ({
                    time: Math.floor(c.t / 1000) as UTCTimestamp,
                    open: Number(c.o),
                    high: Number(c.h),
                    low: Number(c.l),
                    close: Number(c.c),
                }));

                const volumeData: HistogramData[] = candles.map((c) => ({
                    time: Math.floor(c.t / 1000) as UTCTimestamp,
                    value: Number(c.v),
                    color:
                        Number(c.o) > Number(c.c)
                            ? "rgba(255,82,82,0.8)"
                            : "rgba(0,150,136,0.8)",
                }));

                candleSeriesRef.current?.setData(candleData);
                volumeSeriesRef.current?.setData(volumeData);
            } catch (err) {
                console.error("fetch candles error:", err);
            }
        };

        loadCandles();
    }, [symbol, interval]);

    // ✅ 实时订阅更新
    useEffect(() => {
        if (!symbol || !candleSeriesRef.current || !volumeSeriesRef.current) return;

        let closed = false;
        let subscription: hl.Subscription | null = null;

        (async () => {
            try {
                subscription = await subsClient.candle(
                    { coin: symbol, interval },
                    (c) => {
                        if (closed) return;

                        const ts = Math.floor(c.t / 1000) as UTCTimestamp;

                        candleSeriesRef.current!.update({
                            time: ts,
                            open: Number(c.o),
                            high: Number(c.h),
                            low: Number(c.l),
                            close: Number(c.c),
                        });

                        volumeSeriesRef.current!.update({
                            time: ts,
                            value: Number(c.v),
                            color:
                                Number(c.o) > Number(c.c)
                                    ? "rgba(255,82,82,0.8)"
                                    : "rgba(0,150,136,0.8)",
                        });
                    }
                );
            } catch (e) {
                console.error("subscribe candle error:", e);
            }
        })();

        return () => {
            closed = true;
            if (subscription) {
                void subscription.unsubscribe();
            }
        };
    }, [symbol, interval]);

    return (
        <div ref={wrapRef} className="w-full h-[600px] bg-gray-900 rounded-lg" />
    );
}







