import mongoose from 'mongoose'

const { Schema, model } = mongoose

// ─── User ─────────────────────────────────────────────────────────────────────
const userSchema = new Schema(
  {
    display_name: { type: String, required: true, trim: true },
    phone_number: { type: String, required: true, unique: true, trim: true },
    password_hash: { type: String, required: true },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    staff_number: { type: String, trim: true },
    institution: { type: String, trim: true },
    ghana_card_number: { type: String, trim: true },
    // Delivery defaults (snapshotted into applications)
    address: String,
    landmark: String,
    region: String,
    city: String,
    phone_verified: { type: Boolean, default: false },
    otp_hash: String,
    otp_expires_at: Date,
    token_version: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
)

export function serializeUser(u) {
  if (!u) return null
  return {
    id: String(u._id),
    display_name: u.display_name,
    phone_number: u.phone_number,
    role: u.role,
    staff_number: u.staff_number || undefined,
    institution: u.institution || undefined,
    ghana_card_number: u.ghana_card_number || undefined,
    address: u.address || undefined,
    landmark: u.landmark || undefined,
    region: u.region || undefined,
    city: u.city || undefined,
    phone_verified: u.phone_verified,
    created_at: u.created_at,
    updated_at: u.updated_at,
  }
}

export const User = model('User', userSchema)

// ─── Category ─────────────────────────────────────────────────────────────────
const categorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: String,
    instructions: String,
    tag: String,
    sort_order: { type: Number, default: 0 },
    requires_inquiry: { type: Boolean, default: false },
    orderable: { type: Boolean, default: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
)

export function serializeCategory(c) {
  return {
    id: String(c._id),
    name: c.name,
    description: c.description || undefined,
    instructions: c.instructions || undefined,
    tag: c.tag || undefined,
    sort_order: c.sort_order,
    requires_inquiry: c.requires_inquiry,
    orderable: c.orderable,
    active: c.active,
  }
}

export const Category = model('Category', categorySchema)

// ─── Product ──────────────────────────────────────────────────────────────────
const productImageSchema = new Schema(
  { image_url: { type: String, required: true },public_id: String },
  { timestamps: { createdAt: 'created_at', updatedAt: false } },
)

const productSchema = new Schema(
  {
    legacy_id: Number,
    category_id: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    name: { type: String, required: true, trim: true },
    price: { type: Number, default: 0 }, // 0 = seasonal / no price
    old_price: Number,
    unit: { type: String, default: 'each' },
    display_tag: String,
    description: String,
    instructions: String,
    requires_inquiry: { type: Boolean, default: false },
    orderable: { type: Boolean, default: true },
    images: [productImageSchema],
    active: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
)

productSchema.index({ name: 'text' })

export function serializeProduct(p, categoryName) {
  const cat = categoryName ?? (p.category_id && p.category_id.name ? p.category_id.name : '')
  const catId = p.category_id && p.category_id._id ? p.category_id._id : p.category_id
  const images = (p.images || []).map(img => ({
    id: String(img._id),
    product_id: String(p._id),
    image_url: img.image_url,
    created_at: img.created_at,
  }))
  return {
    id: String(p._id),
    legacy_id: p.legacy_id || undefined,
    category_id: catId ? String(catId) : undefined,
    name: p.name,
    category: cat,
    price: p.price > 0 ? p.price : null,
    old_price: p.old_price ?? null,
    display_tag: p.display_tag || undefined,
    description: p.description || undefined,
    instructions: p.instructions || undefined,
    requires_inquiry: p.requires_inquiry,
    orderable: p.orderable,
    image_url: images[0]?.image_url || undefined,
    images,
    unit: p.unit,
    active: p.active,
  }
}

export const Product = model('Product', productSchema)

// ─── Package ──────────────────────────────────────────────────────────────────
// One collection for all three types. Fixed packages have rich item arrays;
// provisions/detergents have a simple items string + numeric price.
const packageItemSchema = new Schema(
  {
    product_id: String,
    qty: { type: Number, default: 1 },
    label: { type: String, required: true },
    emoji: String,
    image_url: String,
  },
  { _id: false },
)

const packageSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true }, // stable public id, e.g. "starter"
    type: { type: String, enum: ['fixed', 'provisions', 'detergents'], required: true },
    name: { type: String, required: true },
    tagline: String,
    price: Schema.Types.Mixed, // fixed: display string "1,000" · simple: number
    monthly: Schema.Types.Mixed,
    tag: String,
    popular: { type: Boolean, default: false },
    rice_options: String,
    items: Schema.Types.Mixed, // fixed: [packageItemSchema] · simple: string
    sort_order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
)

