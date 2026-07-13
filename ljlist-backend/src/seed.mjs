// Seeds a fresh database with an admin user, categories, products, and packages
// so both the storefront and the admin panel are fully populated on first run.
//
//   npm run seed            → seeds only if the database is empty
//   npm run seed -- --fresh → wipes catalog collections and reseeds
//
// Product image paths reference the storefront's /public/images folder, so they
// render on the Next.js site without any uploads.

import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import { connectDb } from './db.mjs'
import { User, Category, Product, Package, Setting } from './models/index.mjs'

const ADMIN_PHONE = process.env.SEED_ADMIN_PHONE || '+233240000001'
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'admin1234'

const CATEGORIES = [
  { name: 'Rice & Grains', sort_order: 1, description: 'Premium rice brands and grains' },
  { name: 'Cooking Oil', sort_order: 2, description: 'Vegetable, sunflower and palm oils' },
  { name: 'Canned Fish & Tin Tomatoes', sort_order: 3, description: 'Sardines, mackerel and tomato paste' },
  { name: 'Provisions', sort_order: 4, description: 'Milk, beverages, cereals and pantry staples' },
  { name: 'Frozen Foods', sort_order: 5, description: 'Chicken and frozen proteins', instructions: 'Frozen items are delivered separately within Accra & Tema only.' },
  { name: 'Detergents', sort_order: 6, description: 'Soaps and cleaning products' },
  { name: 'Vegetables', sort_order: 7, description: 'Fresh market produce', requires_inquiry: true, instructions: 'Fresh produce prices vary with the market — enquire for today\'s price.' },
]

