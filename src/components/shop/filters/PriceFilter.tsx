import React, { useState, useEffect, useRef } from "react";
import { Range, getTrackBackground } from "react-range";

const MIN = 0;
const MAX = 100_000_000;
const STEP = 1000;

interface PriceFilterProps {
    onPriceChange?: (minPrice: number, maxPrice: number) => void;
    initialMinPrice?: number;
    initialMaxPrice?: number;
}

const PriceFilter: React.FC<PriceFilterProps> = ({ 
    onPriceChange, 
    initialMinPrice = MIN, 
    initialMaxPrice = MAX 
}) => {
    // Store the initial props in refs to avoid re-renders
    const initialMinRef = useRef(initialMinPrice);
    const initialMaxRef = useRef(initialMaxPrice);
    
    const [values, setValues] = useState<number[]>([
        initialMinRef.current, 
        initialMaxRef.current
    ]);
    
    // Track if changes are from user input vs. prop changes
    const [userInteracted, setUserInteracted] = useState(false);
    
    // Track the last values we've notified the parent about
    const lastNotifiedValues = useRef([initialMinPrice, initialMaxPrice]);
    
    // Only update from props when component first mounts
    useEffect(() => {
        initialMinRef.current = initialMinPrice;
        initialMaxRef.current = initialMaxPrice;
        setValues([initialMinPrice, initialMaxPrice]);
    }, []);  // ← Empty dependency array means this only runs once on mount
    
    // Only notify parent when user has interacted and values actually changed
    useEffect(() => {
        if (!userInteracted) return;
        
        // Avoid notifying for the same values
        if (
            lastNotifiedValues.current[0] === values[0] && 
            lastNotifiedValues.current[1] === values[1]
        ) {
            return;
        }
        
        const timer = setTimeout(() => {
            if (onPriceChange) {
                lastNotifiedValues.current = [...values];
                onPriceChange(values[0], values[1]);
            }
        }, 500);
        
        return () => clearTimeout(timer);
    }, [values, onPriceChange, userInteracted]);

    const formatPrice = (price: number): string => {
        return price.toLocaleString("vi-VN");
    };
    
    // Handler that sets the userInteracted flag
    const handleChange = (newValues: number[]) => {
        setUserInteracted(true);
        setValues(newValues);
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
                    onChange={handleChange}
                    renderTrack={({ props, children }) => (
                        <div
                            {...props} // Use props directly without destructuring key
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
                    renderThumb={({ props: { key, ...restProps }, isDragged }) => (
                        <div
                            key={key}
                            {...restProps}
                            style={{
                                ...restProps.style,
                                height: "20px",
                                width: "20px",
                                backgroundColor: isDragged ? "#0f2a94" : "#1435C3",
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
                        onChange={(e) => {
                            const newValue = Math.max(
                                MIN,
                                Number(e.target.value.replace(/[^0-9]/g, ""))
                            );
                            setUserInteracted(true);
                            setValues([newValue, Math.max(values[1], newValue)]);
                        }}
                    />
                </div>

                <div className="h-10 rounded border border-gray-100">
                    <input
                        type="text"
                        className="w-full h-full px-3 py-2 bg-transparent outline-none text-gray-500 text-sm"
                        placeholder="Cao nhất"
                        value={formatPrice(values[1])}
                        onChange={(e) => {
                            const newValue = Math.min(
                                MAX,
                                Number(e.target.value.replace(/[^0-9]/g, ""))
                            );
                            setUserInteracted(true);
                            setValues([Math.min(values[0], newValue), newValue]);
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default PriceFilter;
