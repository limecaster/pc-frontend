import React, { useState, useEffect } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faTrash,
    faSearch,
    faPlus,
    faArrowUp,
    faArrowDown,
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

const HotSalesManager = () => {
    const [products, setProducts] = useState<ProductDetailsDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [productList, setProductList] = useState<
        { id: string; name: string }[]
    >([]);
    const [searchResults, setSearchResults] = useState<
        { id: string; name: string }[]
    >([]);
    const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
    const [showProductSearch, setShowProductSearch] = useState(false);

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

    const handleShowProductSearch = async () => {
        setShowProductSearch(true);

        try {
            const { products } = await getSimpleProductList();
            setProductList(products);
            setSearchResults(products);
        } catch (error) {
            console.error("Error fetching products:", error);
            toast.error("Failed to load products");
        }
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (query.trim() === "") {
            setSearchResults(productList);
        } else {
            const filteredProducts = productList.filter((product) =>
                product.name.toLowerCase().includes(query.toLowerCase()),
            );
            setSearchResults(filteredProducts);
        }
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
                    <h3 className="font-medium mb-2">
                        Add Product to Hot Sales
                    </h3>
                    <div className="flex gap-2 mb-4">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={handleSearchChange}
                                placeholder="Search products..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <FontAwesomeIcon
                                icon={faSearch}
                                className="absolute right-3 top-3 text-gray-400"
                            />
                        </div>
                        <button
                            onClick={() => setShowProductSearch(false)}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                    </div>

                    <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md">
                        {searchResults.length > 0 ? (
                            <ul className="divide-y divide-gray-200">
                                {searchResults.map((product) => (
                                    <li
                                        key={product.id}
                                        className="p-2 hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                                        onClick={() =>
                                            handleAddToHotSales(product.id)
                                        }
                                    >
                                        <span>{product.name}</span>
                                        <button className="text-primary">
                                            <FontAwesomeIcon icon={faPlus} />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="p-4 text-center text-gray-500">
                                No products found
                            </p>
                        )}
                    </div>
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