// [name, category, price, oldPrice, unit, image, tag]
const PRODUCTS = [
  ['Royal Aroma Perfumed Rice 25kg', 'Rice & Grains', 620, 680, '25kg bag', '/images/royal.jpg', 'Best Seller'],
  ['Ginny Gold Rice 25kg', 'Rice & Grains', 560, 610, '25kg bag', '/images/ginny45kg.png', 'Popular'],
  ['Millicent Jasmine Rice 25kg', 'Rice & Grains', 585, 640, '25kg bag', '/images/Millicent-Rice-25kg_R.jpg', ''],
  ['Cindy Rice 25kg', 'Rice & Grains', 540, 590, '25kg bag', '/images/CINDY-25KG-300x300-1.jpg', ''],
  ['Lele Rice 5kg', 'Rice & Grains', 145, 160, '5kg bag', '/images/lele-rice-5kg.jpg', ''],
  ['Royal Feast Rice 4.5kg', 'Rice & Grains', 130, 145, '4.5kg bag', '/images/royal-feast-rice.png', ''],
  ['Oba Spaghetti (Pack)', 'Rice & Grains', 12, 15, 'pack', '/images/Oba-Spagetti-405x330.jpg', ''],
  ['Brown Rice 5kg', 'Rice & Grains', 165, 180, '5kg bag', '/images/brown-rice-1.jpg', ''],

  ['Frytol Cooking Oil 5L', 'Cooking Oil', 260, 285, '5L', '/images/frytol-oil.png', 'Best Seller'],
  ['Cindy Sunflower Oil 1L', 'Cooking Oil', 58, 65, '1L', '/images/Cindy-Sunflower-1L.jpg', ''],
  ['Magic Sunflower Oil 5L', 'Cooking Oil', 245, 270, '5L', '/images/Magic-Sunflower-5L.jpg', ''],
  ['Sunflower Oil 1L', 'Cooking Oil', 55, 62, '1L', '/images/Sunflower-Oil-1L.png', ''],
  ['Palm Oil 4L', 'Cooking Oil', 150, 170, '4L', '/images/palm-oil.jpeg', ''],

  ['Titus Sardines', 'Canned Fish & Tin Tomatoes', 18, 22, 'tin', '/images/titus-sardines.png', 'Popular'],
  ['Geisha Mackerel', 'Canned Fish & Tin Tomatoes', 20, 24, 'tin', '/images/geisha.jpg', ''],
  ['Ginny Sardine', 'Canned Fish & Tin Tomatoes', 15, 18, 'tin', '/images/Ginny-Sardine.jpg', ''],
  ['Magic Mackerel', 'Canned Fish & Tin Tomatoes', 17, 20, 'tin', '/images/Magic-Mackerel.jpg', ''],
  ['Gino Tomato Paste 400g', 'Canned Fish & Tin Tomatoes', 14, 17, '400g tin', '/images/gino-tomato-paste.png', ''],
  ['Tasty Tom Tomato Paste 2.2kg', 'Canned Fish & Tin Tomatoes', 68, 78, '2.2kg tin', '/images/Taste-Tom-2.2kg.jpg', ''],
  ['African Queen Tomato Mix 420g', 'Canned Fish & Tin Tomatoes', 16, 19, '420g tin', '/images/African-Queen-420g.jpeg', ''],

  ['Peak Milk Powder', 'Provisions', 95, 108, '400g tin', '/images/PEAK-405x330.jpg', 'Popular'],
  ['Ideal Evaporated Milk 160g', 'Provisions', 9, 11, '160g tin', '/images/IDEAL-ORIGINAL-EVAPORATED-MILK-160G-405x330.jpg', ''],
  ['Carnation Tea Creamer 160g', 'Provisions', 10, 12, '160g tin', '/images/CARNATION-TEA-CREAMER-160G-405x330.jpg', ''],
  ['Milo 400g', 'Provisions', 62, 70, '400g tin', '/images/Milo-Antigen-E-400g-405x330.jpg', ''],
  ['Good Morning Oats 500g', 'Provisions', 28, 32, '500g', '/images/Good-Morning-Oats-500g-405x330.jpg', ''],
  ['Indomie Chicken Super Pack 120g', 'Provisions', 8, 10, 'pack', '/images/INDOMIE-NOODLES-SUPER-PACK-CHICKEN-120G-405x330.jpg', ''],
  ['Cornflakes', 'Provisions', 45, 52, 'box', '/images/cornflakes.jpg', ''],
  ['Tom Brown (Big Size)', 'Provisions', 35, 40, 'pack', '/images/Givite-Tombrown-Big-Size-405x330.jpeg', ''],

  ['Chicken Thighs 10kg', 'Frozen Foods', 380, 420, '10kg carton', '/images/Chicken-thigh.jpeg', 'Best Seller'],
  ['Chicken Wings 10kg', 'Frozen Foods', 420, 460, '10kg carton', '/images/chicken-wings.jpeg', ''],
  ['Chicken Drumsticks 10kg', 'Frozen Foods', 360, 395, '10kg carton', '/images/drumstick.jpeg', ''],
  ['Gizzard 10kg', 'Frozen Foods', 340, 375, '10kg carton', '/images/gizzard.jpeg', ''],
  ['Sausages', 'Frozen Foods', 85, 95, 'pack', '/images/sausage.jpg', ''],

  ['Madar Washing Powder 180g', 'Detergents', 6, 8, '180g', '/images/Madar-Washing-Powder-180g-405x330.jpg', ''],
  ['Madar Soap (Large)', 'Detergents', 12, 14, 'bar', '/images/Madar-Soap-Large-Size-405x330.png', ''],
  ['Morning Fresh Dishwash 750ml', 'Detergents', 32, 36, '750ml', '/images/Morning-Fresh-Dishwash-750ml-405x330.jpg', ''],
  ['Sunlight Dishwashing Liquid 750ml', 'Detergents', 30, 34, '750ml', '/images/sunlight-750ml-dishwashing-liquid-soap-with-real-lemon-juice.jpg', ''],
  ['Camel Antiseptic Liquid', 'Detergents', 25, 29, 'bottle', '/images/Camel-Antiseptic-Liquid-Zesty-Lime-Fresh-405x330.png', ''],
  ['Glade Air Freshener', 'Detergents', 22, 26, 'can', '/images/glade.jpg', ''],

  ['Fresh Tomatoes (Basket)', 'Vegetables', 0, null, 'basket', '/images/Fresh-tomatoes.jpeg', 'Seasonal'],
  ['Fresh Onions (Basket)', 'Vegetables', 0, null, 'basket', '/images/Fresh-Onions.jpeg', 'Seasonal'],
  ['Fresh Pepper (Basket)', 'Vegetables', 0, null, 'basket', '/images/Fresh-pepper.jpeg', 'Seasonal'],
  ['Plantain (per kg)', 'Vegetables', 0, null, 'kg', '/images/0018390_stella-plantain-kg.jpeg', 'Seasonal'],
]

