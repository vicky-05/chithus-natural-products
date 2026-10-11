
import { Heart } from "lucide-react";
import { useWishlist } from "../context/WishlistContext";

export default function WishlistButton({
  product,
  className = "",
}) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const saved = isWishlisted(product.id);

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleWishlist(product);
      }}
      aria-label={
        saved
          ? `Remove ${product.name} from wishlist`
          : `Add ${product.name} to wishlist`
      }
      aria-pressed={saved}
      className={`flex h-10 w-10 items-center justify-center rounded-full bg-[#FFFDF7]/95 shadow-md transition hover:scale-110 ${className}`}
    >
      <Heart
        size={20}
        className={
          saved
            ? "fill-[#B94A48] text-[#B94A48]"
            : "text-[#285C3A]"
        }
      />
    </button>
  );
}
