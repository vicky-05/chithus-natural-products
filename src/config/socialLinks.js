export const socialLinks = {
  whatsappNumber: "916381447316",

  instagram: "https://www.instagram.com/chithu_s_natural_products/",

  youtube: "https://www.youtube.com/@Mahalakshmi-hn4tr",

  email: "chithusnaturalproducts@gmail.com",

  get whatsapp() {
    const number = this.whatsappNumber.replace(/\D/g, "");
    return number ? `https://wa.me/${number}` : "916381447316";
  },

  get emailLink() {
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
      this.email,
    )}`;
  },
};
