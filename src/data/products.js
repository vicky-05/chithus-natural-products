// =========================================================
// PRODUCT IMAGE AUTO LOADER
// =========================================================

const productImages = import.meta.glob(
  "../assets/products/*.{png,jpg,jpeg,webp}",
  {
    eager: true,
    query: "?url",
    import: "default",
  }
);

const getProductImage = (slug) => {
  for (const extension of ["png", "jpg", "jpeg", "webp"]) {
    const path = `../assets/products/${slug}.${extension}`;

    if (productImages[path]) {
      return productImages[path];
    }
  }

  return null;
};

// =========================================================
// PRODUCTS
// =========================================================

const products = [
  // =========================================================
  // LADDUS & TRADITIONAL SWEETS
  // =========================================================

  {
    id: 1,
    name: "Fix Seed Chikki",
    slug: "fix-seed-chikki",
    category: "laddus-and-traditional-sweets",
    categoryName: "Laddus & Traditional Sweets",
    price: 120,
    weight: "200 g",
    inStock: true,
    shortDescription:
      "Traditional seed-based chikki made with wholesome ingredients.",
    productDetails:
      "A traditional sweet prepared with carefully selected seeds and natural ingredients.",
    ingredients: "Seeds, jaggery and selected natural ingredients.",
    howToUse: "Ready to eat. Store in a cool and dry place.",
    benefits: [
      "Traditional preparation",
      "Made with natural ingredients",
      "No artificial preservatives",
    ],
  },

  {
    id: 2,
    name: "Kambu Laddu",
    slug: "kambu-laddu",
    category: "laddus-and-traditional-sweets",
    categoryName: "Laddus & Traditional Sweets",
    price: 150,
    weight: "200 g",
    inStock: true,
    shortDescription:
      "Traditional pearl millet laddu with a wholesome taste.",
    productDetails:
      "Prepared using kambu with traditional methods for an authentic homemade taste.",
    ingredients: "Kambu, jaggery and selected natural ingredients.",
    howToUse: "Ready to eat. Store in a cool and dry place.",
    benefits: [
      "Made with millet",
      "Traditional recipe",
      "Wholesome snack",
    ],
  },

  {
    id: 3,
    name: "Peanut Laddu",
    slug: "peanut-laddu",
    category: "laddus-and-traditional-sweets",
    categoryName: "Laddus & Traditional Sweets",
    price: 140,
    weight: "200 g",
    inStock: true,
    shortDescription:
      "Traditional peanut laddu with a rich nutty flavour.",
    productDetails:
      "A classic homemade-style laddu prepared using roasted peanuts and traditional ingredients.",
    ingredients: "Peanuts, jaggery and selected natural ingredients.",
    howToUse: "Ready to eat.",
    benefits: [
      "Nut-based traditional sweet",
      "Made with natural ingredients",
      "Great for snacking",
    ],
  },

  {
    id: 4,
    name: "Beetroot Laddu",
    slug: "beetroot-laddu",
    category: "laddus-and-traditional-sweets",
    categoryName: "Laddus & Traditional Sweets",
    price: 160,
    weight: "200 g",
    inStock: true,
    shortDescription:
      "Colourful beetroot laddu prepared with traditional goodness.",
    productDetails:
      "A naturally colourful sweet combining beetroot with traditional ingredients.",
    ingredients: "Beetroot, jaggery and selected natural ingredients.",
    howToUse: "Ready to eat.",
    benefits: [
      "Made with beetroot",
      "Traditional preparation",
      "Natural ingredients",
    ],
  },

  {
    id: 5,
    name: "Dry Fruits Laddu",
    slug: "dry-fruits-laddu",
    category: "laddus-and-traditional-sweets",
    categoryName: "Laddus & Traditional Sweets",
    price: 220,
    weight: "200 g",
    inStock: true,
    shortDescription:
      "Rich dry-fruit laddu made for a wholesome sweet treat.",
    productDetails:
      "Prepared with selected dry fruits and traditional ingredients.",
    ingredients: "Dry fruits, jaggery and selected natural ingredients.",
    howToUse: "Ready to eat.",
    benefits: [
      "Made with dry fruits",
      "Wholesome snack",
      "Traditional preparation",
    ],
  },

  {
    id: 6,
    name: "Moong Dal Laddu",
    slug: "moong-dal-laddu",
    category: "laddus-and-traditional-sweets",
    categoryName: "Laddus & Traditional Sweets",
    price: 150,
    weight: "200 g",
    inStock: true,
    shortDescription:
      "Traditional moong dal laddu with a homemade taste.",
    productDetails:
      "Prepared using moong dal and traditional ingredients.",
    ingredients: "Moong dal, jaggery and selected natural ingredients.",
    howToUse: "Ready to eat.",
    benefits: [
      "Dal-based sweet",
      "Traditional recipe",
      "Made with natural ingredients",
    ],
  },

  {
    id: 7,
    name: "Aval Laddu",
    slug: "aval-laddu",
    category: "laddus-and-traditional-sweets",
    categoryName: "Laddus & Traditional Sweets",
    price: 140,
    weight: "200 g",
    inStock: true,
    shortDescription:
      "Traditional aval laddu prepared with wholesome ingredients.",
    productDetails:
      "A traditional sweet made using aval with a simple homemade-style preparation.",
    ingredients: "Aval, jaggery and selected natural ingredients.",
    howToUse: "Ready to eat.",
    benefits: [
      "Traditional preparation",
      "Wholesome snack",
      "Natural ingredients",
    ],
  },

  {
    id: 8,
    name: "Multigrain Laddu",
    slug: "multigrain-laddu",
    category: "laddus-and-traditional-sweets",
    categoryName: "Laddus & Traditional Sweets",
    price: 170,
    weight: "200 g",
    inStock: true,
    shortDescription:
      "Wholesome laddu made with a blend of grains.",
    productDetails:
      "Prepared with selected grains using a traditional preparation method.",
    ingredients:
      "Multiple grains, jaggery and selected natural ingredients.",
    howToUse: "Ready to eat.",
    benefits: [
      "Made with multiple grains",
      "Traditional recipe",
      "Wholesome snack",
    ],
  },

  {
    id: 9,
    name: "Moringa Laddu",
    slug: "moringa-laddu",
    category: "laddus-and-traditional-sweets",
    categoryName: "Laddus & Traditional Sweets",
    price: 160,
    weight: "200 g",
    inStock: true,
    shortDescription:
      "Traditional laddu made with moringa goodness.",
    productDetails:
      "Prepared using moringa and selected traditional ingredients.",
    ingredients: "Moringa, jaggery and selected natural ingredients.",
    howToUse: "Ready to eat.",
    benefits: [
      "Made with moringa",
      "Traditional preparation",
      "Natural ingredients",
    ],
  },

  {
    id: 10,
    name: "Ragi Laddu",
    slug: "ragi-laddu",
    category: "laddus-and-traditional-sweets",
    categoryName: "Laddus & Traditional Sweets",
    price: 150,
    weight: "200 g",
    inStock: true,
    shortDescription:
      "Traditional ragi laddu made with wholesome millet.",
    productDetails:
      "Prepared using ragi and traditional ingredients for an authentic taste.",
    ingredients: "Ragi, jaggery and selected natural ingredients.",
    howToUse: "Ready to eat.",
    benefits: [
      "Made with ragi",
      "Millet-based snack",
      "Traditional preparation",
    ],
  },

  {
    id: 11,
    name: "Millet Rava Laddu",
    slug: "millet-rava-laddu",
    category: "laddus-and-traditional-sweets",
    categoryName: "Laddus & Traditional Sweets",
    price: 160,
    weight: "200 g",
    inStock: true,
    shortDescription:
      "Traditional laddu made with millet rava.",
    productDetails:
      "Prepared with millet rava and traditional ingredients.",
    ingredients:
      "Millet rava, jaggery and selected natural ingredients.",
    howToUse: "Ready to eat.",
    benefits: [
      "Millet-based sweet",
      "Traditional recipe",
      "Wholesome snack",
    ],
  },

  // =========================================================
  // HEALTH MIXES & POWDERS
  // =========================================================

  {
    id: 12,
    name: "Pirandai Podi",
    slug: "pirandai-podi",
    category: "health-mixes-and-powders",
    categoryName: "Health Mixes & Powders",
    price: 100,
    weight: "100 g",
    inStock: true,
    shortDescription:
      "Traditional pirandai podi prepared for everyday meals.",
    productDetails:
      "A traditional powder prepared using selected ingredients.",
    ingredients: "Pirandai and selected spices.",
    howToUse: "Mix with rice or enjoy with meals.",
    benefits: [
      "Traditional preparation",
      "Made with selected ingredients",
      "Easy to use",
    ],
  },

  {
    id: 13,
    name: "Karuveppilai Podi",
    slug: "karuveppilai-podi",
    category: "health-mixes-and-powders",
    categoryName: "Health Mixes & Powders",
    price: 100,
    weight: "100 g",
    inStock: true,
    shortDescription:
      "Traditional curry leaf powder with authentic flavour.",
    productDetails:
      "Prepared using curry leaves and selected traditional spices.",
    ingredients: "Curry leaves and selected spices.",
    howToUse:
      "Mix with rice or serve as a side powder.",
    benefits: [
      "Made with curry leaves",
      "Traditional recipe",
      "Easy everyday accompaniment",
    ],
  },

  {
    id: 14,
    name: "Poondu Podi",
    slug: "poondu-podi",
    category: "health-mixes-and-powders",
    categoryName: "Health Mixes & Powders",
    price: 100,
    weight: "100 g",
    inStock: true,
    shortDescription:
      "Flavourful garlic podi for traditional meals.",
    productDetails:
      "Prepared using garlic and selected spices.",
    ingredients: "Garlic and selected spices.",
    howToUse:
      "Mix with rice or enjoy with your meal.",
    benefits: [
      "Garlic-based traditional powder",
      "Rich flavour",
      "Easy to serve",
    ],
  },

  {
    id: 15,
    name: "Paruppu Idli Podi",
    slug: "paruppu-idli-podi",
    category: "health-mixes-and-powders",
    categoryName: "Health Mixes & Powders",
    price: 100,
    weight: "100 g",
    inStock: true,
    shortDescription:
      "Traditional lentil-based idli podi.",
    productDetails:
      "A classic accompaniment prepared using selected lentils and spices.",
    ingredients:
      "Lentils, spices and selected ingredients.",
    howToUse:
      "Mix with sesame oil and serve with idli or dosa.",
    benefits: [
      "Traditional accompaniment",
      "Lentil-based",
      "Easy to prepare",
    ],
  },

  {
    id: 16,
    name: "Vallarai Keerai Idli Podi",
    slug: "vallarai-keerai-idli-podi",
    category: "health-mixes-and-powders",
    categoryName: "Health Mixes & Powders",
    price: 110,
    weight: "100 g",
    inStock: true,
    shortDescription:
      "Traditional idli podi made with vallarai keerai.",
    productDetails:
      "Prepared using vallarai keerai and selected spices.",
    ingredients:
      "Vallarai keerai, lentils and spices.",
    howToUse:
      "Mix with sesame oil and serve with idli or dosa.",
    benefits: [
      "Made with traditional greens",
      "Traditional preparation",
      "Easy everyday use",
    ],
  },

  {
    id: 17,
    name: "Mudakathan Idli Podi",
    slug: "mudakathan-idli-podi",
    category: "health-mixes-and-powders",
    categoryName: "Health Mixes & Powders",
    price: 110,
    weight: "100 g",
    inStock: true,
    shortDescription:
      "Traditional idli podi prepared with mudakathan.",
    productDetails:
      "Prepared using mudakathan and selected traditional spices.",
    ingredients:
      "Mudakathan, lentils and spices.",
    howToUse:
      "Mix with sesame oil and serve with idli or dosa.",
    benefits: [
      "Made with traditional greens",
      "Traditional recipe",
      "Easy to use",
    ],
  },

  {
    id: 18,
    name: "Drumstick Leaf Powder",
    slug: "drumstick-leaf-powder",
    category: "health-mixes-and-powders",
    categoryName: "Health Mixes & Powders",
    price: 120,
    weight: "100 g",
    inStock: true,
    shortDescription:
      "Finely prepared drumstick leaf powder.",
    productDetails:
      "Prepared using carefully selected drumstick leaves.",
    ingredients: "Drumstick leaves.",
    howToUse:
      "Use as recommended with food or beverages.",
    benefits: [
      "Made from drumstick leaves",
      "Natural ingredient",
      "Easy to incorporate into meals",
    ],
  },

  // =========================================================
  // MALTS
  // =========================================================

  {
    id: 19,
    name: "Malt",
    slug: "malt",
    category: "malts",
    categoryName: "Malts",
    price: 180,
    weight: "250 g",
    inStock: true,
    shortDescription:
      "Traditional malt mix prepared with selected ingredients.",
    productDetails:
      "A wholesome malt mix suitable for preparing a traditional drink.",
    ingredients:
      "Selected grains and natural ingredients.",
    howToUse:
      "Mix with milk or water and prepare according to preference.",
    benefits: [
      "Traditional preparation",
      "Made with selected grains",
      "Easy to prepare",
    ],
  },

  {
    id: 20,
    name: "ABC Malt",
    slug: "abc-malt",
    category: "malts",
    categoryName: "Malts",
    price: 200,
    weight: "250 g",
    inStock: true,
    shortDescription:
      "ABC malt made with selected natural ingredients.",
    productDetails:
      "A traditional-style malt mix designed for everyday preparation.",
    ingredients:
      "Apple, beetroot, carrot and selected ingredients.",
    howToUse: "Mix with milk or water and serve.",
    benefits: [
      "Made with selected ingredients",
      "Easy to prepare",
      "Suitable for everyday use",
    ],
  },

  {
    id: 21,
    name: "Beetroot Malt",
    slug: "beetroot-malt",
    category: "malts",
    categoryName: "Malts",
    price: 190,
    weight: "250 g",
    inStock: true,
    shortDescription:
      "Beetroot-based malt mix with natural colour.",
    productDetails:
      "Prepared using beetroot and selected natural ingredients.",
    ingredients:
      "Beetroot and selected grains and ingredients.",
    howToUse: "Mix with milk or water and serve.",
    benefits: [
      "Made with beetroot",
      "Natural ingredients",
      "Easy to prepare",
    ],
  },

  {
    id: 22,
    name: "Carrot Malt",
    slug: "carrot-malt",
    category: "malts",
    categoryName: "Malts",
    price: 190,
    weight: "250 g",
    inStock: true,
    shortDescription:
      "Carrot-based malt mix prepared with selected ingredients.",
    productDetails:
      "A convenient malt mix prepared using carrot and selected grains.",
    ingredients:
      "Carrot and selected grains and ingredients.",
    howToUse: "Mix with milk or water and serve.",
    benefits: [
      "Made with carrot",
      "Natural ingredients",
      "Easy to prepare",
    ],
  },

  {
    id: 23,
    name: "Banana Malt",
    slug: "banana-malt",
    category: "malts",
    categoryName: "Malts",
    price: 190,
    weight: "250 g",
    inStock: true,
    shortDescription:
      "Banana-based malt mix with a naturally familiar flavour.",
    productDetails:
      "Prepared using banana and selected natural ingredients.",
    ingredients:
      "Banana and selected grains and ingredients.",
    howToUse: "Mix with milk or water and serve.",
    benefits: [
      "Made with banana",
      "Natural ingredients",
      "Easy to prepare",
    ],
  },

  // =========================================================
  // DOSAI MIXES
  // =========================================================

  {
    id: 24,
    name: "Kambu Dosai Mix",
    slug: "kambu-dosai-mix",
    category: "dosai-mixes",
    categoryName: "Dosai Mixes",
    price: 140,
    weight: "500 g",
    inStock: true,
    shortDescription:
      "Pearl millet dosa mix for convenient traditional cooking.",
    productDetails:
      "Prepared using kambu and selected ingredients for easy dosa preparation.",
    ingredients:
      "Kambu and selected grains and ingredients.",
    howToUse:
      "Mix with water, prepare batter and cook dosa.",
    benefits: [
      "Made with millet",
      "Convenient preparation",
      "Traditional-style food",
    ],
  },

  {
    id: 25,
    name: "Kezhvaragu Dosai Mix",
    slug: "kezhvaragu-dosai-mix",
    category: "dosai-mixes",
    categoryName: "Dosai Mixes",
    price: 140,
    weight: "500 g",
    inStock: true,
    shortDescription:
      "Ragi dosa mix made for convenient everyday cooking.",
    productDetails:
      "Prepared using kezhvaragu and selected ingredients.",
    ingredients:
      "Kezhvaragu and selected grains and ingredients.",
    howToUse:
      "Mix with water, prepare batter and cook dosa.",
    benefits: [
      "Made with ragi",
      "Easy preparation",
      "Suitable for everyday meals",
    ],
  },

  {
    id: 26,
    name: "Kalyana Murungai Dosai Mix",
    slug: "kalyana-murungai-dosai-mix",
    category: "dosai-mixes",
    categoryName: "Dosai Mixes",
    price: 150,
    weight: "500 g",
    inStock: true,
    shortDescription:
      "Traditional dosa mix prepared with kalyana murungai.",
    productDetails:
      "Prepared using kalyana murungai and selected grains.",
    ingredients:
      "Kalyana murungai and selected grains and ingredients.",
    howToUse:
      "Mix with water, prepare batter and cook dosa.",
    benefits: [
      "Made with traditional ingredients",
      "Convenient preparation",
      "Traditional recipe",
    ],
  },

  {
    id: 27,
    name: "Mudakathan Dosai Mix",
    slug: "mudakathan-dosai-mix",
    category: "dosai-mixes",
    categoryName: "Dosai Mixes",
    price: 150,
    weight: "500 g",
    inStock: true,
    shortDescription:
      "Traditional mudakathan dosa mix.",
    productDetails:
      "Prepared using mudakathan and selected grains.",
    ingredients:
      "Mudakathan and selected grains and ingredients.",
    howToUse:
      "Mix with water, prepare batter and cook dosa.",
    benefits: [
      "Made with traditional greens",
      "Easy preparation",
      "Traditional-style meal",
    ],
  },

  // =========================================================
  // MASALA POWDERS
  // =========================================================

  {
    id: 28,
    name: "Chicken Masala",
    slug: "chicken-masala",
    category: "masala-powders",
    categoryName: "Masala Powders",
    price: 100,
    weight: "100 g",
    inStock: true,
    shortDescription:
      "Aromatic masala blend for flavourful chicken dishes.",
    productDetails:
      "A traditional-style spice blend prepared for chicken recipes.",
    ingredients: "Selected spices and herbs.",
    howToUse:
      "Add as required while preparing chicken dishes.",
    benefits: [
      "Aromatic spice blend",
      "Easy to use",
      "Traditional flavour",
    ],
  },

  {
    id: 29,
    name: "Mutton Masala",
    slug: "mutton-masala",
    category: "masala-powders",
    categoryName: "Masala Powders",
    price: 100,
    weight: "100 g",
    inStock: true,
    shortDescription:
      "Traditional spice blend for rich mutton dishes.",
    productDetails:
      "Prepared using selected spices for mutton-based recipes.",
    ingredients: "Selected spices and herbs.",
    howToUse:
      "Add as required while preparing mutton dishes.",
    benefits: [
      "Rich spice blend",
      "Easy to use",
      "Traditional flavour",
    ],
  },

  {
    id: 30,
    name: "Fish Fry Masala",
    slug: "fish-fry-masala",
    category: "masala-powders",
    categoryName: "Masala Powders",
    price: 100,
    weight: "100 g",
    inStock: true,
    shortDescription:
      "Spice blend specially suited for fish fry recipes.",
    productDetails:
      "A flavourful spice blend prepared for fish fry dishes.",
    ingredients: "Selected spices and herbs.",
    howToUse:
      "Mix with fish before frying according to recipe.",
    benefits: [
      "Flavourful spice blend",
      "Easy to use",
      "Suitable for fish fry",
    ],
  },

  {
    id: 31,
    name: "Chicken 65 Masala",
    slug: "chicken-65-masala",
    category: "masala-powders",
    categoryName: "Masala Powders",
    price: 100,
    weight: "100 g",
    inStock: true,
    shortDescription:
      "Spice blend for crispy and flavourful Chicken 65.",
    productDetails:
      "Prepared using selected spices for Chicken 65-style recipes.",
    ingredients: "Selected spices and herbs.",
    howToUse:
      "Mix with chicken according to your recipe.",
    benefits: [
      "Traditional flavour",
      "Easy preparation",
      "Aromatic spice blend",
    ],
  },

  {
    id: 32,
    name: "Garam Masala",
    slug: "garam-masala",
    category: "masala-powders",
    categoryName: "Masala Powders",
    price: 100,
    weight: "100 g",
    inStock: true,
    shortDescription:
      "Aromatic garam masala blend for everyday cooking.",
    productDetails:
      "Prepared using selected spices for a rich aroma and flavour.",
    ingredients:
      "Selected whole and ground spices.",
    howToUse:
      "Add to curries and other dishes as required.",
    benefits: [
      "Aromatic spice blend",
      "Versatile kitchen use",
      "Traditional flavour",
    ],
  },

  {
    id: 33,
    name: "Biryani Masala",
    slug: "biryani-masala",
    category: "masala-powders",
    categoryName: "Masala Powders",
    price: 100,
    weight: "100 g",
    inStock: true,
    shortDescription:
      "Aromatic spice blend for delicious biryani.",
    productDetails:
      "Prepared using selected spices for traditional biryani flavour.",
    ingredients:
      "Selected spices and herbs.",
    howToUse:
      "Add while preparing biryani according to your recipe.",
    benefits: [
      "Aromatic blend",
      "Easy to use",
      "Traditional flavour",
    ],
  },

  {
    id: 34,
    name: "Plain Red Chilli Powder",
    slug: "plain-red-chilli-powder",
    category: "masala-powders",
    categoryName: "Masala Powders",
    price: 90,
    weight: "100 g",
    inStock: true,
    shortDescription:
      "Finely ground red chilli powder for everyday cooking.",
    productDetails:
      "Prepared from selected red chillies and suitable for everyday cooking.",
    ingredients: "Red chilli.",
    howToUse:
      "Use according to taste in your favourite dishes.",
    benefits: [
      "Simple everyday spice",
      "Finely ground",
      "Easy to use",
    ],
  },

  // =========================================================
  // NOODLES
  // =========================================================

  {
    id: 35,
    name: "Samba Gothumai Noodle",
    slug: "samba-gothumai-noodle",
    category: "noodles",
    categoryName: "Noodles",
    price: 120,
    weight: "200 g",
    inStock: true,
    shortDescription:
      "Noodles prepared using samba wheat.",
    productDetails:
      "A traditional-grain inspired noodle option prepared for convenient meals.",
    ingredients:
      "Samba wheat and selected ingredients.",
    howToUse:
      "Cook in boiling water and prepare with your preferred recipe.",
    benefits: [
      "Made with traditional grain",
      "Convenient meal option",
      "Easy to prepare",
    ],
  },

  {
    id: 36,
    name: "Black Rice Noodles",
    slug: "black-rice-noodles",
    category: "noodles",
    categoryName: "Noodles",
    price: 140,
    weight: "200 g",
    inStock: true,
    shortDescription:
      "Noodles prepared using black rice.",
    productDetails:
      "Prepared using black rice and selected ingredients.",
    ingredients:
      "Black rice and selected ingredients.",
    howToUse:
      "Cook in boiling water and prepare according to your recipe.",
    benefits: [
      "Made with black rice",
      "Convenient cooking",
      "Alternative grain option",
    ],
  },

  {
    id: 37,
    name: "Beetroot Noodles",
    slug: "beetroot-noodles",
    category: "noodles",
    categoryName: "Noodles",
    price: 130,
    weight: "200 g",
    inStock: true,
    shortDescription:
      "Colourful beetroot noodles for creative meals.",
    productDetails:
      "Prepared using beetroot and selected ingredients.",
    ingredients:
      "Beetroot and selected ingredients.",
    howToUse:
      "Cook in boiling water and prepare according to your recipe.",
    benefits: [
      "Made with beetroot",
      "Naturally colourful",
      "Easy to prepare",
    ],
  },

  {
    id: 38,
    name: "Carrot Noodles",
    slug: "carrot-noodles",
    category: "noodles",
    categoryName: "Noodles",
    price: 130,
    weight: "200 g",
    inStock: true,
    shortDescription:
      "Carrot-based noodles with a naturally vibrant appearance.",
    productDetails:
      "Prepared using carrot and selected ingredients.",
    ingredients:
      "Carrot and selected ingredients.",
    howToUse:
      "Cook in boiling water and prepare according to your recipe.",
    benefits: [
      "Made with carrot",
      "Naturally colourful",
      "Easy to prepare",
    ],
  },

  {
    id: 39,
    name: "Kezhvaragu Noodles",
    slug: "kezhvaragu-noodles",
    category: "noodles",
    categoryName: "Noodles",
    price: 130,
    weight: "200 g",
    inStock: true,
    shortDescription:
      "Ragi-based noodles for convenient everyday meals.",
    productDetails:
      "Prepared using kezhvaragu and selected ingredients.",
    ingredients:
      "Kezhvaragu and selected ingredients.",
    howToUse:
      "Cook in boiling water and prepare according to your recipe.",
    benefits: [
      "Made with ragi",
      "Millet-based option",
      "Easy to prepare",
    ],
  },

  {
    id: 40,
    name: "Millet Noodles",
    slug: "millet-noodles",
    category: "noodles",
    categoryName: "Noodles",
    price: 130,
    weight: "200 g",
    inStock: true,
    shortDescription:
      "Noodles prepared using selected millets.",
    productDetails:
      "A millet-based noodle option designed for convenient cooking.",
    ingredients:
      "Millets and selected ingredients.",
    howToUse:
      "Cook in boiling water and prepare according to your recipe.",
    benefits: [
      "Made with millets",
      "Convenient meal option",
      "Easy to prepare",
    ],
  },

  {
    id: 41,
    name: "Kezhvaragu Millet Noodles",
    slug: "kezhvaragu-millet-noodles",
    category: "noodles",
    categoryName: "Noodles",
    price: 140,
    weight: "200 g",
    inStock: true,
    shortDescription:
      "Noodles combining kezhvaragu with millet goodness.",
    productDetails:
      "Prepared using kezhvaragu and selected millet ingredients.",
    ingredients:
      "Kezhvaragu, millets and selected ingredients.",
    howToUse:
      "Cook in boiling water and prepare according to your recipe.",
    benefits: [
      "Made with millet",
      "Convenient preparation",
      "Traditional grain option",
    ],
  },

  // =========================================================
  // PASTAS
  // =========================================================

  {
    id: 42,
    name: "Thinai Pasta",
    slug: "thinai-pasta",
    category: "pastas",
    categoryName: "Pastas",
    price: 130,
    weight: "200 g",
    inStock: true,
    shortDescription:
      "Pasta prepared using thinai millet.",
    productDetails:
      "Prepared using thinai and selected ingredients for convenient cooking.",
    ingredients:
      "Thinai and selected ingredients.",
    howToUse:
      "Cook in boiling water and serve with your preferred sauce.",
    benefits: [
      "Made with millet",
      "Easy to cook",
      "Alternative grain option",
    ],
  },

  {
    id: 43,
    name: "Kambu Pasta",
    slug: "kambu-pasta",
    category: "pastas",
    categoryName: "Pastas",
    price: 130,
    weight: "200 g",
    inStock: true,
    shortDescription:
      "Pasta prepared using pearl millet.",
    productDetails:
      "Prepared using kambu and selected ingredients.",
    ingredients:
      "Kambu and selected ingredients.",
    howToUse:
      "Cook in boiling water and serve with your preferred sauce.",
    benefits: [
      "Made with millet",
      "Easy to cook",
      "Convenient meal option",
    ],
  },

  {
    id: 44,
    name: "Kezhvaragu Pasta",
    slug: "kezhvaragu-pasta",
    category: "pastas",
    categoryName: "Pastas",
    price: 130,
    weight: "200 g",
    inStock: true,
    shortDescription:
      "Ragi-based pasta for convenient everyday meals.",
    productDetails:
      "Prepared using kezhvaragu and selected ingredients.",
    ingredients:
      "Kezhvaragu and selected ingredients.",
    howToUse:
      "Cook in boiling water and serve with your preferred sauce.",
    benefits: [
      "Made with ragi",
      "Easy to cook",
      "Millet-based option",
    ],
  },

  {
    id: 45,
    name: "Kollu Pasta",
    slug: "kollu-pasta",
    category: "pastas",
    categoryName: "Pastas",
    price: 140,
    weight: "200 g",
    inStock: true,
    shortDescription:
      "Pasta prepared using kollu.",
    productDetails:
      "Prepared using kollu and selected ingredients.",
    ingredients:
      "Kollu and selected ingredients.",
    howToUse:
      "Cook in boiling water and serve with your preferred sauce.",
    benefits: [
      "Made with traditional ingredient",
      "Easy to cook",
      "Convenient meal option",
    ],
  },

  {
    id: 46,
    name: "Karamani Pasta",
    slug: "karamani-pasta",
    category: "pastas",
    categoryName: "Pastas",
    price: 140,
    weight: "200 g",
    inStock: true,
    shortDescription:
      "Pasta prepared using karamani.",
    productDetails:
      "Prepared using karamani and selected ingredients.",
    ingredients:
      "Karamani and selected ingredients.",
    howToUse:
      "Cook in boiling water and serve with your preferred sauce.",
    benefits: [
      "Made with traditional ingredient",
      "Easy to cook",
      "Convenient meal option",
    ],
  },
];


// =========================================================
// HOME PAGE PRODUCT & BADGE SETTINGS
// =========================================================

const homePageSettings = {
  "kezhvaragu-dosai-mix": {
    showOnHome: true,
    badge: "Best Seller",
    badgeType: "red",
  },

  "karuveppilai-podi": {
    showOnHome: true,
    badge: "Popular",
    badgeType: "green",
  },

  "abc-malt": {
    showOnHome: true,
    badge: "Trending",
    badgeType: "red",
  },

  "poondu-podi": {
    showOnHome: true,
    badge: "Our Pick",
    badgeType: "green",
  },
};

// =========================================================
// CONNECT IMAGE + HOME PAGE SETTINGS TO EVERY PRODUCT
// =========================================================

const productsWithImages = products.map((product) => {
  const homeSettings = homePageSettings[product.slug] || {};

  return {
    ...product,
    image: getProductImage(product.slug),
    showOnHome: homeSettings.showOnHome ?? false,
    badge: homeSettings.badge ?? "",
    badgeType: homeSettings.badgeType ?? "green",
  };
});

export default productsWithImages;
