import { BehaviorSubject } from "rxjs";

// 当前选中的交易对，比如 "BTCUSDC"
export const selectedSymbol$ = new BehaviorSubject<string>("BTCUSDC");

// 当前选中的时间周期，比如 "1h"
export const selectedInterval$ = new BehaviorSubject<string>("1h");
