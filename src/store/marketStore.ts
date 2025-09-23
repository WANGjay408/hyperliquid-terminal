"use client";

import { BehaviorSubject } from "rxjs";

export type SelectedMarket = {
    symbol: string;
    type: "Spot" | "Perp";
};

export const market$ = new BehaviorSubject<SelectedMarket>({
    symbol: "BTC",
    type: "Perp",
});

export function setMarket(market: SelectedMarket) {
    market$.next(market);
}
