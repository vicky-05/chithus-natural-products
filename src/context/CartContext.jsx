
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const CartContext = createContext(null);

const CART_STORAGE_KEY = "chithus-cart";

const toNonNegativeNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : fallback;
};

const toPositiveInteger = (value, fallback = 1) => {
  const number = Math.floor(Number(value));
  return Number.isFinite(number) && number >= 1 ? number : fallback;
};

const normalizeCartItem = (item) => {
  if (
    !item ||
    typeof item.slug !== "string" ||
    typeof item.name !== "string"
  ) {
    return null;
  }

  return {
    ...item,
    id:
      item.id ||
      `${item.slug}-${item.variantId || item.selectedWeight || "default"}`,
    quantity: toPositiveInteger(item.quantity),
    price: toNonNegativeNumber(item.price),
    image: item.image || null,
    selectedWeight: item.selectedWeight || "",
    productId: item.productId || null,
    variantId: item.variantId || null,
    sku: item.sku || null,
    // null means stock is unknown; checkout must verify it.
    stockQuantity:
      item.stockQuantity == null
        ? null
        : toNonNegativeNumber(item.stockQuantity),
  };
};

const getInitialCart = () => {
  try {
    if (typeof window === "undefined") return [];

    const savedCart = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!savedCart) return [];

    const parsedCart = JSON.parse(savedCart);
    if (!Array.isArray(parsedCart)) return [];

    return parsedCart.map(normalizeCartItem).filter(Boolean);
  } catch (error) {
    console.error("Unable to load saved cart:", error);
    return [];
  }
};

const getVariantDetails = (product, selectedWeight) => {
  const variant =
    selectedWeight && typeof selectedWeight === "object"
      ? selectedWeight
      : {};

  const weight =
    typeof selectedWeight === "string"
      ? selectedWeight
      : variant.label ||
        variant.weight ||
        product.weight ||
        "";

  const price = toNonNegativeNumber(
    variant.price ?? product.price
  );

  const variantId =
    variant.variantId ||
    variant.variant_id ||
    variant.id ||
    product.variantId ||
    product.variant_id ||
    null;

  const stockValue =
    variant.stockQuantity ??
    variant.stock_quantity ??
    variant.stock ??
    product.stockQuantity ??
    product.stock_quantity ??
    null;

  return {
    weight,
    price,
    variantId,
    sku: variant.sku || product.sku || null,
    stockQuantity:
      stockValue == null
        ? null
        : toNonNegativeNumber(stockValue),
  };
};

const isSameCartItem = (item, candidate) => {
  // Product identity must match first.
  const sameProduct =
    item.productId && candidate.productId
      ? String(item.productId) === String(candidate.productId)
      : item.slug === candidate.slug;

  if (!sameProduct) return false;

  // Do not merge identified variants with unidentified variants.
  if (item.variantId || candidate.variantId) {
    return (
      Boolean(item.variantId) &&
      Boolean(candidate.variantId) &&
      String(item.variantId) === String(candidate.variantId)
    );
  }

  // Legacy cart compatibility when neither has a variant ID.
  return (
    String(item.selectedWeight || "") ===
    String(candidate.selectedWeight || "")
  );
};

const getAvailableStock = (item) => {
  if (item.stockQuantity == null) return null;
  return toNonNegativeNumber(item.stockQuantity);
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(getInitialCart);

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          CART_STORAGE_KEY,
          JSON.stringify(cartItems)
        );
      }
    } catch (error) {
      console.error("Unable to save cart:", error);
    }
  }, [cartItems]);

  const addToCart = useCallback(
    (product, quantity = 1, selectedWeight = null) => {
      if (!product?.slug || !product?.name) {
        console.error("Cannot add invalid product to cart.");
        return false;
      }

      const safeQuantity = Math.floor(Number(quantity));

      if (!Number.isFinite(safeQuantity) || safeQuantity < 1) {
        return false;
      }

      const details = getVariantDetails(product, selectedWeight);

      const candidate = {
        id: details.variantId
          ? `${product.slug}-${details.variantId}`
          : `${product.slug}-${details.weight || "default"}`,
        slug: product.slug,
        name: product.name,
        image: product.image || null,
        price: details.price,
        selectedWeight: details.weight,
        quantity: safeQuantity,
        productId:
          product.productId ||
          product.product_id ||
          product.id ||
          null,
        variantId: details.variantId,
        sku: details.sku,
        stockQuantity: details.stockQuantity,
      };

      let added = false;

      setCartItems((previousItems) => {
        const existingItem = previousItems.find((item) =>
          isSameCartItem(item, candidate)
        );

        if (existingItem) {
          const stock =
            details.stockQuantity ??
            getAvailableStock(existingItem);

          const requestedQuantity =
            existingItem.quantity + safeQuantity;

          if (stock != null && requestedQuantity > stock) {
            // Keep the cart unchanged when the requested amount
            // exceeds known stock.
            return previousItems;
          }

          added = true;

          return previousItems.map((item) =>
            item.id === existingItem.id
              ? {
                  ...item,
                  quantity: requestedQuantity,
                  price: candidate.price,
                  image: candidate.image || item.image,
                  productId: item.productId || candidate.productId,
                  variantId: item.variantId || candidate.variantId,
                  sku: item.sku || candidate.sku,
                  stockQuantity: stock,
                }
              : item
          );
        }

        const stock = getAvailableStock(candidate);

        if (stock != null && safeQuantity > stock) {
          return previousItems;
        }

        added = true;
        return [...previousItems, candidate];
      });

      // React state updates are asynchronous. This return value means
      // the request was accepted for processing, not a stock guarantee.
      return added;
    },
    []
  );

  const removeFromCart = useCallback((id) => {
    setCartItems((items) => items.filter((item) => item.id !== id));
  }, []);

  const updateQuantity = useCallback((id, quantity) => {
    const safeQuantity = Math.floor(Number(quantity));

    if (!Number.isFinite(safeQuantity) || safeQuantity < 1) {
      setCartItems((items) => items.filter((item) => item.id !== id));
      return;
    }

    setCartItems((items) =>
      items.map((item) => {
        if (item.id !== id) return item;

        const stock = getAvailableStock(item);

        if (stock != null && safeQuantity > stock) {
          return item;
        }

        return { ...item, quantity: safeQuantity };
      })
    );
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const cartCount = cartItems.reduce(
    (total, item) => total + (Number(item.quantity) || 0),
    0
  );

  const cartTotal = cartItems.reduce(
    (total, item) =>
      total +
      (Number(item.price) || 0) *
        (Number(item.quantity) || 0),
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
};
