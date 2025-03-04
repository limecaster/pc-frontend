import React, { useState } from "react";
import { Range, getTrackBackground } from "react-range";

const MIN = 0;
const MAX = 5000000;
const STEP = 1000;

const PriceFilter: React.FC = () => {
    const [values, setValues] = useState<number[]>([0, 5000000]);

    const formatPrice = (price: number): string => {
        return price.toLocaleString("vi-VN");
    };

    return (
        <div className="grid gap-4 relative px-5 mx-1">
            <div className="relative w-[312px] font-medium text-gray-900 text-base">
                KHOẢNG GIÁ
            </div>

            {/* Range Slider */}
            <div className="relative flex flex-col items-center">
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
                                    colors: ["#ccc", "#3b82f6", "#ccc"],
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
                                backgroundColor: "#3b82f6",
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
            <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="relative w-[150px] h-10 rounded border border-gray-100">
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

                <div className="relative w-[150px] h-10 rounded border border-gray-100">
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
