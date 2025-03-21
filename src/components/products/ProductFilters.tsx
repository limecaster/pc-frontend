import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { fetchSubcategoryValues } from "@/api/product";

const ProductFilters: React.FC = () => {
    const router = useRouter();
    const { query } = router;
    const [subcategoryValues, setSubcategoryValues] = useState<
        Record<string, string[]>
    >({});
    const [loadingSubcategories, setLoadingSubcategories] = useState<
        Record<string, boolean>
    >({});

    useEffect(() => {
        const fetchSubcategories = async () => {
            const category = query.category as string;
            if (!category) return;

            const subcategories = [
                "manufacturer",
                "socket",
                "chipset",
                "moduleSize",
                "type",
            ]; // Add more subcategories as needed
            for (const subcategory of subcategories) {
                setLoadingSubcategories((prev) => ({
                    ...prev,
                    [subcategory]: true,
                }));
                try {
                    const values = await fetchSubcategoryValues(
                        category,
                        subcategory,
                    );
                    setSubcategoryValues((prev) => ({
                        ...prev,
                        [subcategory]: values,
                    }));
                } catch (error) {
                    console.error(
                        `Error fetching ${subcategory} values for ${category}:`,
                        error,
                    );
                } finally {
                    setLoadingSubcategories((prev) => ({
                        ...prev,
                        [subcategory]: false,
                    }));
                }
            }
        };

        fetchSubcategories();
    }, [query.category]);

    const handleSubcategoryFilterChange = (
        key: string,
        value: string,
        isChecked: boolean,
    ) => {
        const url = new URL(window.location.href);
        let subcategoryFilters: Record<string, string[]> = {};

        const subcategoriesParam = url.searchParams.get("subcategories");
        if (subcategoriesParam) {
            try {
                subcategoryFilters = JSON.parse(
                    decodeURIComponent(subcategoriesParam),
                );
            } catch (e) {
                console.error("Error parsing subcategory filters:", e);
            }
        }

        if (!subcategoryFilters[key]) {
            subcategoryFilters[key] = [];
        }

        if (isChecked) {
            if (!subcategoryFilters[key].includes(value)) {
                subcategoryFilters[key].push(value);
            }
        } else {
            subcategoryFilters[key] = subcategoryFilters[key].filter(
                (v) => v !== value,
            );
            if (subcategoryFilters[key].length === 0) {
                delete subcategoryFilters[key];
            }
        }

        if (Object.keys(subcategoryFilters).length > 0) {
            url.searchParams.set(
                "subcategories",
                encodeURIComponent(JSON.stringify(subcategoryFilters)),
            );
        } else {
            url.searchParams.delete("subcategories");
        }

        url.searchParams.set("page", "1");
        window.location.href = url.toString();
    };

    return (
        <div>
            {Object.keys(subcategoryValues).map((key) => (
                <div key={key}>
                    <h4>{key}</h4>
                    {loadingSubcategories[key] ? (
                        <p>Loading...</p>
                    ) : (
                        subcategoryValues[key].map((value) => (
                            <div key={value}>
                                <input
                                    type="checkbox"
                                    id={`${key}-${value}`}
                                    name={key}
                                    value={value}
                                    onChange={(e) =>
                                        handleSubcategoryFilterChange(
                                            key,
                                            value,
                                            e.target.checked,
                                        )
                                    }
                                />
                                <label htmlFor={`${key}-${value}`}>
                                    {value}
                                </label>
                            </div>
                        ))
                    )}
                </div>
            ))}
        </div>
    );
};

export default ProductFilters;
