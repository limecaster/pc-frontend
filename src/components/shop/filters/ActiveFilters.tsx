import React from "react";
import { Cross2Icon } from "@radix-ui/react-icons";

interface ActiveFilterProps {
    text: string;
    onRemove: () => void;
}

const ActiveFilter: React.FC<ActiveFilterProps> = ({ text, onRemove }) => {
    return (
        <div className="inline-flex items-center gap-2 py-1 px-2 bg-gray-100 rounded">
            <div className="grid grid-cols-1 text-sm font-normal leading-5">
                {text}
            </div>
            <button onClick={onRemove} type="button">
                <Cross2Icon className="w-4 h-4" />
            </button>
        </div>
    );
};

interface ActiveFiltersProps {
    filters: { id: string; text: string }[];
    onRemoveFilter: (id: string) => void;
}

const ActiveFilters: React.FC<ActiveFiltersProps> = ({
    filters,
    onRemoveFilter,
}) => {
    return (
        <>
            {filters.map((filter) => (
                <ActiveFilter
                    key={filter.id}
                    text={filter.text}
                    onRemove={() => onRemoveFilter(filter.id)}
                />
            ))}
        </>
    );
};

export default ActiveFilters;
