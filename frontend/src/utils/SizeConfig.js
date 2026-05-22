/**
 * SIZE_PRESETS — Central size config
 * Admin category mein sizeType set karta hai → product form automatically correct sizes dikhata hai
 */

export const SIZE_PRESETS = {
  none: {
    label: 'No Sizes',
    description: 'Product has no size variants',
    sizes: [],
    icon: '📦'
  },
  clothing: {
    label: 'Clothing (S M L)',
    description: 'T-shirts, Shirts, Kurtas, Tops, Jackets',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
    icon: '👕'
  },
  bottomwear: {
    label: 'Bottomwear (28 30 32...)',
    description: 'Jeans, Pants, Trousers, Shorts — waist size in inches',
    sizes: ['26', '28', '30', '32', '34', '36', '38', '40', '42', '44'],
    icon: '👖'
  },
  footwear: {
    label: 'Footwear (UK Sizes)',
    description: 'Shoes, Sneakers, Sandals, Boots',
    sizes: ['3', '4', '5', '6', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '12'],
    icon: '👟'
  },
  custom: {
    label: 'Custom Sizes',
    description: 'You define the sizes (e.g. laptop inches, furniture dimensions)',
    sizes: [], // populated from category.customSizes
    icon: '✏️'
  }
};

/**
 * getSizesForCategory — given a category object, return the right sizes array
 */
export const getSizesForCategory = (category) => {
  if (!category) return [];
  const type = category.sizeType || 'none';
  if (type === 'none') return [];
  if (type === 'custom') return category.customSizes || [];
  return SIZE_PRESETS[type]?.sizes || [];
};

/**
 * getSizeLabel — human readable label for a sizeType key
 */
export const getSizeLabel = (sizeType) => {
  return SIZE_PRESETS[sizeType]?.label || 'No Sizes';
};

/**
 * getSizeDescription
 */
export const getSizeDescription = (sizeType) => {
  return SIZE_PRESETS[sizeType]?.description || '';
};

export const ALL_SIZE_TYPES = Object.entries(SIZE_PRESETS).map(([key, val]) => ({
  value: key,
  label: val.label,
  description: val.description,
  icon: val.icon,
  sizes: val.sizes
}));