export function slugifyCategory(name = '') {
  return name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function normalizeApiCategory(category) {
  const name = category.name || category.label || ''
  const slug = slugifyCategory(name)
  const id =
    category.id ||
    {
      // Rice variations
      'rice-spaghetti-and-grains': 'rice',
      'rice-and-grains': 'rice',
      'rice-grains': 'rice',
      rice: 'rice',
      // Oil
      'cooking-oil': 'oil',
      oil: 'oil',
      // Canned
      'canned-fish-and-tin-tomatoes': 'canned',
      'canned-fish': 'canned',
      canned: 'canned',
      // Provisions — catch singular and plural
      provisions: 'provisions',
      provision: 'provisions',
      // Frozen
      'frozen-foods': 'frozen',
      'frozen-food': 'frozen',
      frozen: 'frozen',
      // Detergents — catch singular and plural, and "cleaning"
      detergents: 'cleaning',
      detergent: 'cleaning',
      cleaning: 'cleaning',
      'cleaning-products': 'cleaning',
      // Vegetables / fresh
      vegetables: 'fresh',
      vegetable: 'fresh',
      fresh: 'fresh',
      'fresh-produce': 'fresh',
    }[slug] ||
    slug

  return {
    id,
    apiId: category.id,
    label: name,
    description: category.description || name,
  }
}

export function normalizeApiProduct(product, categories = []) {
  const categoryName = product.category || product.category_name || ''
  const category = categories.find(cat => cat.apiId === product.category_id || cat.label === categoryName)
  const id = product.id || product.legacy_id
  const price = product.price === 0 || product.price === null ? null : product.price

  return {
    id,
    legacyId: product.legacy_id,
    name: product.name,
    cat: category?.id || slugifyCategory(categoryName) || 'uncategorized',
    price,
    oldPrice: product.old_price ?? (price ? Math.ceil(price * 1.1) : null),
    unit: product.unit,
    img: product.image_url || product.images?.[0]?.image_url || null,
    tag: product.tag || (price === null ? 'Seasonal' : 'In Stock'),
    apiId: product.id,
    active: product.active,
  }
}

export function normalizeFixedPackage(pkg) {
  return {
    ...pkg,
    riceOptions: pkg.riceOptions || pkg.rice_options || '',
    items: (pkg.items || []).map(item => ({
      ...item,
      productId: item.productId || item.product_id,
      qty: item.qty || item.quantity || 1,
      img: item.img || item.image_url || item.product?.image_url || '',
    })),
  }
}

export function packageOptionFor(pkg) {
  if (!pkg) return ''
  if (pkg.id === 'custom') return 'CUSTOMIZED REQUEST (Call/WhatsApp 0244854206)'
  const rawPrice = String(pkg.price || '').replace(/[^\d,]/g, '')
  return `${String(pkg.name || '').toUpperCase()}${rawPrice ? ` (GHC${rawPrice})` : ''}`
}
