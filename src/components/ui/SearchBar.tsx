"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { getSearchSuggestions } from "@/api/product";

interface SearchBarProps {
    placeholder?: string;
    className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
    placeholder = "Tìm kiếm sản phẩm...",
    className = "",
}) => {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const router = useRouter();
    const suggestionsRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Fetch suggestions when query changes
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (query.length < 2) {
                setSuggestions([]);
                return;
            }

            setIsLoading(true);
            try {
                const results = await getSearchSuggestions(query);
                console.log("Suggestions received:", results); // Debug log
                setSuggestions(results || []);
                setShowSuggestions(results && results.length > 0);
            } catch (error) {
                console.error("Error fetching suggestions:", error);
                setSuggestions([]);
            } finally {
                setIsLoading(false);
            }
        };

        // Debounce suggestions fetching
        const timer = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(timer);
    }, [query]);

    // Close suggestions on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                suggestionsRef.current &&
                !suggestionsRef.current.contains(e.target as Node) &&
                inputRef.current &&
                !inputRef.current.contains(e.target as Node)
            ) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
        setShowSuggestions(false);
    };

    const handleSuggestionClick = (suggestion: string) => {
        setQuery(suggestion);
        router.push(`/search?q=${encodeURIComponent(suggestion)}`);
        setShowSuggestions(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        // Handle keyboard navigation in suggestions
        if (showSuggestions && suggestions.length > 0) {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedIndex((prev) =>
                    prev < suggestions.length - 1 ? prev + 1 : 0,
                );
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedIndex((prev) =>
                    prev > 0 ? prev - 1 : suggestions.length - 1,
                );
            } else if (e.key === "Enter" && selectedIndex >= 0) {
                e.preventDefault();
                handleSuggestionClick(suggestions[selectedIndex]);
            } else if (e.key === "Escape") {
                setShowSuggestions(false);
            }
        }
    };

    return (
        <div className={`relative w-full ${className} text-gray-800`}>
            <form onSubmit={handleSearch} className="relative flex w-full">
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() =>
                        query.length >= 2 && setShowSuggestions(true)
                    }
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="w-full px-4 py-2 pl-10 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    {isLoading ? (
                        <FontAwesomeIcon
                            icon={faSpinner}
                            className="text-gray-400 animate-spin"
                        />
                    ) : (
                        <FontAwesomeIcon
                            icon={faSearch}
                            className="text-gray-400"
                        />
                    )}
                </div>
                <button
                    type="submit"
                    className="absolute right-0 top-0 bottom-0 px-4 bg-secondary text-white font-medium rounded-r-md hover:bg-primary-dark transition-colors"
                >
                    Tìm
                </button>
            </form>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
                <div
                    ref={suggestionsRef}
                    className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
                >
                    <ul>
                        {suggestions.map((suggestion, index) => (
                            <li
                                key={index}
                                className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 ${
                                    index === selectedIndex ? "bg-gray-100" : ""
                                }`}
                                onClick={() =>
                                    handleSuggestionClick(suggestion)
                                }
                            >
                                {suggestion}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default SearchBar;
