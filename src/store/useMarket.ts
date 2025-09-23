"use client";

import { useEffect, useState } from "react";
import { market$, SelectedMarket } from "@/store/marketStore";

export function useMarket(): SelectedMarket {
    const [market, setMarket] = useState<SelectedMarket>(market$.getValue());

    useEffect(() => {
        const sub = market$.subscribe(setMarket);
        return () => sub.unsubscribe();
    }, []);

    return market;
}
