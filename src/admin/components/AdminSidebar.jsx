
import { NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    Package,
    Layers3,
    ShoppingCart,
    Users,
    Store,
    X,
    Settings,
    ExternalLink,
    ChartNoAxesCombined,
    Star,
    Megaphone,
    ChevronRight,
    Leaf,
    Sparkles,
    Mail,
} from "lucide-react";

import logo from "../../assets/chithus-navbar-logo.png";

const navigation = [
    {
        label: "OVERVIEW",
        items: [
            {
                name: "Dashboard",
                path: "/admin",
                icon: LayoutDashboard,
                end: true,
            },
        ],
    },
    {
        label: "STORE MANAGEMENT",
        items: [
            { name: "Products", path: "/admin/products", icon: Package },
            { name: "Categories", path: "/admin/categories", icon: Layers3 },
            { name: "Orders", path: "/admin/orders", icon: ShoppingCart },
            { name: "Customers", path: "/admin/customers", icon: Users },
            { name: "Reviews", path: "/admin/reviews", icon: Star },
            {
                name: "Announcements",
                path: "/admin/announcements",
                icon: Megaphone,
            },
            {
                name: "Newsletter",
                path: "/admin/newsletter",
                icon: Mail,
            },
            {
                name: "Advertisements",
                path: "/admin/advertisements",
                icon: Megaphone,
            },
        ],
    },
    {
        label: "INSIGHTS",
        items: [
            {
                name: "Reports & Analytics",
                path: "/admin/reports",
                icon: ChartNoAxesCombined,
            },
        ],
    },
    {
        label: "PREFERENCES",
        items: [
            { name: "Settings", path: "/admin/settings", icon: Settings },
        ],
    },
];