export function serializeFixedPackage(pkg, productsById = new Map()) {
  const items = Array.isArray(pkg.items) ? pkg.items : []
  return {
    id: pkg.slug,
    name: pkg.name,
    tagline: pkg.tagline || '',
    price: pkg.price ?? '',
    monthly: pkg.monthly ?? '',
    tag: pkg.tag || '',
    popular: Boolean(pkg.popular),
    rice_options: pkg.rice_options || undefined,
    active: pkg.active,
    items: items.map(item => {
      const product = item.product_id ? productsById.get(String(item.product_id)) : null
      return {
        product_id: item.product_id || undefined,
        qty: item.qty || 1,
        label: item.label,
        emoji: item.emoji || undefined,
        image_url: item.image_url || product?.images?.[0]?.image_url || undefined,
        product: product
          ? {
              id: String(product._id),
              name: product.name,
              image_url: product.images?.[0]?.image_url || '',
              unit: product.unit,
              active: product.active,
            }
          : undefined,
      }
    }),
  }
}

export function serializeSimplePackage(pkg) {
  return {
    id: pkg.slug,
    name: pkg.name,
    price: typeof pkg.price === 'number' ? pkg.price : Number(String(pkg.price || '').replace(/[^\d.]/g, '')) || 0,
    items: typeof pkg.items === 'string' ? pkg.items : '',
    active: pkg.active,
  }
}

export const Package = model('Package', packageSchema)
export { packageItemSchema }

// ─── Application ──────────────────────────────────────────────────────────────
const applicationCartItemSchema = new Schema(
  {
    product_id: String,
    name: String,
    image_url: String,
    price: Number,
    quantity: { type: Number, default: 1 },
    subtotal: Number,
  },
  { _id: false },
)

const applicationSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    package_type: { type: String, enum: ['fixed', 'custom'], required: true },
    package_name: String,
    cart_items: [applicationCartItemSchema],
    total_amount: Number,
    monthly_amount: Number,
    status: { type: String, enum: ['pending', 'reviewed', 'approved', 'declined'], default: 'pending', index: true },
    staff_number: String,
    mandate_number: { type: String, required: true },
    institution: String,
    ghana_card_number: String,
    preferred_date: String,
    notes: String,
    address: String,
    landmark: String,
    region: String,
    city: String,
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
)

export function serializeApplication(a, user) {
  return {
    id: String(a._id),
    user_id: String(a.user_id?._id || a.user_id),
    user: user ? serializeUser(user) : a.user_id?.display_name ? serializeUser(a.user_id) : undefined,
    package_type: a.package_type,
    package_name: a.package_name || undefined,
    cart_items: a.cart_items?.length ? a.cart_items.map(i => ({ ...i.toObject?.() ?? i })) : undefined,
    total_amount: a.total_amount ?? undefined,
    monthly_amount: a.monthly_amount ?? undefined,
    status: a.status,
    staff_number: a.staff_number || undefined,
    mandate_number: a.mandate_number,
    institution: a.institution || undefined,
    ghana_card_number: a.ghana_card_number || undefined,
    preferred_date: a.preferred_date || undefined,
    notes: a.notes || undefined,
    address: a.address || undefined,
    landmark: a.landmark || undefined,
    region: a.region || undefined,
    city: a.city || undefined,
    created_at: a.created_at,
    updated_at: a.updated_at,
  }
}

export const Application = model('Application', applicationSchema)

// ─── Conversation & Message ───────────────────────────────────────────────────
const conversationSchema = new Schema(
  {
    customer_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    last_message: String,
    last_message_at: Date,
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
)

const messageSchema = new Schema(
  {
    conversation_id: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
    sender_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    read_at: { type: Date, default: null },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: false } },
)

export function serializeConversation(c, otherUser, unreadCount = 0) {
  return {
    id: String(c._id),
    other_user: serializeUser(otherUser),
    last_message: c.last_message || undefined,
    unread_count: unreadCount,
    created_at: c.created_at,
  }
}

export function serializeMessage(m) {
  return {
    id: String(m._id),
    conversation_id: String(m.conversation_id),
    sender_id: String(m.sender_id),
    content: m.content,
    read_at: m.read_at,
    created_at: m.created_at,
  }
}

export const Conversation = model('Conversation', conversationSchema)
export const Message = model('Message', messageSchema)

// ─── Settings (min_order etc.) ────────────────────────────────────────────────
const settingSchema = new Schema({
  key: { type: String, required: true, unique: true },
  value: Schema.Types.Mixed,
})

export const Setting = model('Setting', settingSchema)

export async function getSetting(key, fallback) {
  const doc = await Setting.findOne({ key }).lean()
  return doc ? doc.value : fallback
}
