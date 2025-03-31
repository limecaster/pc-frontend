"use client";

import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBug,
    faToggleOn,
    faToggleOff,
    faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { toggleEventDebug } from "@/api/events";

interface EventLog {
    timestamp: string;
    eventType: string;
    data: any;
}

const EventMonitor: React.FC = () => {
    const [events, setEvents] = useState<EventLog[]>([]);
    const [isDebugMode, setIsDebugMode] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        // Check initial debug mode state
        setIsDebugMode(localStorage.getItem("debug_events") === "true");

        // Set up listener for events
        const originalConsoleLog = console.log;
        const originalConsoleGroup = console.group;
        const originalConsoleGroupEnd = console.groupEnd;

        let currentGroup = "";

        console.group = function (groupTitle) {
            currentGroup = groupTitle;
            // Convert arguments to array to avoid TypeScript errors
            originalConsoleGroup.apply(console, Array.from(arguments));
        };

        console.groupEnd = function () {
            currentGroup = "";
            originalConsoleGroupEnd.call(console);
        };

        console.log = function () {
            // Convert arguments to array to avoid TypeScript errors
            originalConsoleLog.apply(console, Array.from(arguments));

            // Only capture event tracking logs
            if (currentGroup && currentGroup.startsWith("Event:")) {
                const eventType = currentGroup.replace("Event:", "").trim();

                if (arguments[0] === "Event data:" && arguments.length > 1) {
                    setEvents((prev) => [
                        {
                            timestamp: new Date().toISOString(),
                            eventType,
                            data: JSON.parse(JSON.stringify(arguments[1])),
                        },
                        ...prev.slice(0, 19),
                    ]); // Keep last 20 events
                }
            }
        };

        return () => {
            // Restore original console methods
            console.log = originalConsoleLog;
            console.group = originalConsoleGroup;
            console.groupEnd = originalConsoleGroupEnd;
        };
    }, []);

    const handleToggleDebug = () => {
        const newState = toggleEventDebug();
        setIsDebugMode(newState);
    };

    const clearEvents = () => {
        setEvents([]);
    };

    if (!isExpanded) {
        return (
            <div
                className="fixed bottom-4 right-4 bg-gray-800 text-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-gray-700 z-50"
                onClick={() => setIsExpanded(true)}
            >
                <FontAwesomeIcon icon={faBug} size="lg" />
            </div>
        );
    }

    return (
        <div className="fixed bottom-4 right-4 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 flex flex-col">
            <div className="p-3 bg-gray-100 rounded-t-lg flex justify-between items-center">
                <div className="font-medium flex items-center">
                    <FontAwesomeIcon
                        icon={faBug}
                        className="mr-2 text-gray-700"
                    />
                    <span>Event Monitor</span>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleToggleDebug}
                        className={`p-1 rounded ${isDebugMode ? "text-green-600" : "text-gray-500"}`}
                        title={
                            isDebugMode
                                ? "Disable Debug Mode"
                                : "Enable Debug Mode"
                        }
                    >
                        <FontAwesomeIcon
                            icon={isDebugMode ? faToggleOn : faToggleOff}
                        />
                    </button>
                    <button
                        onClick={clearEvents}
                        className="p-1 text-gray-500 hover:text-red-500 rounded"
                        title="Clear Events"
                    >
                        <FontAwesomeIcon icon={faTrash} />
                    </button>
                    <button
                        onClick={() => setIsExpanded(false)}
                        className="p-1 text-gray-500 hover:text-gray-700 rounded"
                    >
                        ×
                    </button>
                </div>
            </div>

            <div className="p-2 overflow-auto flex-grow">
                {isDebugMode ? (
                    events.length > 0 ? (
                        <div className="space-y-2">
                            {events.map((evt, i) => (
                                <div
                                    key={i}
                                    className="border border-gray-200 rounded p-2 text-xs"
                                >
                                    <div className="font-medium pb-1 flex justify-between">
                                        <span className="text-blue-600">
                                            {evt.eventType}
                                        </span>
                                        <span className="text-gray-500">
                                            {new Date(
                                                evt.timestamp,
                                            ).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <div className="bg-gray-50 p-1 rounded">
                                        <pre className="whitespace-pre-wrap break-words text-gray-700">
                                            {JSON.stringify(evt.data, null, 2)}
                                        </pre>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-4 text-sm text-gray-500">
                            No events captured yet. Interact with the site to
                            generate events.
                        </div>
                    )
                ) : (
                    <div className="text-center py-4 text-sm text-gray-500">
                        Debug mode is disabled. Enable it to monitor events.
                    </div>
                )}
            </div>

            <div className="p-2 border-t text-xs text-gray-500">
                Events are stored in User_Behaviour table via Kafka
            </div>
        </div>
    );
};

export default EventMonitor;
