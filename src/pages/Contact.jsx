import {
  ArrowRight,
  Check,
  ChevronDown,
  Clock3,
  Mail,
  MapPin,
  MessageCircle,
  Send,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { socialLinks } from "../config/socialLinks";

import aboutHeroImage from "../assets/about-hero.png";
import whatsappUiImage from "../assets/whatsapp-ui.png";
import faqImage from "../assets/faq-image.png";

// ==================================================
// CONTACT DETAILS
// ==================================================

const contactDetails = [
  {
    icon: MessageCircle,
    title: "WhatsApp",
    description: "For orders, product details and quick support",
    value: "Chat with us on WhatsApp",
    href: socialLinks.whatsapp,
    iconClass: "bg-[#E7F7EC] text-[#25D366]",
    external: true,
  },
  {
    icon: Mail,
    title: "Email",
    description: "Send us an email anytime",
    value: socialLinks.email,
    href: socialLinks.emailLink,
    iconClass: "bg-[#FFF5DB] text-[#B47D16]",
    external: false,
  },
  {
    icon: MapPin,
    title: "Business Location",
    description: "Our business location",
    value: "Aduthurai, Thanjavur, Tamil Nadu",
    href: "https://www.google.com/maps/search/?api=1&query=Aduthurai%2C+Thanjavur%2C+Tamil+Nadu",
    iconClass: "bg-[#E7F0E8] text-[#285C3A]",
    external: true,
  },
];

// ==================================================
// SUBJECTS
// ==================================================

const subjects = [
  "Product Enquiry",
  "Order Support",
  "Delivery",
  "Wholesale Enquiry",
  "General Question",
];

// ==================================================
// CONTACT INFORMATION CARD
// ==================================================

function ContactInfoCard({ item }) {
  const Icon = item.icon;

  return (
    <a
      href={item.href}
      target={item.external ? "_blank" : undefined}
      rel={item.external ? "noopener noreferrer" : undefined}
      className="group flex items-center gap-4 rounded-[20px] border border-[#E8E1D2] bg-white p-4 transition duration-300 hover:-translate-y-0.5 hover:border-[#C79A3B] hover:shadow-[0_10px_30px_rgba(36,40,33,0.06)] sm:p-5"
    >
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${item.iconClass}`}
      >
        <Icon size={22} strokeWidth={1.8} />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="font-serif text-lg font-bold text-[#173F2A]">
          {item.title}
        </h3>

        <p className="mt-0.5 text-xs leading-5 text-[#667064]">
          {item.description}
        </p>

        <p className="mt-2 break-words text-sm font-bold text-[#285C3A]">
          {item.value}
        </p>
      </div>

      <ArrowRight
        size={17}
        className="shrink-0 text-[#A5A69F] transition group-hover:translate-x-1 group-hover:text-[#285C3A]"
      />
    </a>
  );
}

// ==================================================
// CONTACT PAGE
// ==================================================

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    subject: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  // ==================================================
  // HANDLE INPUT
  // ==================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==================================================
  // HANDLE FORM
  // ==================================================

  const handleSubmit = (event) => {
    event.preventDefault();

    const message = [
      "Hello Chithu's Natural Products!",
      "",
      `Name: ${formData.name.trim()}`,
      `Phone: ${formData.phone.trim()}`,
      `Email: ${formData.email.trim() || "Not provided"}`,
      `Subject: ${formData.subject}`,
      "",
      "Message:",
      formData.message.trim(),
    ].join("\n");

    const whatsappUrl = `${
      socialLinks.whatsapp
    }?text=${encodeURIComponent(message)}`;

    // Prepare the message in WhatsApp.
    // The customer must press Send inside WhatsApp.
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");

    setSubmitted(true);
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#FAF7EF]">
      {/* ==================================================
          HERO
      ================================================== */}

      <section className="relative overflow-hidden border-b border-[#E8E1D2] bg-[#F4EFE3]">
        <div className="mx-auto grid max-w-7xl items-center lg:grid-cols-[1fr_1.05fr]">
          {/* HERO CONTENT */}

          <div className="relative z-10 px-4 py-12 sm:px-6 lg:py-16">
            {/* Decorative circles */}

            <div className="pointer-events-none absolute -left-20 top-10 h-44 w-44 rounded-full border border-[#E8D5A8]/50" />

            <div className="pointer-events-none absolute left-20 top-24 h-20 w-20 rounded-full border border-[#D8E2D5]/70" />

            {/* Breadcrumb */}

            <div className="relative flex items-center gap-2 text-xs font-medium text-[#667064]">
              <Link
                to="/"
                className="transition hover:text-[#285C3A]"
              >
                Home
              </Link>

              <span>›</span>

              <span className="text-[#285C3A]">
                Contact
              </span>
            </div>

            {/* Eyebrow */}

            <p className="relative mt-7 text-xs font-bold uppercase tracking-[0.28em] text-[#C79A3B]">
              Contact Us
            </p>

            {/* Heading */}

            <h1 className="relative mt-3 max-w-xl font-serif text-4xl font-bold leading-[1.05] tracking-tight text-[#173F2A] sm:text-5xl lg:text-6xl">
              We'd Love to
              <br />
              Hear From You
            </h1>

            {/* Description */}

            <p className="relative mt-5 max-w-lg text-sm leading-7 text-[#667064] sm:text-base">
              Your questions, feedback and orders mean a lot
              to us. We're here to help you with our products
              and services.
            </p>

            {/* Trust points */}

            <div className="relative mt-7 grid max-w-xl grid-cols-3 gap-2 sm:gap-4">
              {/* Traditional */}

              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#E8D5A8] bg-white text-[#285C3A]">
                  <Check size={17} />
                </div>

                <span className="text-[10px] font-semibold leading-4 text-[#667064] sm:text-xs">
                  Traditional
                  <br />
                  Goodness
                </span>
              </div>

              {/* Natural */}

              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#E8D5A8] bg-white text-[#285C3A]">
                  <span className="text-lg leading-none">
                    ⌁
                  </span>
                </div>

                <span className="text-[10px] font-semibold leading-4 text-[#667064] sm:text-xs">
                  Natural
                  <br />
                  Products
                </span>
              </div>

              {/* Made with love */}

              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#E8D5A8] bg-white text-[#C79A3B]">
                  <span className="text-lg leading-none">
                    ♡
                  </span>
                </div>

                <span className="text-[10px] font-semibold leading-4 text-[#667064] sm:text-xs">
                  Made
                  <br />
                  With Love
                </span>
              </div>
            </div>
          </div>

          {/* HERO IMAGE - DESKTOP */}

          <div className="relative hidden h-[390px] lg:block">
            <img
              src={aboutHeroImage}
              alt="Chithu's Natural Products"
              className="absolute inset-0 h-full w-full object-cover"
            />

            {/* Left fade */}

            <div className="absolute inset-y-0 left-0 w-2/5 bg-gradient-to-r from-[#F4EFE3] via-[#F4EFE3]/60 to-transparent" />

            {/* Bottom fade */}

            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#F4EFE3] to-transparent" />

            {/* Brand plaque */}

            <div className="absolute right-8 top-7 rounded-2xl border border-[#C79A3B]/40 bg-[#F4EFE3]/95 px-6 py-4 shadow-xl backdrop-blur-sm">
              <p className="font-serif text-xl font-bold text-[#173F2A]">
                Chithu's
              </p>

              <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#285C3A]">
                Natural Products
              </p>
            </div>
          </div>

          {/* HERO IMAGE - MOBILE */}

          <div className="relative h-[260px] lg:hidden">
            <img
              src={aboutHeroImage}
              alt="Chithu's Natural Products"
              className="h-full w-full object-cover"
            />

            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#F4EFE3] to-transparent" />

            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#F4EFE3] to-transparent" />
          </div>
        </div>
      </section>

      {/* ==================================================
          CONTACT INFORMATION + FORM
      ================================================== */}

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          {/* CONTACT INFORMATION */}

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#C79A3B]">
              Get In Touch
            </p>

            <h2 className="mt-3 font-serif text-3xl font-bold text-[#173F2A] sm:text-4xl">
              Contact Information
            </h2>

            <div className="mt-3 h-px w-24 bg-[#C79A3B]" />

            <p className="mt-5 max-w-md text-sm leading-6 text-[#667064]">
              Reach out to us through any of the below
              channels. We'll be happy to assist you.
            </p>

            {/* Cards */}

            <div className="mt-7 space-y-3">
              {contactDetails.map((item) => (
                <ContactInfoCard
                  key={item.title}
                  item={item}
                />
              ))}
            </div>

            {/* Help note */}

            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-[#E8D5A8] bg-[#FFF9E9] p-4">
              <Clock3
                size={19}
                className="mt-0.5 shrink-0 text-[#C79A3B]"
              />

              <div>
                <p className="text-sm font-bold text-[#173F2A]">
                  We're here to help
                </p>

                <p className="mt-1 text-xs leading-5 text-[#667064]">
                  For product and order questions, WhatsApp
                  is the quickest way to reach us.
                </p>
              </div>
            </div>
          </div>

          {/* CONTACT FORM */}

          <div className="relative overflow-hidden rounded-[28px] border border-[#DCE5D8] bg-[#E7F0E8] p-5 sm:p-7 lg:p-9">
            {/* Decorative circles */}

            <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full border border-[#AFC4AD]/50" />

            <div className="pointer-events-none absolute -bottom-12 -left-12 h-32 w-32 rounded-full border border-[#C79A3B]/20" />

            {/* Decorative leaf shapes */}

            <div className="pointer-events-none absolute right-4 top-4 opacity-40">
              <div className="h-14 w-7 rotate-45 rounded-full border border-[#789678]" />
              <div className="ml-5 mt-[-5px] h-10 w-5 -rotate-12 rounded-full border border-[#789678]" />
            </div>

            <div className="relative">
              {/* Form heading */}

              <div className="text-center">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#C79A3B]">
                  Send Us A Message
                </p>

                <h2 className="mt-3 font-serif text-3xl font-bold text-[#173F2A]">
                  We're Happy to Help
                </h2>

                <div className="mx-auto mt-3 h-px w-20 bg-[#C79A3B]" />

                <p className="mt-4 text-sm text-[#667064]">
                  Fill in the details and continue to WhatsApp
                  to send your enquiry.
                </p>
              </div>

              {/* SUCCESS STATE */}

              {submitted ? (
                <div className="mt-8 rounded-[22px] bg-white p-8 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#E7F0E8] text-[#285C3A]">
                    <Check size={27} />
                  </div>

                  <h3 className="mt-5 font-serif text-2xl font-bold text-[#173F2A]">
                    WhatsApp Message Prepared
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#667064]">
                    Your details have been prepared in WhatsApp.
                    Please press Send in WhatsApp to deliver
                    your message to our team.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);

                      setFormData({
                        name: "",
                        phone: "",
                        email: "",
                        subject: "",
                        message: "",
                      });
                    }}
                    className="mt-6 rounded-full border border-[#285C3A] px-5 py-2.5 text-sm font-bold text-[#285C3A] transition hover:bg-[#285C3A] hover:text-white"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                /* FORM */

                <form
                  onSubmit={handleSubmit}
                  className="mt-7 space-y-5"
                >
                  {/* Name + Phone */}

                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Name */}

                    <div>
                      <label
                        htmlFor="name"
                        className="mb-2 block text-xs font-bold text-[#242821]"
                      >
                        Name{" "}
                        <span className="text-[#B94A48]">
                          *
                        </span>
                      </label>

                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your name"
                        className="w-full rounded-xl border border-[#D8DED5] bg-white px-4 py-3 text-sm text-[#242821] outline-none transition placeholder:text-[#9A9E97] focus:border-[#285C3A] focus:ring-2 focus:ring-[#285C3A]/10"
                      />
                    </div>

                    {/* Phone */}

                    <div>
                      <label
                        htmlFor="phone"
                        className="mb-2 block text-xs font-bold text-[#242821]"
                      >
                        Phone Number{" "}
                        <span className="text-[#B94A48]">
                          *
                        </span>
                      </label>

                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Your phone number"
                        className="w-full rounded-xl border border-[#D8DED5] bg-white px-4 py-3 text-sm text-[#242821] outline-none transition placeholder:text-[#9A9E97] focus:border-[#285C3A] focus:ring-2 focus:ring-[#285C3A]/10"
                      />
                    </div>
                  </div>

                  {/* Email + Subject */}

                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Email */}

                    <div>
                      <label
                        htmlFor="email"
                        className="mb-2 block text-xs font-bold text-[#242821]"
                      >
                        Email Address
                      </label>

                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Your email address"
                        className="w-full rounded-xl border border-[#D8DED5] bg-white px-4 py-3 text-sm text-[#242821] outline-none transition placeholder:text-[#9A9E97] focus:border-[#285C3A] focus:ring-2 focus:ring-[#285C3A]/10"
                      />
                    </div>

                    {/* Subject */}

                    <div>
                      <label
                        htmlFor="subject"
                        className="mb-2 block text-xs font-bold text-[#242821]"
                      >
                        Subject{" "}
                        <span className="text-[#B94A48]">
                          *
                        </span>
                      </label>

                      <div className="relative">
                        <select
                          id="subject"
                          name="subject"
                          required
                          value={formData.subject}
                          onChange={handleChange}
                          className="w-full appearance-none rounded-xl border border-[#D8DED5] bg-white px-4 py-3 text-sm text-[#242821] outline-none transition focus:border-[#285C3A] focus:ring-2 focus:ring-[#285C3A]/10"
                        >
                          <option value="">
                            Select a subject
                          </option>

                          {subjects.map((subject) => (
                            <option
                              key={subject}
                              value={subject}
                            >
                              {subject}
                            </option>
                          ))}
                        </select>

                        <ChevronDown
                          size={17}
                          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#667064]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Message */}

                  <div>
                    <label
                      htmlFor="message"
                      className="mb-2 block text-xs font-bold text-[#242821]"
                    >
                      Message{" "}
                      <span className="text-[#B94A48]">
                        *
                      </span>
                    </label>

                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Type your message here..."
                      className="w-full resize-none rounded-xl border border-[#D8DED5] bg-white px-4 py-3 text-sm text-[#242821] outline-none transition placeholder:text-[#9A9E97] focus:border-[#285C3A] focus:ring-2 focus:ring-[#285C3A]/10"
                    />
                  </div>

                  {/* Submit */}

                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#285C3A] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#173F2A]"
                  >
                    <Send size={17} />
                    Continue to WhatsApp
                  </button>

                  {/* Privacy */}

                  <div className="flex items-center justify-center gap-2 text-center text-[10px] leading-4 text-[#667064]">
                    <ShieldCheck
                      size={14}
                      className="shrink-0 text-[#285C3A]"
                    />

                    <span>
                      Your information is included in the message
                      you choose to send.
                    </span>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          WHATSAPP SUPPORT
      ================================================== */}

      <section
        id="whatsapp"
        className="overflow-hidden bg-[#E7F0E8] px-4 py-12 sm:px-6 lg:py-16"
      >
        <div className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-[1fr_0.75fr]">
          {/* CONTENT */}

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#C79A3B]">
              Need Help With Your Order?
            </p>

            <h2 className="mt-3 max-w-xl font-serif text-3xl font-bold text-[#173F2A] sm:text-4xl">
              Chat with us on WhatsApp
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-[#667064] sm:text-base">
              Get quick assistance for product details,
              orders, availability and any other questions.
            </p>

            {/* WhatsApp button */}

            <a
              href={socialLinks.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3.5 text-sm font-bold text-white shadow-[0_8px_25px_rgba(37,211,102,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(37,211,102,0.28)]"
            >
              <MessageCircle size={19} />
              Chat on WhatsApp
              <ArrowRight size={16} />
            </a>
          </div>

          {/* WHATSAPP UI IMAGE */}

          <div className="relative mx-auto w-full max-w-md">
            {/* Decorative circles */}

            <div className="pointer-events-none absolute -bottom-4 -left-6 h-32 w-32 rounded-full bg-[#C79A3B]/10" />

            <div className="pointer-events-none absolute -right-4 top-4 h-24 w-24 rounded-full bg-[#285C3A]/10" />

            <div className="relative overflow-hidden rounded-[30px]">
              <img
                src={whatsappUiImage}
                alt="Chat with Chithu's Natural Products on WhatsApp"
                className="h-auto w-full object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          LOCATION
      ================================================== */}

      <section
        id="location"
        className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20"
      >
        <div className="grid items-center gap-8 lg:grid-cols-[0.75fr_1.25fr]">
          {/* LOCATION CONTENT */}

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#C79A3B]">
              Our Location
            </p>

            <h2 className="mt-3 font-serif text-3xl font-bold text-[#173F2A] sm:text-4xl">
              Find Us Here
            </h2>

            <div className="mt-3 h-px w-24 bg-[#C79A3B]" />

            <p className="mt-5 text-sm leading-6 text-[#667064]">
              Find Chithu's Natural Products in Aduthurai,
              Thanjavur, Tamil Nadu.
            </p>

            {/* Address card */}

            <div className="mt-6 flex gap-4 rounded-[20px] border border-[#E8E1D2] bg-white p-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FFF5DB] text-[#B47D16]">
                <MapPin size={22} />
              </div>

              <div>
                <h3 className="font-serif text-lg font-bold text-[#173F2A]">
                  Chithu's Natural Products
                </h3>

                <p className="mt-1 text-sm leading-5 text-[#667064]">
                  Aduthurai, Thanjavur,
                  <br />
                  Tamil Nadu, India
                </p>
              </div>
            </div>
          </div>

          {/* MAP */}

          <div className="relative h-[330px] overflow-hidden rounded-[28px] border border-[#E5DCC8] bg-[#E7F0E8]">
            {/* Map background */}

            <div className="absolute inset-0 opacity-50">
              <div className="absolute left-0 top-[30%] h-px w-full rotate-12 bg-[#C8D5C5]" />

              <div className="absolute left-0 top-[58%] h-px w-full -rotate-6 bg-[#C8D5C5]" />

              <div className="absolute left-[25%] top-0 h-full w-px rotate-12 bg-[#C8D5C5]" />

              <div className="absolute left-[65%] top-0 h-full w-px -rotate-12 bg-[#C8D5C5]" />

              <div className="absolute left-[15%] top-[15%] h-24 w-36 rounded-full border border-[#C8D5C5]" />

              <div className="absolute bottom-[12%] right-[10%] h-32 w-48 rounded-full border border-[#C8D5C5]" />
            </div>

            {/* Location information */}

            <div className="absolute left-5 top-5 rounded-xl bg-white px-5 py-4 shadow-lg">
              <p className="font-serif text-sm font-bold text-[#173F2A]">
                Chithu's Natural Products
              </p>

              <p className="mt-1 text-[10px] leading-4 text-[#667064]">
                Aduthurai, Thanjavur,
                <br />
                Tamil Nadu, India
              </p>

              <a
                href="https://www.google.com/maps/search/?api=1&query=Aduthurai%2C+Thanjavur%2C+Tamil+Nadu"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-[10px] font-bold text-[#285C3A] hover:underline"
              >
                View larger map →
              </a>
            </div>

            {/* Map pin */}

            <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#C79A3B] text-white shadow-[0_8px_25px_rgba(199,154,59,0.35)]">
                <MapPin
                  size={27}
                  fill="currentColor"
                />
              </div>

              <div className="mt-2 rounded-full bg-[#173F2A] px-4 py-1.5 text-[10px] font-bold text-white shadow-lg">
                Chithu's Natural Products
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          FAQ CTA
      ================================================== */}

      <section className="relative overflow-hidden bg-[#F4EFE3] px-4 py-14 sm:px-6 lg:py-16">
        {/* Decorative background */}

        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -bottom-20 -left-20 h-52 w-52 rounded-full border border-[#E8D5A8]" />

          <div className="absolute right-10 top-10 h-24 w-24 rounded-full border border-[#D8E2D5]" />
        </div>

        <div className="relative mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-[1fr_0.75fr]">
          {/* FAQ CONTENT */}

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#C79A3B]">
              Have A Common Question?
            </p>

            <h2 className="mt-3 font-serif text-3xl font-bold text-[#173F2A] sm:text-4xl">
              Check Our FAQ
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-[#667064] sm:text-base">
              Find answers to frequently asked questions
              about our products, orders, delivery and more.
            </p>

            <Link
              to="/faq"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#C79A3B] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#A97F2E]"
            >
              View FAQ
              <ArrowRight size={17} />
            </Link>
          </div>

          {/* FAQ IMAGE */}

          <div className="relative mx-auto w-full max-w-md">
            <div className="pointer-events-none absolute -right-5 -top-5 h-24 w-24 rounded-full bg-[#285C3A]/10" />

            <div className="relative overflow-hidden rounded-[30px]">
              <img
                src={faqImage}
                alt="Frequently asked questions about Chithu's Natural Products"
                className="h-auto w-full object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Bottom spacing */}

      <div className="h-8 bg-[#FAF7EF]" />
    </div>
  );
}