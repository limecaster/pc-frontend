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
        startDate: formatDateForInput(value.startDate),
        endDate: formatDateForInput(value.endDate),
    });

    // Format date for display
    const formatDateForDisplay = (date: Date): string => {
        return new Intl.DateTimeFormat("vi-VN", {
            day: "numeric",
            month: "numeric",
            year: "numeric",
        }).format(date);
    };

    // Format date for input element (YYYY-MM-DD)
    function formatDateForInput(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    // Parse date with time set to beginning or end of day
    function parseDate(dateString: string, isEndDate: boolean = false): Date {
        const date = new Date(dateString);

        // Make sure we have a valid date
        if (isNaN(date.getTime())) {
            return new Date();
        }

        // Set time to beginning or end of day
        if (isEndDate) {
            date.setHours(23, 59, 59, 999);
        } else {
            date.setHours(0, 0, 0, 0);
        }

        return date;
    }

    const getDisplayText = (): string => {
        return `${formatDateForDisplay(value.startDate)} - ${formatDateForDisplay(value.endDate)}`;
    };

    const applyCustomRange = () => {
        const newStartDate = parseDate(customRange.startDate);
        const newEndDate = parseDate(customRange.endDate, true);

        // Validate dates
        if (newStartDate > newEndDate) {
            alert("Ngày bắt đầu không thể sau ngày kết thúc");
            return;
        }

        onChange({
            startDate: newStartDate,
            endDate: newEndDate,
        });
        setIsCustom(false);
    };

    const predefinedRanges = [
        {
            label: "Hôm nay",
            action: () => {
                const today = new Date();
                // Set time to beginning and end of day for consistency
                const start = new Date(today);
                start.setHours(0, 0, 0, 0);
                const end = new Date(today);
                end.setHours(23, 59, 59, 999);
                onChange({ startDate: start, endDate: end });
            },
        },
        {
            label: "7 ngày qua",
            action: () => {
                const end = new Date();
                end.setHours(23, 59, 59, 999);
                const start = new Date();
                start.setDate(start.getDate() - 6);
                start.setHours(0, 0, 0, 0);
                onChange({ startDate: start, endDate: end });
            },
        },
        {
            label: "30 ngày qua",
            action: () => {
                const end = new Date();
                end.setHours(23, 59, 59, 999);
                const start = new Date();
                start.setDate(start.getDate() - 29);
                start.setHours(0, 0, 0, 0);
                onChange({ startDate: start, endDate: end });
            },
        },
        {
            label: "Tháng này",
            action: () => {
                const now = new Date();
                const start = new Date(now.getFullYear(), now.getMonth(), 1);
                start.setHours(0, 0, 0, 0);
                const end = new Date();
                end.setHours(23, 59, 59, 999);
                onChange({ startDate: start, endDate: end });
            },
        },
        {
            label: "Quý hiện tại",
            action: () => {
                const now = new Date();
                const quarter = Math.floor(now.getMonth() / 3);
                const start = new Date(now.getFullYear(), quarter * 3, 1);
                start.setHours(0, 0, 0, 0);
                const end = new Date();
                end.setHours(23, 59, 59, 999);
                onChange({ startDate: start, endDate: end });
            },
        },
        {
            label: "Năm nay",
            action: () => {
                const now = new Date();
                const start = new Date(now.getFullYear(), 0, 1);
                start.setHours(0, 0, 0, 0);
                const end = new Date();
                end.setHours(23, 59, 59, 999);
                onChange({ startDate: start, endDate: end });
            },
        },
        {
            label: "Tùy chỉnh...",
            action: () => {
                // Update custom range state with current selection
                setCustomRange({
                    startDate: formatDateForInput(value.startDate),
                    endDate: formatDateForInput(value.endDate),
                });
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Ngày bắt đầu
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
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                />
                            </div>
                            <div className="mb-3">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Ngày kết thúc
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
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                />
                            </div>
                            <div className="flex justify-between">
                                <button
                                    onClick={() => setIsCustom(false)}
                                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={applyCustomRange}
                                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    Áp dụng
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
