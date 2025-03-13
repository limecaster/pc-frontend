"use client";

import React from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from "chart.js";
import { Chart } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
);

interface ChartWrapperProps {
    type: "line" | "bar" | "pie" | "doughnut";
    data: any;
    options?: any;
    height?: string | number;
    width?: string | number;
    className?: string;
}

const ChartWrapper: React.FC<ChartWrapperProps> = ({
    type,
    data,
    options = {},
    height,
    width,
    className = "",
}) => {
    // Only render on client side to avoid SSR issues
    if (typeof window === "undefined") {
        return null;
    }

    const containerStyle: React.CSSProperties = {
        height: height
            ? typeof height === "number"
                ? `${height}px`
                : height
            : "100%",
        width: width
            ? typeof width === "number"
                ? `${width}px`
                : width
            : "100%",
    };

    return (
        <div className={className} style={containerStyle}>
            <Chart type={type} data={data} options={options} />
        </div>
    );
};

export default ChartWrapper;
