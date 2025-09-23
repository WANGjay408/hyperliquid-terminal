"use client";

import {useState} from "react";
import {Dropdown, Button} from "antd";
import {DownOutlined} from "@ant-design/icons";
import MarketsModal from "@/components/Markets/MarketsModal";

interface HeaderProps {
    pair: string;
    onSelect: (p: string) => void;
    price?: number;
    change?: number; // 涨跌幅 %
}

export default function Header({pair, onSelect, price, change}: HeaderProps) {
    const [modalOpen, setModalOpen] = useState(false);

    return (
        <header className="flex items-center justify-between bg-gray-900 px-4 py-2">
            {/* 左边交易对 */}
            <div className="flex items-center gap-2">
                {/* 币种图标可以后面换动态的 */}
                <div
                    className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">
                    ₿
                </div>
                <span className="text-lg font-bold text-white">{pair}</span>

                {/* 下拉按钮 */}
                <Button
                    type="text"
                    className="text-white"
                    icon={<DownOutlined/>}
                    onClick={() => setModalOpen(true)}
                />
            </div>

            {/* 右边价格信息 */}
            <div className="text-right">
                <div className="text-pink-400 text-xl font-bold">{price?.toLocaleString()}</div>
                <div
                    className={`text-sm ${change && change < 0 ? "text-red-400" : "text-green-400"}`}
                >
                    {change}%
                </div>
            </div>

            {/* 弹窗 */}
            <MarketsModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSelect={onSelect}
            />
        </header>
    );
}
