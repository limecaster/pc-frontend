import React, {
    createContext,
    useState,
    useContext,
    useEffect,
    ReactNode,
} from "react";
import {
    getWishlist,
    addToWishlist as apiAddToWishlist,
    removeFromWishlist as apiRemoveFromWishlist,
} from "@/api/wishlist";
import { validateTokenFormat, handleAuthError } from "@/api/auth";
import { toast } from "react-hot-toast";
import { useAuth } from "./AuthContext";

interface WishlistContextType {
    wishlistItems: string[];
    isInWishlist: (productId: string) => boolean;
    addToWishlist: (productId: string) => Promise<void>;
    removeFromWishlist: (productId: string) => Promise<void>;
    loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(
    undefined,
);

export function useWishlist() {
    const context = useContext(WishlistContext);
    if (context === undefined) {
        throw new Error("useWishlist must be used within a WishlistProvider");
    }
    return context;
}

interface WishlistProviderProps {
    children: ReactNode;
}

export function WishlistProvider({ children }: WishlistProviderProps) {
    const [wishlistItems, setWishlistItems] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const { logout } = useAuth();

    const fetchWishlist = async () => {
        if (!localStorage.getItem("token") || !validateTokenFormat()) {
            setWishlistItems([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const data = await getWishlist();

            // Extract just the product IDs for easier checking
            const productIds = data.map((item: any) => item.product_id);
            setWishlistItems(productIds);
        } catch (error: any) {
            console.error("Error fetching wishlist:", error);

            // Check if this is an authentication error (401)
            if (
                error.message &&
                (error.message.includes("Authentication failed") ||
                    error.message.includes("Token expired") ||
                    error.message.includes("Invalid token"))
            ) {
                logout("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
            }

            setWishlistItems([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, []);

    const isInWishlist = (productId: string) => {
        return wishlistItems.includes(productId);
    };

    const addToWishlist = async (productId: string) => {
        if (!localStorage.getItem("token") || !validateTokenFormat()) {
            toast.error("Vui lòng đăng nhập để sử dụng tính năng này!", {
                duration: 3000,
            });
            return;
        }

        try {
            await apiAddToWishlist(productId);
            setWishlistItems([...wishlistItems, productId]);
            toast.success("Đã thêm sản phẩm vào danh sách yêu thích!", {
                duration: 3000,
            });
        } catch (error: any) {
            console.error("Error adding to wishlist:", error);

            // Check if this is an authentication error (401)
            if (
                error.message &&
                (error.message.includes("Authentication failed") ||
                    error.message.includes("Token expired") ||
                    error.message.includes("Invalid token") ||
                    error.message.includes("Authentication required"))
            ) {
                logout("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
                return;
            }

            toast.error(
                "Không thể thêm vào danh sách yêu thích. Vui lòng thử lại!",
            );
        }
    };

    const removeFromWishlist = async (productId: string) => {
        if (!localStorage.getItem("token") || !validateTokenFormat()) {
            toast.error("Vui lòng đăng nhập để sử dụng tính năng này!", {
                duration: 3000,
            });
            return;
        }

        try {
            await apiRemoveFromWishlist(productId);
            setWishlistItems(wishlistItems.filter((id) => id !== productId));
            toast.success("Đã xóa sản phẩm khỏi danh sách yêu thích!", {
                duration: 3000,
            });
        } catch (error: any) {
            console.error("Error removing from wishlist:", error);

            // Check if this is an authentication error (401)
            if (
                error.message &&
                (error.message.includes("Authentication failed") ||
                    error.message.includes("Token expired") ||
                    error.message.includes("Invalid token") ||
                    error.message.includes("Authentication required"))
            ) {
                logout("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
                return;
            }

            toast.error(
                "Không thể xóa khỏi danh sách yêu thích. Vui lòng thử lại!",
            );
        }
    };

    const value = {
        wishlistItems,
        isInWishlist,
        addToWishlist,
        removeFromWishlist,
        loading,
    };

    return (
        <WishlistContext.Provider value={value}>
            {children}
        </WishlistContext.Provider>
    );
}
