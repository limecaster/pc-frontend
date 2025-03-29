import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faTrash,
    faSearch,
    faPlus,
    faArrowUp,
    faArrowDown,
    faTimes,
    faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import {
    getHotSalesProducts,
    removeFromHotSales,
    updateHotSalesOrder,
    addToHotSales,
} from "@/api/hot-sales";
import { getSimpleProductList } from "@/api/admin-products";
import { formatPrice } from "@/utils/format";
import { ProductDetailsDto } from "@/types/product";
import debounce from "lodash.debounce";

// Enhanced product interface for search results
interface SearchProductResult {
    id: string;
    name: string;
    price?: number;
    imageUrl?: string;
    isDiscounted?: boolean;
    discountPercentage?: number;
}

const HotSalesManager = () => {
    const [products, setProducts] = useState<ProductDetailsDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [productList, setProductList] = useState<
        { id: string; name: string }[]
    >([]);
    const [searchResults, setSearchResults] = useState<SearchProductResult[]>(
        [],
    );
    const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
    const [showProductSearch, setShowProductSearch] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchPage, setSearchPage] = useState(1);
    const [totalSearchPages, setTotalSearchPages] = useState(1);
    const [totalSearchResults, setTotalSearchResults] = useState(0);

    useEffect(() => {
        fetchHotSalesProducts();
    }, []);

    const fetchHotSalesProducts = async () => {
        try {
            setLoading(true);
            const data = await getHotSalesProducts();
            setProducts(data);
        } catch (error) {
            console.error("Error fetching hot sales products:", error);
            toast.error("Failed to load hot sales products");
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveProduct = async (productId: string) => {
        try {
            await removeFromHotSales(productId);
            toast.success("Product removed from hot sales");
            fetchHotSalesProducts();
        } catch (error) {
            console.error("Error removing product:", error);
            toast.error("Failed to remove product");
        }
    };

    // Replace drag-drop with move up/down functions
    const moveItem = async (index: number, direction: "up" | "down") => {
        if (
            (direction === "up" && index === 0) ||
            (direction === "down" && index === products.length - 1)
        ) {
            return; // Can't move beyond array bounds
        }

        const newProducts = [...products];
        const targetIndex = direction === "up" ? index - 1 : index + 1;

        // Swap items
        [newProducts[index], newProducts[targetIndex]] = [
            newProducts[targetIndex],
            newProducts[index],
        ];

        setProducts(newProducts);

        // Update display orders in database
        try {
            const updates = newProducts.map((product, idx) =>
                updateHotSalesOrder(product.id, idx),
            );
            await Promise.all(updates);
            toast.success("Display order updated");
        } catch (error) {
            console.error("Error updating display order:", error);
            toast.error("Failed to update display order");
            fetchHotSalesProducts(); // Revert to original order
        }
    };

    const debouncedSearch = useCallback(
        debounce(async (query: string, page: number = 1) => {
            if (!query.trim() && page === 1) {
                setSearchResults([]);
                setTotalSearchPages(1);
                setTotalSearchResults(0);
                setSearchLoading(false);
                return;
            }

            try {
                setSearchLoading(true);
                const limit = 10; // Items per page
                const { products, total, pages } = await getSimpleProductList(
                    query,
                    page,
                    limit,
                );

                // Fetch additional product details for each product in the search results
                const enhancedProducts = await Promise.all(
                    products.map(async (product) => {
                        // You can make additional API calls here to get more product details if needed
                        // For example: const details = await getProductDetails(product.id);
                        // For now, we'll just return the basic info
                        return {
                            id: product.id,
                            name: product.name,
                            // Add more fields as needed - these would come from your detailed product API
                        } as SearchProductResult;
                    }),
                );

                // If we're on page 1, replace results, otherwise append
                if (page === 1) {
                    setSearchResults(enhancedProducts);
                } else {
                    setSearchResults((prev) => [...prev, ...enhancedProducts]);
                }

                setTotalSearchPages(pages);
                setTotalSearchResults(total);
            } catch (error) {
                console.error("Error searching products:", error);
                toast.error("Failed to search products");
            } finally {
                setSearchLoading(false);
            }
        }, 500),
        [],
    );

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        setSearchPage(1); // Reset to first page on new search
        debouncedSearch(query, 1);
    };

    const handleLoadMoreResults = () => {
        const nextPage = searchPage + 1;
        if (nextPage <= totalSearchPages) {
            setSearchPage(nextPage);
            debouncedSearch(searchQuery, nextPage);
        }
    };

    const handleShowProductSearch = () => {
        setShowProductSearch(true);
        setSearchQuery("");
        setSearchResults([]);
        setSearchPage(1);
    };

    const handleCloseProductSearch = () => {
        setShowProductSearch(false);
        setSearchQuery("");
        setSearchResults([]);
    };

    const handleAddToHotSales = async (productId: string) => {
        try {
            await addToHotSales(productId, products.length);
            toast.success("Product added to hot sales");
            setShowProductSearch(false);
            setSearchQuery("");
            fetchHotSalesProducts();
        } catch (error) {
            console.error("Error adding product:", error);
            toast.error("Failed to add product");
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Hot Sales Products</h2>
                <button
                    onClick={handleShowProductSearch}
                    className="bg-primary text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-blue-600"
                >
                    <FontAwesomeIcon icon={faPlus} />
                    Add Product
                </button>
            </div>

            {showProductSearch && (
                <div className="mb-6 p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-medium">
                            Add Product to Hot Sales
                        </h3>
                        <button
                            onClick={handleCloseProductSearch}
                            className="text-gray-500 hover:text-gray-700"
                            aria-label="Close search"
                        >
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </div>

                    <div className="relative mb-4">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            placeholder="Search for products by name..."
                            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            {searchLoading ? (
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
                    </div>

                    {searchResults.length > 0 ? (
                        <div className="border border-gray-200 rounded-md">
                            <div className="max-h-80 overflow-y-auto">
                                <ul className="divide-y divide-gray-200">
                                    {searchResults.map((product) => (
                                        <li
                                            key={product.id}
                                            className="p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                                            onClick={() =>
                                                handleAddToHotSales(product.id)
                                            }
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    {product.imageUrl && (
                                                        <div className="relative h-10 w-10 mr-3">
                                                            <Image
                                                                src={
                                                                    product.imageUrl
                                                                }
                                                                alt={
                                                                    product.name
                                                                }
                                                                fill
                                                                className="object-cover rounded-md"
                                                            />
                                                        </div>
                                                    )}
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-gray-900 text-sm">
                                                            {product.name}
                                                        </h4>
                                                        {product.price && (
                                                            <div className="text-xs text-gray-500">
                                                                {formatPrice(
                                                                    product.price,
                                                                )}
                                                                {product.isDiscounted &&
                                                                    product.discountPercentage && (
                                                                        <span className="ml-2 text-green-600">
                                                                            (
                                                                            {
                                                                                product.discountPercentage
                                                                            }
                                                                            %
                                                                            off)
                                                                        </span>
                                                                    )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <button
                                                    className="text-primary hover:text-blue-700 ml-4"
                                                    title="Add to hot sales"
                                                >
                                                    <FontAwesomeIcon
                                                        icon={faPlus}
                                                    />
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {searchPage < totalSearchPages && (
                                <div className="p-3 border-t border-gray-200 text-center">
                                    <button
                                        onClick={handleLoadMoreResults}
                                        className="text-primary hover:text-blue-700 text-sm font-medium"
                                        disabled={searchLoading}
                                    >
                                        {searchLoading ? (
                                            <>
                                                <FontAwesomeIcon
                                                    icon={faSpinner}
                                                    className="animate-spin mr-2"
                                                />
                                                Loading...
                                            </>
                                        ) : (
                                            `Load more (${totalSearchResults - searchResults.length} remaining)`
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-gray-500 border border-gray-200 rounded-md">
                            {searchLoading ? (
                                <div className="flex flex-col items-center">
                                    <FontAwesomeIcon
                                        icon={faSpinner}
                                        className="text-primary animate-spin text-xl mb-2"
                                    />
                                    <p>Searching products...</p>
                                </div>
                            ) : searchQuery ? (
                                <p>
                                    No products found matching "{searchQuery}"
                                </p>
                            ) : (
                                <p>Start typing to search for products</p>
                            )}
                        </div>
                    )}
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
            ) : products.length > 0 ? (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                                    Order
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Product
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Price
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Discount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {products.map((product, index) => (
                                <tr key={product.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center space-x-2">
                                            <span className="mr-2">
                                                {index + 1}
                                            </span>
                                            <div className="flex flex-col">
                                                <button
                                                    onClick={() =>
                                                        moveItem(index, "up")
                                                    }
                                                    disabled={index === 0}
                                                    className={`p-1 ${index === 0 ? "text-gray-300 cursor-not-allowed" : "text-gray-600 hover:text-primary"}`}
                                                >
                                                    <FontAwesomeIcon
                                                        icon={faArrowUp}
                                                        size="xs"
                                                    />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        moveItem(index, "down")
                                                    }
                                                    disabled={
                                                        index ===
                                                        products.length - 1
                                                    }
                                                    className={`p-1 ${index === products.length - 1 ? "text-gray-300 cursor-not-allowed" : "text-gray-600 hover:text-primary"}`}
                                                >
                                                    <FontAwesomeIcon
                                                        icon={faArrowDown}
                                                        size="xs"
                                                    />
                                                </button>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="relative h-10 w-10 mr-3">
                                                {product.imageUrl && (
                                                    <Image
                                                        src={product.imageUrl}
                                                        alt={product.name}
                                                        fill
                                                        className="object-cover rounded-md"
                                                    />
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">
                                                    {product.name}
                                                </div>
                                                <div className="text-gray-500 text-sm">
                                                    ID:{" "}
                                                    {product.id.substring(0, 8)}
                                                    ...
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-medium">
                                            {formatPrice(product.price)}
                                        </div>
                                        {product.originalPrice && (
                                            <div className="text-gray-500 text-sm line-through">
                                                {formatPrice(
                                                    product.originalPrice,
                                                )}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {product.isDiscounted ? (
                                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                                                {product.discountPercentage}%
                                                OFF
                                            </span>
                                        ) : (
                                            <span className="text-gray-500 text-sm">
                                                No discount
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() =>
                                                handleRemoveProduct(product.id)
                                            }
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-500 mb-4">
                        No hot sales products found.
                    </p>
                    <button
                        onClick={handleShowProductSearch}
                        className="bg-primary text-white px-4 py-2 rounded-md"
                    >
                        Add Your First Hot Sale Product
                    </button>
                </div>
            )}
        </div>
    );
};

export default HotSalesManager;
