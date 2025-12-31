const Product = require("../models/Product");

const escapeSvg = (value = "") =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const wrapLabel = (label = "") => {
  const words = label.split(" ");
  const lines = [];
  let currentLine = "";

  words.forEach((word) => {
    const tentative = currentLine ? `${currentLine} ${word}` : word;
    if (tentative.length <= 12) {
      currentLine = tentative;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  });

  if (currentLine) lines.push(currentLine);
  return lines.slice(0, 2);
};

const createImageDataUri = (label, emoji, colors = {}) => {
  const { bg = "#ecfccb", accent = "#bef264", text = "#14532d" } = colors;
  const lines = wrapLabel(label);
  const tspans = lines
    .map(
      (line, index) =>
        `<tspan x="50%" dy="${index === 0 ? 0 : 18}">${escapeSvg(line)}</tspan>`
    )
    .join("");

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
      <rect width="200" height="200" rx="28" fill="${bg}" />
      <circle cx="40" cy="38" r="28" fill="${accent}" opacity="0.45" />
      <circle cx="172" cy="160" r="34" fill="${accent}" opacity="0.3" />
      <text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" font-size="72">${emoji}</text>
      <text x="50%" y="78%" text-anchor="middle" font-family="'Inter', 'Segoe UI', Arial, sans-serif" font-size="16" fill="${text}">
        ${tspans}
      </text>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const seedProducts = async () => {
  try {
    const products = [
      {
        name: "Broccoli",
        brand: "La Manna Fresh",
        picture: createImageDataUri("Broccoli", "🥦", {
          bg: "#ecfccb",
          accent: "#bef264",
          text: "#365314",
        }),
        price: 1.98,
        category: "Fresh Vegetables",
        quantityInStock: 50,
        description: "Fresh organic broccoli, approx 230g",
      },
      {
        name: "Capsicum Red",
        brand: "La Manna Fresh",
        picture: createImageDataUri("Capsicum Red", "🌶️", {
          bg: "#fee2e2",
          accent: "#fecaca",
          text: "#b91c1c",
        }),
        price: 2.02,
        category: "Fresh Vegetables",
        quantityInStock: 40,
        description: "Red capsicum, fresh and crispy",
      },
      {
        name: "Green Beans",
        brand: "La Manna Fresh",
        picture: createImageDataUri("Green Beans", "🫘", {
          bg: "#dcfce7",
          accent: "#bbf7d0",
          text: "#166534",
        }),
        price: 2.50,
        category: "Fresh Vegetables",
        quantityInStock: 35,
        description: "Fresh green beans, approx 250g",
      },
      {
        name: "Cucumbers Lebanese",
        brand: "La Manna Fresh",
        picture: createImageDataUri("Lebanese Cucumber", "🥒", {
          bg: "#d9f99d",
          accent: "#bef264",
          text: "#365314",
        }),
        price: 1.27,
        category: "Fresh Vegetables",
        quantityInStock: 60,
        description: "Lebanese cucumbers, approx 150g each",
      },
      {
        name: "Onion Brown",
        brand: "La Manna Fresh",
        picture: createImageDataUri("Brown Onion", "🧅", {
          bg: "#fef3c7",
          accent: "#fde68a",
          text: "#92400e",
        }),
        price: 0.70,
        category: "Fresh Vegetables",
        quantityInStock: 100,
        description: "Brown onions, approx 200g",
      },
      {
        name: "Carrots",
        brand: "La Manna Fresh",
        picture: createImageDataUri("Carrots", "🥕", {
          bg: "#ffedd5",
          accent: "#fed7aa",
          text: "#c2410c",
        }),
        price: 0.48,
        category: "Fresh Vegetables",
        quantityInStock: 80,
        description: "Fresh carrots, approx 200g",
      },
      {
        name: "Mushrooms Button",
        brand: "La Manna Fresh",
        picture: createImageDataUri("Button Mushroom", "🍄", {
          bg: "#ede9fe",
          accent: "#ddd6fe",
          text: "#5b21b6",
        }),
        price: 1.50,
        category: "Fresh Vegetables",
        quantityInStock: 45,
        description: "Button mushrooms, fresh and white",
      },
      {
        name: "Tomatoes",
        brand: "La Manna Fresh",
        picture: createImageDataUri("Tomatoes", "🍅", {
          bg: "#fee2e2",
          accent: "#fecaca",
          text: "#b91c1c",
        }),
        price: 2.99,
        category: "Fresh Vegetables",
        quantityInStock: 55,
        description: "Ripe red tomatoes, perfect for cooking",
      },
      {
        name: "Cucumber Green",
        brand: "La Manna Fresh",
        picture: createImageDataUri("Green Cucumber", "🥒", {
          bg: "#d9f99d",
          accent: "#bef264",
          text: "#3f6212",
        }),
        price: 1.15,
        category: "Fresh Vegetables",
        quantityInStock: 70,
        description: "Green cucumbers, fresh and crunchy",
      },
      {
        name: "Lettuce Iceberg",
        brand: "La Manna Fresh",
        picture: createImageDataUri("Iceberg Lettuce", "🥬", {
          bg: "#dcfce7",
          accent: "#bbf7d0",
          text: "#15803d",
        }),
        price: 1.85,
        category: "Fresh Vegetables",
        quantityInStock: 30,
        description: "Fresh iceberg lettuce head",
      },
      {
        name: "Spinach",
        brand: "La Manna Fresh",
        picture: createImageDataUri("Spinach", "🍃", {
          bg: "#bbf7d0",
          accent: "#86efac",
          text: "#166534",
        }),
        price: 2.25,
        category: "Fresh Vegetables",
        quantityInStock: 25,
        description: "Fresh baby spinach, organic",
      },
      {
        name: "Cabbage White",
        brand: "La Manna Fresh",
        picture: createImageDataUri("White Cabbage", "🥬", {
          bg: "#e0f2fe",
          accent: "#bae6fd",
          text: "#075985",
        }),
        price: 1.10,
        category: "Fresh Vegetables",
        quantityInStock: 40,
        description: "Fresh white cabbage, crispy",
      },
      {
        name: "Bell Pepper Yellow",
        brand: "La Manna Fresh",
        picture: createImageDataUri("Yellow Pepper", "🌶️", {
          bg: "#fef9c3",
          accent: "#fde047",
          text: "#92400e",
        }),
        price: 2.15,
        category: "Fresh Vegetables",
        quantityInStock: 35,
        description: "Yellow bell pepper, sweet and fresh",
      },
      {
        name: "Garlic Bulb",
        brand: "La Manna Fresh",
        picture: createImageDataUri("Garlic", "🧄", {
          bg: "#fef3c7",
          accent: "#fde68a",
          text: "#92400e",
        }),
        price: 0.95,
        category: "Fresh Vegetables",
        quantityInStock: 90,
        description: "Fresh garlic bulbs, aromatic",
      },
      {
        name: "Ginger",
        brand: "La Manna Fresh",
        picture: createImageDataUri("Ginger", "🫚", {
          bg: "#fef9c3",
          accent: "#fde68a",
          text: "#92400e",
        }),
        price: 1.75,
        category: "Fresh Vegetables",
        quantityInStock: 50,
        description: "Fresh ginger root, pungent and spicy",
      },
      {
        name: "Potatoes Brown",
        brand: "La Manna Fresh",
        picture: createImageDataUri("Brown Potatoes", "🥔", {
          bg: "#fef3c7",
          accent: "#fde68a",
          text: "#92400e",
        }),
        price: 0.85,
        category: "Fresh Vegetables",
        quantityInStock: 120,
        description: "Brown potatoes, versatile cooking",
      },
      {
        name: "Sweet Potato",
        brand: "La Manna Fresh",
        picture: createImageDataUri("Sweet Potato", "🍠", {
          bg: "#fed7aa",
          accent: "#fdba74",
          text: "#9a3412",
        }),
        price: 1.45,
        category: "Fresh Vegetables",
        quantityInStock: 60,
        description: "Orange sweet potato, nutritious",
      },
      {
        name: "Zucchini Green",
        brand: "La Manna Fresh",
        picture: createImageDataUri("Green Zucchini", "🥒", {
          bg: "#d9f99d",
          accent: "#bef264",
          text: "#3f6212",
        }),
        price: 1.65,
        category: "Fresh Vegetables",
        quantityInStock: 45,
        description: "Fresh green zucchini, tender",
      },
      {
        name: "Celery",
        brand: "La Manna Fresh",
        picture: createImageDataUri("Celery", "🥬", {
          bg: "#dcfce7",
          accent: "#bbf7d0",
          text: "#15803d",
        }),
        price: 1.55,
        category: "Fresh Vegetables",
        quantityInStock: 35,
        description: "Fresh celery bunch, crispy stalks",
      },
      {
        name: "Eggplant",
        brand: "La Manna Fresh",
        picture: createImageDataUri("Eggplant", "🍆", {
          bg: "#ede9fe",
          accent: "#ddd6fe",
          text: "#5b21b6",
        }),
        price: 2.10,
        category: "Fresh Vegetables",
        quantityInStock: 30,
        description: "Purple eggplant, smooth skin",
      },
    ];

    // Clear existing products
    await Product.destroy({ where: {} });
    console.log("✅ Cleared existing products");

    // Insert new products
    await Product.bulkCreate(products);
    console.log("✅ Successfully added 20 products to the database");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding products:", error);
    process.exit(1);
  }
};

seedProducts();
