
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const WishlistContext = createContext(null);
const STORAGE_KEY = "chithus-wishlist";

function getSavedWishlist() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) return [];

    const parsed = JSON.parse(saved);

    // Support both the previous ID-only format and product objects.
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item) => {
        if (item && typeof item === "object" && item.id != null) {
          return item;
        }

        // Legacy IDs cannot be converted into product objects here.
        return null;
      })
      .filter(Boolean);
  } catch (error) {
    console.error("Unable to read saved wishlist:", error);
    return [];
  }
}

export function WishlistProvider({ children }) {
  const [wishlistItems, setWishlistItems] = useState(getSavedWishlist);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(wishlistItems),
      );
    } catch (error) {
      console.error("Unable to save wishlist:", error);
    }
  }, [wishlistItems]);

  const wishlistIds = useMemo(
    () => wishlistItems.map((product) => product.id),
    [wishlistItems],
  );

  const toggleWishlist = useCallback((product) => {
    if (!product || product.id == null) {
      console.error("Cannot wishlist a product without an ID.");
      return;
    }

    setWishlistItems((current) => {
      const exists = current.some(
        (item) => item.id === product.id,
      );

      if (exists) {
        return current.filter(
          (item) => item.id !== product.id,
        );
      }

      return [
        ...current,
        {
          ...product,
          image:
            product.image ||
            product.displayImage ||
            product.product_images?.[0]?.image_url ||
            null,
        },
      ];
    });
  }, []);

  const removeFromWishlist = useCallback((productId) => {
    setWishlistItems((current) =>
      current.filter((product) => product.id !== productId),
    );
  }, []);

  const isWishlisted = useCallback(
    (productId) =>
      wishlistItems.some(
        (product) => product.id === productId,
      ),
    [wishlistItems],
  );

  const clearWishlist = useCallback(() => {
    setWishlistItems([]);
  }, []);

  const value = useMemo(
    () => ({
      wishlistIds,
      wishlistItems,
      wishlistCount: wishlistItems.length,
      toggleWishlist,
      removeFromWishlist,
      isWishlisted,
      clearWishlist,
    }),
    [
      wishlistIds,
      wishlistItems,
      toggleWishlist,
      removeFromWishlist,
      isWishlisted,
      clearWishlist,
    ],
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error(
      "useWishlist must be used inside WishlistProvider",
    );
  }

  return context;
}