async function seed() {
  await connectDb()

  const fresh = process.argv.includes('--fresh')
  const productCount = await Product.countDocuments()
  if (productCount > 0 && !fresh) {
    console.log(`Database already has ${productCount} products. Run with --fresh to wipe & reseed the catalog.`)
  } else {
    if (fresh) {
      await Promise.all([Category.deleteMany({}), Product.deleteMany({}), Package.deleteMany({})])
      console.log('✓ Cleared categories, products, packages')
    }

    const categories = await Category.insertMany(CATEGORIES)
    const catByName = new Map(categories.map(c => [c.name, c]))
    console.log(`✓ ${categories.length} categories`)

    const products = await Product.insertMany(
      PRODUCTS.map(([name, cat, price, old_price, unit, image, tag]) => ({
        name,
        category_id: catByName.get(cat)._id,
        price,
        old_price: old_price ?? undefined,
        unit,
        display_tag: tag || undefined,
        requires_inquiry: catByName.get(cat).requires_inquiry || false,
        orderable: price > 0,
        images: image ? [{ image_url: image }] : [],
      })),
    )
    const prodByName = new Map(products.map(p => [p.name, p]))
    console.log(`✓ ${products.length} products`)

    const item = (name, qty, emoji) => {
      const p = prodByName.get(name)
      return { product_id: String(p._id), qty, label: `${p.name} ×${qty}`, emoji, image_url: p.images[0]?.image_url }
    }

    await Package.insertMany([
      {
        slug: 'starter', type: 'fixed', name: 'Starter Package', sort_order: 1,
        tagline: 'Essentials for a small household', price: '1,000', monthly: '334', tag: 'GHC 1,000',
        rice_options: 'Choose Ginny Gold, Cindy or Lele rice',
        items: [
          item('Ginny Gold Rice 25kg', 1, '🍚'),
          item('Cindy Sunflower Oil 1L', 2, '🛢️'),
          item('Titus Sardines', 6, '🐟'),
          item('Gino Tomato Paste 400g', 4, '🥫'),
          item('Ideal Evaporated Milk 160g', 6, '🥛'),
          item('Madar Washing Powder 180g', 4, '🧼'),
        ],
      },
      {
        slug: 'family', type: 'fixed', name: 'Family Package', sort_order: 2, popular: true,
        tagline: 'Everything a family needs for the month', price: '2,000', monthly: '667', tag: 'MOST POPULAR',
        rice_options: 'Choose Royal Aroma, Millicent or Ginny Gold rice',
        items: [
          item('Royal Aroma Perfumed Rice 25kg', 1, '🍚'),
          item('Frytol Cooking Oil 5L', 1, '🛢️'),
          item('Titus Sardines', 10, '🐟'),
          item('Geisha Mackerel', 6, '🐟'),
          item('Tasty Tom Tomato Paste 2.2kg', 1, '🥫'),
          item('Peak Milk Powder', 1, '🥛'),
          item('Milo 400g', 1, '☕'),
          item('Morning Fresh Dishwash 750ml', 1, '🧴'),
        ],
      },
      {
        slug: 'executive', type: 'fixed', name: 'Executive Package', sort_order: 3,
        tagline: 'Premium bundle with frozen chicken included', price: '3,500', monthly: '1,167', tag: 'PREMIUM',
        rice_options: 'Royal Aroma or Millicent Jasmine rice',
        items: [
          item('Royal Aroma Perfumed Rice 25kg', 1, '🍚'),
          item('Millicent Jasmine Rice 25kg', 1, '🍚'),
          item('Frytol Cooking Oil 5L', 1, '🛢️'),
          item('Chicken Thighs 10kg', 1, '🍗'),
          item('Titus Sardines', 12, '🐟'),
          item('Tasty Tom Tomato Paste 2.2kg', 2, '🥫'),
          item('Peak Milk Powder', 2, '🥛'),
          item('Milo 400g', 2, '☕'),
          item('Cornflakes', 1, '🥣'),
          item('Sunlight Dishwashing Liquid 750ml', 2, '🧴'),
        ],
      },
      {
        slug: 'provisions-basic', type: 'provisions', name: 'Provisions Basic', sort_order: 1,
        price: 350, items: 'Peak Milk · Milo 400g · Oats · Indomie ×10 · Tea Creamer ×4 · Cornflakes',
      },
      {
        slug: 'provisions-plus', type: 'provisions', name: 'Provisions Plus', sort_order: 2,
        price: 550, items: 'Peak Milk ×2 · Milo 400g ×2 · Oats ×2 · Indomie ×20 · Cornflakes · Tom Brown',
      },
      {
        slug: 'detergents-basic', type: 'detergents', name: 'Detergents Basic', sort_order: 1,
        price: 200, items: 'Madar Powder ×6 · Madar Soap ×4 · Morning Fresh 750ml · Antiseptic',
      },
      {
        slug: 'detergents-plus', type: 'detergents', name: 'Detergents Plus', sort_order: 2,
        price: 320, items: 'Madar Powder ×10 · Madar Soap ×6 · Morning Fresh ×2 · Sunlight ×2 · Glade',
      },
    ])
    console.log('✓ 3 fixed + 4 department packages')

    await Setting.findOneAndUpdate({ key: 'min_order' }, { value: 300 }, { upsert: true })
    console.log('✓ min_order = 300')
  }

  const admin = await User.findOne({ phone_number: ADMIN_PHONE })
  if (!admin) {
    await User.create({
      display_name: 'LJ-list Admin',
      phone_number: ADMIN_PHONE,
      password_hash: await bcrypt.hash(ADMIN_PASSWORD, 10),
      role: 'admin',
      phone_verified: true,
    })
    console.log(`✓ Admin user: ${ADMIN_PHONE} / ${ADMIN_PASSWORD}  ← change this password!`)
  } else {
    console.log(`✓ Admin user already exists: ${ADMIN_PHONE}`)
  }

  await mongoose.disconnect()
  console.log('Done.')
}

seed().catch(err => {
  console.error('Seed failed:', err)
  process.exit(1)
})
