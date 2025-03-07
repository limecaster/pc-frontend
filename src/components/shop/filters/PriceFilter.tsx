import React, { useState } from "react";
import { Range, getTrackBackground } from "react-range";

const MIN = 0;
const MAX = 100_000_000;
const STEP = 1000;

const PriceFilter: React.FC = () => {
    const [values, setValues] = useState<number[]>([0, MAX]);

    const formatPrice = (price: number): string => {
        return price.toLocaleString("vi-VN");
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="font-medium text-gray-900 text-base">
                KHOẢNG GIÁ
            </div>

            {/* Range Slider */}
            <div className="w-full px-2 py-4">
                <Range
                    values={values}
                    step={STEP}
                    min={MIN}
                    max={MAX}
                    onChange={(newValues) => setValues(newValues)}
                    renderTrack={({ props, children }) => (
                        <div
                            {...props}
                            style={{
                                ...props.style,
                                height: "6px",
                                width: "100%",
                                background: getTrackBackground({
                                    values,
                                    colors: ["#ccc", "#1435C3", "#ccc"],
                                    min: MIN,
                                    max: MAX,
                                }),
                                borderRadius: "4px",
                            }}
                        >
                            {children}
                        </div>
                    )}
                    renderThumb={({ props: { key, ...restProps }, index }) => (
                        <div
                            {...restProps}
                            key={key}
                            style={{
                                ...restProps.style,
                                height: "20px",
                                width: "20px",
                                backgroundColor: "#1435C3",
                                borderRadius: "50%",
                                boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.3)",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        />
                    )}
                />
            </div>

            {/* Min/Max Input Fields */}
            <div className="grid grid-cols-2 gap-2">
                <div className="h-10 rounded border border-gray-100">
                    <input
                        type="text"
                        className="w-full h-full px-3 py-2 bg-transparent outline-none text-gray-500 text-sm"
                        placeholder="Thấp nhất"
                        value={formatPrice(values[0])}
                        onChange={(e) =>
                            setValues([
                                Math.max(
                                    MIN,
                                    Number(e.target.value.replace(/[^0-9]/g, ""))
                                ),
                                values[1],
                            ])
                        }
                    />
                </div>

                <div className="h-10 rounded border border-gray-100">
                    <input
                        type="text"
                        className="w-full h-full px-3 py-2 bg-transparent outline-none text-gray-500 text-sm"
                        placeholder="Cao nhất"
                        value={formatPrice(values[1])}
                        onChange={(e) =>
                            setValues([
                                values[0],
                                Math.min(
                                    MAX,
                                    Number(e.target.value.replace(/[^0-9]/g, ""))
                                ),
                            ])
                        }
                    />
                </div>
            </div>
        </div>
    );
};

export default PriceFilter;
