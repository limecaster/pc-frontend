"use client";

import React, { useState } from "react";
import { Menu } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";

interface DateRange {
    startDate: Date;
    endDate: Date;
}

interface Props {
    value: DateRange;
    onChange: (range: DateRange) => void;
}

const DateRangePicker: React.FC<Props> = ({ value, onChange }) => {
    const [isCustom, setIsCustom] = useState(false);
    const [customRange, setCustomRange] = useState({
        startDate: value.startDate.toISOString().split("T")[0],
        endDate: value.endDate.toISOString().split("T")[0],
    });

    const formatDate = (date: Date): string => {
        return new Intl.DateTimeFormat("vi-VN").format(date);
    };

    const getDisplayText = (): string => {
        return `${formatDate(value.startDate)} - ${formatDate(value.endDate)}`;
    };

    const applyCustomRange = () => {
        onChange({
            startDate: new Date(customRange.startDate),
            endDate: new Date(customRange.endDate),
        });
        setIsCustom(false);
    };

    const predefinedRanges = [
        {
            label: "Hôm nay",
            action: () => {
                const today = new Date();
                onChange({ startDate: today, endDate: today });
            },
        },
        {
            label: "7 ngày qua",
            action: () => {
                const end = new Date();
                const start = new Date();
                start.setDate(start.getDate() - 6);
                onChange({ startDate: start, endDate: end });
            },
        },
        {
            label: "30 ngày qua",
            action: () => {
                const end = new Date();
                const start = new Date();
                start.setDate(start.getDate() - 29);
                onChange({ startDate: start, endDate: end });
            },
        },
        {
            label: "Tháng này",
            action: () => {
                const now = new Date();
                const start = new Date(now.getFullYear(), now.getMonth(), 1);
                const end = new Date();
                onChange({ startDate: start, endDate: end });
            },
        },
        {
            label: "Quý hiện tại",
            action: () => {
                const now = new Date();
                const quarter = Math.floor(now.getMonth() / 3);
                const start = new Date(now.getFullYear(), quarter * 3, 1);
                const end = new Date();
                onChange({ startDate: start, endDate: end });
            },
        },
        {
            label: "Năm nay",
            action: () => {
                const now = new Date();
                const start = new Date(now.getFullYear(), 0, 1);
                const end = new Date();
                onChange({ startDate: start, endDate: end });
            },
        },
        {
            label: "Tùy chỉnh...",
            action: () => {
                setIsCustom(true);
            },
        },
    ];

    return (
        <Menu as="div" className="relative inline-block text-left">
            <Menu.Button className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none">
                <span>{getDisplayText()}</span>
                <FontAwesomeIcon icon={faChevronDown} className="ml-2 mt-1" />
            </Menu.Button>

            <Menu.Items className="absolute right-0 mt-2 w-64 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-20">
                <div className="p-2">
                    {isCustom ? (
                        <div className="p-2">
                            <div className="mb-3">
                                <label className="block text-sm font-medium text-gray-700">
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    value={customRange.startDate}
                                    onChange={(e) =>
                                        setCustomRange({
                                            ...customRange,
                                            startDate: e.target.value,
                                        })
                                    }
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                />
                            </div>
                            <div className="mb-3">
                                <label className="block text-sm font-medium text-gray-700">
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    value={customRange.endDate}
                                    onChange={(e) =>
                                        setCustomRange({
                                            ...customRange,
                                            endDate: e.target.value,
                                        })
                                    }
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                />
                            </div>
                            <div className="flex justify-between">
                                <button
                                    onClick={() => setIsCustom(false)}
                                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={applyCustomRange}
                                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    Apply
                                </button>
                            </div>
                        </div>
                    ) : (
                        predefinedRanges.map((range, index) => (
                            <Menu.Item key={index}>
                                {({ active }) => (
                                    <button
                                        className={`${
                                            active
                                                ? "bg-blue-50 text-blue-700"
                                                : "text-gray-700"
                                        } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                        onClick={range.action}
                                    >
                                        {range.label}
                                    </button>
                                )}
                            </Menu.Item>
                        ))
                    )}
                </div>
            </Menu.Items>
        </Menu>
    );
};

export default DateRangePicker;