export default function AdminSidebar({ open, onClose }) {
    return (
        <>
            {/* Mobile backdrop */}
            {open && (
                <button
                    type="button"
                    aria-label="Close navigation"
                    onClick={onClose}
                    className="fixed inset-0 z-40 bg-[#17271b]/45 backdrop-blur-[2px] lg:hidden"
                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-[278px] flex-col border-r border-[#e8e8dc] bg-[#fffdf7] shadow-[12px_0_40px_rgba(31,55,36,0.04)] transition-transform duration-300 ease-out lg:translate-x-0 lg:shadow-none ${open ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                {/* Brand header */}
                <div className="relative overflow-hidden border-b border-[#eeede3] px-5 pb-5 pt-5">
                    <div className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-[#e8f0e5]/70 blur-2xl" />

                    <div className="relative flex items-center justify-between gap-3">
                        <NavLink
                            to="/admin"
                            end
                            onClick={onClose}
                            aria-label="Chithu's Natural Products admin home"
                            className="flex min-w-0 items-center gap-3"
                        >
                            <div className="flex h-[54px] w-[54px] shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#e9eadf] bg-white p-1.5 shadow-sm">
                                <img
                                    src={logo}
                                    alt="Chithu's Natural Products"
                                    className="h-full w-full object-contain"
                                />
                            </div>

                            <div className="min-w-0">
                                <h1 className="truncate text-[15px] font-extrabold tracking-tight text-[#244b32]">
                                    Chithu's
                                </h1>
                                <p className="mt-0.5 text-[11px] font-medium tracking-wide text-[#788273]">
                                    NATURAL PRODUCTS
                                </p>
                                <div className="mt-1.5 flex items-center gap-1.5">
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#6d9c64]" />
                                    <span className="text-[10px] font-semibold text-[#668061]">
                                        Store management
                                    </span>
                                </div>
                            </div>
                        </NavLink>

                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Close sidebar"
                            className="rounded-xl p-2 text-[#657365] transition hover:bg-[#edf1e8] lg:hidden"
                        >
                            <X size={19} />
                        </button>
                    </div>
                </div>

                {/* Navigation */}
                <nav
                    aria-label="Admin navigation"
                    className="flex-1 space-y-6 overflow-y-auto px-3.5 py-6"
                >
                    {navigation.map((group) => (
                        <div key={group.label}>
                            <p className="mb-2.5 px-3 text-[9px] font-extrabold tracking-[0.19em] text-[#9a9d8f]">
                                {group.label}
                            </p>

                            <div className="space-y-1">
                                {group.items.map((item) => {
                                    const Icon = item.icon;

                                    return (
                                        <NavLink
                                            key={item.path}
                                            to={item.path}
                                            end={item.end}
                                            onClick={onClose}
                                            className={({ isActive }) =>
                                                `group relative flex items-center gap-3 overflow-hidden rounded-xl px-3 py-3 text-[13px] font-medium transition-all duration-200 ${isActive
                                                    ? "bg-[#285b3b] text-white shadow-[0_4px_12px_rgba(40,91,59,0.16)]"
                                                    : "text-[#687467] hover:bg-[#edf1e8] hover:text-[#244b32]"
                                                }`
                                            }
                                        >
                                            {({ isActive }) => (
                                                <>
                                                    <span
                                                        className={`flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-lg transition-colors ${isActive
                                                            ? "bg-white/15 text-[#f5d58a]"
                                                            : "bg-transparent text-[#82907c] group-hover:bg-white group-hover:text-[#285b3b]"
                                                            }`}
                                                    >
                                                        <Icon size={17} strokeWidth={1.9} />
                                                    </span>

                                                    <span className="min-w-0 flex-1 truncate">
                                                        {item.name}
                                                    </span>

                                                    {item.name === "Announcements" && (
                                                        <span
                                                            className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold ${isActive
                                                                ? "bg-white/15 text-white"
                                                                : "bg-[#f1e6c9] text-[#8b6b29]"
                                                                }`}
                                                        >
                                                            NEW
                                                        </span>
                                                    )}

                                                    <ChevronRight
                                                        size={15}
                                                        className={`shrink-0 transition-all duration-200 ${isActive
                                                            ? "translate-x-0 opacity-80"
                                                            : "-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-60"
                                                            }`}
                                                    />
                                                </>
                                            )}
                                        </NavLink>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {/* Visit storefront */}
                    <div>
                        <p className="mb-2.5 px-3 text-[9px] font-extrabold tracking-[0.19em] text-[#9a9d8f]">
                            STOREFRONT
                        </p>

                        <NavLink
                            to="/"
                            onClick={onClose}
                            className="group flex items-center gap-3 rounded-xl border border-[#e8e9df] bg-white px-3 py-3 text-[13px] font-medium text-[#687467] transition hover:border-[#cbd8c7] hover:bg-[#f4f7f0] hover:text-[#244b32]"
                        >
                            <span className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-lg bg-[#edf1e8] text-[#285b3b] transition group-hover:bg-[#285b3b] group-hover:text-white">
                                <Store size={17} strokeWidth={1.9} />
                            </span>

                            <span className="flex-1">View Store</span>

                            <ExternalLink
                                size={14}
                                className="text-[#92998d] transition group-hover:text-[#285b3b]"
                            />
                        </NavLink>
                    </div>
                </nav>

                {/* Bottom brand card */}
                <div className="border-t border-[#eeede3] p-4">
                    <div className="relative overflow-hidden rounded-2xl border border-[#dfe8d9] bg-gradient-to-br from-[#edf3e8] via-[#f4f5eb] to-[#faf5e7] p-4">
                        <div className="pointer-events-none absolute -right-4 -top-5 h-20 w-20 rounded-full bg-white/70 blur-xl" />

                        <div className="relative flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#285b3b] text-[#f5d58a]">
                                <Leaf size={16} />
                            </div>

                            <div>
                                <p className="text-[11px] font-extrabold text-[#285b3b]">
                                    Naturally better
                                </p>
                                <p className="mt-0.5 text-[9px] text-[#788273]">
                                    Made with care, every day
                                </p>
                            </div>

                            <Sparkles
                                size={15}
                                className="ml-auto text-[#b18b3d]"
                            />
                        </div>

                        <div className="mt-3 h-px bg-[#dce4d5]" />

                        <p className="mt-3 text-[10px] leading-[17px] text-[#788273]">
                            Your products, orders and store experience — all in one place.
                        </p>
                    </div>

                    <p className="mt-3 text-center text-[9px] font-medium tracking-wide text-[#a0a193]">
                        CHITHU'S ADMIN PANEL
                    </p>
                </div>
            </aside>
        </>
    );
}
