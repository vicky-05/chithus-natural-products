
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUp,
  ArrowUpRight,
  Leaf,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  LoaderCircle,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import logo from "../assets/chithus-navbar-logo.png";
import { supabase } from "../lib/supabaseClient";
import { socialLinks } from "../config/socialLinks";

const BUSINESS = {
  location: "Tamil Nadu, India",
  phone: "",
  whatsappNumber: "",
  instagramUrl:
    "https://www.instagram.com/chithu_s_natural_products/",
  email: "chithusnaturalproducts@gmail.com",
};

function InstagramIcon({ size = 17 }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle
        cx="17.5"
        cy="6.5"
        r="0.8"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

function Footer() {
  const currentYear = new Date().getFullYear();

  // Authentication state
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Footer categories
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState(false);

  // Newsletter state
  const [email, setEmail] = useState("");
  const [newsletterMessage, setNewsletterMessage] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState("");
  const [newsletterLoading, setNewsletterLoading] = useState(false);

  /*
   * AUTHENTICATION
   *
   * Keep the footer synchronized with the Supabase session.
   * Sign In and Create Account are only shown to signed-out
   * customers after the initial session check completes.
   */
  useEffect(() => {
    let mounted = true;
    let authEventReceived = false;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      authEventReceived = true;

      if (mounted) {
        setSession(nextSession);
        setAuthLoading(false);
      }
    });

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!mounted) return;

        if (error) {
          console.error(
            "Unable to retrieve authentication session:",
            error
          );
        }

        // Avoid replacing a newer sign-in/sign-out event
        // with an older getSession() result.
        if (!authEventReceived) {
          setSession(data?.session ?? null);
        }

        setAuthLoading(false);
      })
      .catch((error) => {
        if (!mounted) return;

        console.error(
          "Unable to check authentication session:",
          error
        );

        setSession(null);
        setAuthLoading(false);
      });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const isSignedIn = Boolean(session?.user);

  /*
   * LOAD ACTIVE CATEGORIES
   */
  useEffect(() => {
    let mounted = true;

    async function loadCategories() {
      setCategoriesLoading(true);
      setCategoriesError(false);

      try {
        const { data, error } = await supabase
          .from("categories")
          .select("id, name, slug")
          .eq("is_active", true)
          .order("sort_order", { ascending: true })
          .order("name", { ascending: true });

        if (error) throw error;

        if (mounted) {
          setCategories(data || []);
        }
      } catch (error) {
        console.error("Footer category loading failed:", error);

        if (mounted) {
          setCategoriesError(true);
          setCategories([]);
        }
      } finally {
        if (mounted) {
          setCategoriesLoading(false);
        }
      }
    }

    loadCategories();

    return () => {
      mounted = false;
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /*
   * NEWSLETTER SUBSCRIPTION
   */
  const handleNewsletterSubmit = async (event) => {
    event.preventDefault();

    if (newsletterLoading) return;

    const normalizedEmail = email.trim().toLowerCase();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !normalizedEmail ||
      normalizedEmail.length > 254 ||
      !emailPattern.test(normalizedEmail)
    ) {
      setNewsletterStatus("error");
      setNewsletterMessage("Please enter a valid email address.");
      return;
    }

    setNewsletterLoading(true);
    setNewsletterMessage("");
    setNewsletterStatus("");

    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .insert({
          email: normalizedEmail,
        });

      if (error) {
        // PostgreSQL unique constraint:
        // this email is already subscribed.
        if (error.code === "23505") {
          setNewsletterStatus("success");
          setNewsletterMessage(
            "This email is already subscribed. Thank you for your interest!"
          );
          setEmail("");
          return;
        }

        console.error("Newsletter subscription failed:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        });

        throw error;
      }

      setNewsletterStatus("success");
      setNewsletterMessage(
        "Thank you for subscribing! You're on our newsletter list."
      );
      setEmail("");
    } catch (error) {
      console.error("Newsletter subscription error:", error);

      setNewsletterStatus("error");

      if (
        error?.code === "42P01" ||
        error?.code === "PGRST205"
      ) {
        setNewsletterMessage(
          "Newsletter table not found. Please check your Supabase database setup."
        );
      } else if (
        error?.code === "42501" ||
        error?.code === "PGRST301"
      ) {
        setNewsletterMessage(
          "Subscription permission denied. Please check your Supabase RLS policies."
        );
      } else if (error?.code === "23514") {
        setNewsletterMessage(
          "The email was rejected by the database. Please check the email address."
        );
      } else {
        setNewsletterMessage(
          "We couldn't complete your subscription. Please try again."
        );
      }
    } finally {
      setNewsletterLoading(false);
    }
  };

  /*
   * FOOTER LINKS
   */
  const shopLinks = [
    { label: "All Products", to: "/shop" },
    ...categories.map((category) => ({
      label: category.name,
      to: `/shop/${category.slug}`,
    })),
  ];

  const exploreLinks = [
    { label: "Our Story", to: "/about" },
    { label: "Contact Us", to: "/contact" },
    { label: "FAQs", to: "/faq" },
    { label: "Track Order", to: "/track-order" },
  ];

  const accountLinks = [
    { label: "My Account", to: "/my-account" },
    { label: "My Orders", to: "/orders" },
    { label: "My Wishlist", to: "/wishlist" },
    { label: "My Cart", to: "/cart" },
  ];

  return (
    <footer className="relative overflow-hidden bg-[#173F2A] text-white">
      {/* Back to Top */}
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Back to top of page"
        className="group flex w-full items-center justify-center gap-2 bg-[#285C3A] px-4 py-4 text-sm font-medium text-white/90 transition-colors duration-200 hover:bg-[#346D49] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#E8D5A8]"
      >
        <span>Back to top</span>
        <ArrowUp
          size={16}
          className="transition-transform duration-200 group-hover:-translate-y-1"
        />
      </button>

      {/* Decorative background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full border border-white/5"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -left-32 h-96 w-96 rounded-full border border-[#C79A3B]/10"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[12%] top-[20%] h-56 w-56 rounded-full bg-[#C79A3B]/5 blur-3xl"
      />

      <div className="pointer-events-none absolute right-[4%] top-12 hidden rotate-12 text-[#C79A3B]/20 lg:block">
        <Leaf size={150} strokeWidth={0.7} />
      </div>

      <div className="relative z-10 mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10">
        {/* Newsletter */}
        <div className="border-b border-white/10 py-12 sm:py-14">
          <div className="grid gap-7 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <Leaf
                  size={16}
                  strokeWidth={1.5}
                  className="text-[#C79A3B]"
                />

                <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#E8D5A8] sm:text-xs">
                  Stay Connected
                </span>
              </div>

              <h2 className="font-serif text-3xl leading-tight sm:text-4xl">
                Goodness worth{" "}
                <span className="italic text-[#E8D5A8]">
                  coming back to.
                </span>
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-white/55">
                Stay connected with Chithu’s Natural Products for
                new products, traditional food ideas and updates.
              </p>
            </div>

            <div className="w-full lg:w-[430px]">
              <form
                onSubmit={handleNewsletterSubmit}
                className="flex flex-col gap-2 sm:flex-row"
              >
                <div className="relative flex-1">
                  <Mail
                    size={17}
                    strokeWidth={1.5}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35"
                  />

                  <input
                    type="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setNewsletterMessage("");
                      setNewsletterStatus("");
                    }}
                    placeholder="Your email address"
                    aria-label="Your email address"
                    aria-invalid={newsletterStatus === "error"}
                    aria-describedby="newsletter-feedback"
                    autoComplete="email"
                    maxLength={254}
                    required
                    disabled={newsletterLoading}
                    className="h-[50px] w-full rounded-full border border-white/10 bg-white/5 pl-11 pr-5 text-sm text-white outline-none transition-all placeholder:text-white/35 focus:border-[#C79A3B]/50 focus:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>

                <button
                  type="submit"
                  disabled={newsletterLoading}
                  className="group flex h-[50px] shrink-0 items-center justify-center gap-2 rounded-full bg-[#C79A3B] px-6 text-sm font-semibold text-[#173F2A] transition-all duration-300 hover:bg-[#E8D5A8] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {newsletterLoading ? (
                    <>
                      <LoaderCircle
                        size={16}
                        className="animate-spin"
                      />
                      Subscribing...
                    </>
                  ) : (
                    <>
                      Subscribe
                      <ArrowUpRight
                        size={16}
                        className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </>
                  )}
                </button>
              </form>

              {newsletterMessage && (
                <p
                  id="newsletter-feedback"
                  role="status"
                  aria-live="polite"
                  className={`mt-3 flex items-start gap-2 text-xs leading-5 ${
                    newsletterStatus === "success"
                      ? "text-[#A7E8B7]"
                      : "text-[#FFB4A8]"
                  }`}
                >
                  {newsletterStatus === "success" ? (
                    <CheckCircle2
                      size={15}
                      className="mt-0.5 shrink-0"
                    />
                  ) : (
                    <AlertCircle
                      size={15}
                      className="mt-0.5 shrink-0"
                    />
                  )}

                  <span>{newsletterMessage}</span>
                </p>
              )}

              <p className="mt-3 text-[11px] leading-5 text-white/40">
                Subscribe for product and brand updates. You can
                request removal from our subscriber list by
                contacting us.
              </p>
            </div>
          </div>
        </div>

        {/* Main footer columns */}
        <div className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1fr_1fr_1.2fr] lg:gap-8 lg:py-14">
          {/* Brand */}
          <div>
            <Link to="/" className="inline-block">
              <div className="flex h-[62px] w-[190px] items-center justify-center rounded-xl bg-[#FAF7EF] px-4">
                <img
                  src={logo}
                  alt="Chithu's Natural Products"
                  className="max-h-[52px] max-w-full object-contain"
                />
              </div>
            </Link>

            <p className="mt-6 max-w-sm font-serif text-xl leading-7 text-[#E8D5A8]">
              Traditional goodness.
              <br />
              Made with love.
            </p>

            <p className="mt-4 max-w-sm text-sm leading-7 text-white/50">
              Bringing traditional flavours, wholesome ingredients
              and familiar goodness to modern family kitchens.
            </p>

            {/* Social links */}
            <div className="mt-6 flex items-center gap-3">
              <SocialButton
                href={BUSINESS.instagramUrl}
                label="Instagram"
                icon={<InstagramIcon size={17} />}
              />

              <SocialButton
                href={socialLinks.emailLink}
                label="Email"
                icon={<Mail size={17} />}
                external={false}
              />

              {BUSINESS.whatsappNumber && (
                <SocialButton
                  href={`https://wa.me/${BUSINESS.whatsappNumber}`}
                  label="WhatsApp"
                  icon={<MessageCircle size={17} />}
                />
              )}
            </div>

            <a
              href={socialLinks.emailLink}
              className="mt-3 inline-block break-all text-xs text-white/50 transition hover:text-white"
            >
              {socialLinks.email}
            </a>
          </div>

          {/* Shop */}
          <div>
            <FooterTitle>Shop</FooterTitle>

            {categoriesLoading ? (
              <div className="flex items-center gap-2 text-sm text-white/50">
                <LoaderCircle size={15} className="animate-spin" />
                Loading categories...
              </div>
            ) : (
              <ul className="space-y-3">
                {shopLinks.map((item) => (
                  <FooterLink key={item.to} href={item.to}>
                    {item.label}
                  </FooterLink>
                ))}

                {categoriesError && (
                  <li className="text-xs leading-5 text-white/40">
                    Categories are temporarily unavailable.
                    <Link
                      to="/shop"
                      className="ml-1 text-[#E8D5A8] underline underline-offset-2"
                    >
                      Browse all
                    </Link>
                  </li>
                )}
              </ul>
            )}
          </div>

          {/* Explore */}
          <div>
            <FooterTitle>Explore</FooterTitle>

            <ul className="space-y-3">
              {exploreLinks.map((item) => (
                <FooterLink key={item.to} href={item.to}>
                  {item.label}
                </FooterLink>
              ))}
            </ul>
          </div>

          {/* Customer account */}
          <div>
            <FooterTitle>Your Account</FooterTitle>

            <ul className="space-y-3">
              {accountLinks.map((item) => (
                <FooterLink key={item.to} href={item.to}>
                  {item.label}
                </FooterLink>
              ))}

              {/* Show these links only to signed-out visitors. */}
              {!authLoading && !isSignedIn && (
                <>
                  <FooterLink href="/login">
                    Sign In
                  </FooterLink>

                  <FooterLink href="/register">
                    Create Account
                  </FooterLink>
                </>
              )}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <FooterTitle>Get In Touch</FooterTitle>

            <div className="space-y-5">
              <div className="flex gap-3">
                <ContactIcon>
                  <MapPin size={16} strokeWidth={1.5} />
                </ContactIcon>

                <div>
                  <p className="text-xs font-semibold text-white/80">
                    Our Location
                  </p>

                  <p className="mt-1 text-xs leading-5 text-white/45">
                    {BUSINESS.location}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <ContactIcon>
                  <Phone size={16} strokeWidth={1.5} />
                </ContactIcon>

                <div>
                  <p className="text-xs font-semibold text-white/80">
                    Phone
                  </p>

                  {BUSINESS.phone ? (
                    <a
                      href={`tel:${BUSINESS.phone}`}
                      className="mt-1 inline-block text-xs text-white/50 transition hover:text-white"
                    >
                      {BUSINESS.phone}
                    </a>
                  ) : (
                    <Link
                      to="/contact"
                      className="mt-1 inline-block text-xs text-white/50 transition hover:text-white"
                    >
                      Contact us for details
                    </Link>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <ContactIcon>
                  <Mail size={16} strokeWidth={1.5} />
                </ContactIcon>

                <div>
                  <p className="text-xs font-semibold text-white/80">
                    Email
                  </p>

                  <a
                    href={`mailto:${BUSINESS.email}`}
                    className="mt-1 inline-block break-all text-xs text-white/50 transition hover:text-white"
                  >
                    {BUSINESS.email}
                  </a>
                </div>
              </div>

              {BUSINESS.whatsappNumber ? (
                <a
                  href={`https://wa.me/${BUSINESS.whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-[#25D366]/20 bg-[#25D366]/5 px-4 py-2.5 text-xs font-semibold text-[#8DE8A9] transition-all hover:bg-[#25D366]/10"
                >
                  <MessageCircle size={15} />
                  Chat on WhatsApp
                  <ArrowUpRight size={13} />
                </a>
              ) : (
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 rounded-full border border-[#25D366]/20 bg-[#25D366]/5 px-4 py-2.5 text-xs font-semibold text-[#8DE8A9] transition-all hover:bg-[#25D366]/10"
                >
                  <MessageCircle size={15} />
                  Chat with us
                  <ArrowUpRight size={13} />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Policy links and copyright */}
        <div className="border-t border-white/10 py-6">
          <div className="flex flex-col gap-5 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {currentYear} Chithu’s Natural Products. All rights
              reserved.
            </p>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
              <Link
                to="/privacy-policy"
                className="transition-colors hover:text-white/80"
              >
                Privacy Policy
              </Link>

              <Link
                to="/terms"
                className="transition-colors hover:text-white/80"
              >
                Terms &amp; Conditions
              </Link>

              <Link
                to="/shipping-policy"
                className="transition-colors hover:text-white/80"
              >
                Shipping Policy
              </Link>

              <Link
                to="/return-policy"
                className="transition-colors hover:text-white/80"
              >
                Return Policy
              </Link>
            </div>

            <button
              type="button"
              onClick={scrollToTop}
              aria-label="Back to top"
              className="group inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-full border border-[#C79A3B]/40 bg-white/5 px-4 py-2.5 font-semibold text-[#E8D5A8] transition hover:border-[#C79A3B] hover:bg-[#C79A3B] hover:text-[#173F2A] focus:outline-none focus:ring-2 focus:ring-[#E8D5A8]/70 sm:self-auto"
            >
              Back to Top
              <ArrowUp
                size={15}
                className="transition-transform group-hover:-translate-y-0.5"
              />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom gold line */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-1 bg-[#C79A3B]/70" />
    </footer>
  );
}

function FooterTitle({ children }) {
  return (
    <h3 className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-[#E8D5A8]">
      {children}
    </h3>
  );
}

function FooterLink({ href, children }) {
  return (
    <li>
      <Link
        to={href}
        className="group inline-flex items-center text-sm text-white/50 transition-colors duration-200 hover:text-white"
      >
        <span>{children}</span>
        <ArrowUpRight
          size={12}
          className="ml-1 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-70"
        />
      </Link>
    </li>
  );
}

function ContactIcon({ children }) {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/5 text-[#C79A3B]">
      {children}
    </div>
  );
}

function SocialButton({
  href,
  label,
  icon,
  external = true,
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 transition-all duration-300 hover:border-[#C79A3B]/40 hover:bg-[#C79A3B] hover:text-[#173F2A]"
    >
      {icon}
    </a>
  );
}

export default Footer;
