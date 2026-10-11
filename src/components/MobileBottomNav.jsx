
import { NavLink, useNavigate } from "react-router-dom";
import {
  House,
  LayoutGrid,
  Heart,
  ShoppingBag,
  UserRound,
} from "lucide-react";

import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { supabase } from "../lib/supabaseClient";
import { useEffect, useState } from "react";

export default function MobileBottomNav() {
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    let active = true;

    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (active) {
        setIsSignedIn(Boolean(data.session?.user));
      }
    };

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) {
        setIsSignedIn(Boolean(session?.user));
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const items = [
    {
      label: "Home",
      to: "/",
      icon: House,
      end: true,
    },
    {
      label: "Shop",
      to: "/shop",
      icon: LayoutGrid,
    },
    {
      label: "Wishlist",
      to: "/wishlist",
      icon: Heart,
      badge: wishlistCount,
    },
    {
      label: "Cart",
      to: "/cart",
      icon: ShoppingBag,
      badge: cartCount,
    },
    {
      label: "Account",
      to: isSignedIn ? "/my-account" : "/login",
      icon: UserRound,
    },
  ];

  return (
    <nav
      aria-label="Mobile bottom navigation"
      className="fixed inset-x-0 bottom-0 z-[90] border-t border-[#E8E1D3] bg-cream/95 shadow-[0_-5px_24px_rgba(23,63,42,0.08)] backdrop-blur-xl xl:hidden"
      style={{
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div className="mx-auto grid h-[66px] max-w-lg grid-cols-5 items-stretch px-1">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.end}
              aria-label={item.label}
              className={({ isActive }) =>
                `relative flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl transition-colors ${
                  isActive
                    ? "text-[#285C3A]"
                    : "text-[#777D71] hover:text-[#285C3A]"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`relative flex h-7 w-9 items-center justify-center rounded-full transition-colors ${
                      isActive ? "bg-[#E7F0E8]" : ""
                    }`}
                  >
                    <Icon
                      size={21}
                      strokeWidth={isActive ? 2.2 : 1.7}
                      className={
                        item.label === "Wishlist" && isActive
                          ? "fill-[#E7F0E8]"
                          : ""
                      }
                    />

                    {Number(item.badge) > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#C79A3B] px-1 text-[9px] font-bold text-white ring-2 ring-cream">
                        {item.badge > 99 ? "99+" : item.badge}
                      </span>
                    )}
                  </span>

                  <span
                    className={`max-w-full truncate text-[10px] leading-3 ${
                      isActive ? "font-bold" : "font-medium"
                    }`}
                  >
                    {item.label}
                  </span>

                  {isActive && (
                    <span className="absolute bottom-0 h-[3px] w-6 rounded-t-full bg-[#285C3A]" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
