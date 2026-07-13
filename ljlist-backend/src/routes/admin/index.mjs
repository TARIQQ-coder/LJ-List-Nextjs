import { Router } from 'express'
import bcrypt from 'bcryptjs'
import multer from 'multer'
import path from 'node:path'
import crypto from 'node:crypto'
import {
  User, Category, Product, Package, Application, Conversation, Message, Setting,
  serializeUser, serializeCategory, serializeProduct, serializeApplication,
  serializeConversation, serializeMessage, serializeFixedPackage, serializeSimplePackage,
} from '../../models/index.mjs'
import { ok, asyncHandler, badRequest, notFound, unauthorized } from '../../utils/respond.mjs'
import { getPagination, buildMeta } from '../../utils/pagination.mjs'
import { requireAdmin } from '../../middleware/auth.mjs'
import { setAuthCookies } from '../../utils/tokens.mjs'
import { listProducts } from '../products.mjs'
import { loadFixedPackages } from '../packages.mjs'
import { config } from '../../config.mjs'

const router = Router()

// ─── Admin auth ───────────────────────────────────────────────────────────────
router.post('/auth/login', asyncHandler(async (req, res) => {
  const phone = String(req.body?.phone_number || '').replace(/[\s-]/g, '')
  const normalized = /^0\d{9}$/.test(phone) ? `+233${phone.slice(1)}` : phone
  const user = await User.findOne({ phone_number: normalized, role: 'admin' })
  const valid = user && (await bcrypt.compare(String(req.body?.password || ''), user.password_hash))
  if (!valid) throw unauthorized('Incorrect phone number or password.')
  setAuthCookies(res, user)
  ok(res, { user: serializeUser(user) }, { message: 'Signed in.' })
}))

// Everything below requires an admin session
router.use(requireAdmin)

// ─── Users ────────────────────────────────────────────────────────────────────
router.get('/users', asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query, { defaultLimit: 10 })
  const filter = {}
  if (req.query.role) filter.role = req.query.role
  const [users, total] = await Promise.all([
    User.find(filter).sort({ created_at: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ])
  const meta = buildMeta(total, page, limit)
  ok(res, { users: users.map(serializeUser), meta }, { meta })
}))

router.get('/users/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).catch(() => null)
  if (!user) throw notFound('User not found.')
  ok(res, { user: serializeUser(user) })
}))

router.patch('/users/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).catch(() => null)
  if (!user) throw notFound('User not found.')
  const allowed = ['display_name', 'phone_number', 'role', 'staff_number', 'institution', 'ghana_card_number', 'address', 'landmark', 'region', 'city']
  for (const key of allowed) if (key in (req.body || {})) user[key] = req.body[key]
  await user.save()
  ok(res, { user: serializeUser(user) }, { message: 'User updated.' })
}))

// ─── Categories ───────────────────────────────────────────────────────────────
router.get('/categories', asyncHandler(async (_req, res) => {
  const categories = await Category.find().sort({ sort_order: 1, name: 1 })
  ok(res, { categories: categories.map(serializeCategory) })
}))

router.get('/categories/:id', asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id).catch(() => null)
  if (!category) throw notFound('Category not found.')
  ok(res, { category: serializeCategory(category) })
}))

router.post('/categories', asyncHandler(async (req, res) => {
  const { name, sort_order, active, description, instructions, tag, requires_inquiry, orderable } = req.body || {}
  if (!name?.trim()) throw badRequest('Category name is required.', { name: ['Name is required.'] })
  const category = await Category.create({ name: name.trim(), sort_order, active, description, instructions, tag, requires_inquiry, orderable })
  ok(res, serializeCategory(category), { message: 'Category created.', status: 201 })
}))

router.patch('/categories/:id', asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id).catch(() => null)
  if (!category) throw notFound('Category not found.')
  const allowed = ['name', 'sort_order', 'active', 'description', 'instructions', 'tag', 'requires_inquiry', 'orderable']
  for (const key of allowed) if (key in (req.body || {})) category[key] = req.body[key]
  await category.save()
  ok(res, serializeCategory(category), { message: 'Category updated.' })
}))

router.delete('/categories/:id', asyncHandler(async (req, res) => {
  const inUse = await Product.countDocuments({ category_id: req.params.id })
  if (inUse > 0) throw badRequest(`Cannot delete: ${inUse} product(s) still use this category. Move them first.`)
  await Category.findByIdAndDelete(req.params.id)
  ok(res, {}, { message: 'Category deleted.' })
}))

// ─── Products ─────────────────────────────────────────────────────────────────
router.get('/products', asyncHandler(async (req, res) => {
  const { products, meta } = await listProducts(req.query, { includeInactive: true })
  ok(res, { products, meta }, { meta })
}))

router.get('/products/:id', asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('category_id').catch(() => null)
  if (!product) throw notFound('Product not found.')
  ok(res, serializeProduct(product))
}))

router.post('/products', asyncHandler(async (req, res) => {
  const b = req.body || {}
  const errors = {}
  if (!b.name?.trim()) errors.name = ['Product name is required.']
  if (!b.category_id) errors.category_id = ['Category is required.']
  if (Object.keys(errors).length) throw badRequest('Please fix the highlighted fields.', errors)

  const category = await Category.findById(b.category_id).catch(() => null)
  if (!category) throw badRequest('Category not found.', { category_id: ['Choose a valid category.'] })

  const product = await Product.create({
    name: b.name.trim(),
    category_id: category._id,
    price: Number(b.price) || 0,
    old_price: b.old_price != null ? Number(b.old_price) : undefined,
    unit: b.unit || 'each',
    display_tag: b.display_tag,
    description: b.description,
    instructions: b.instructions,
    requires_inquiry: Boolean(b.requires_inquiry),
    orderable: b.orderable !== false,
    active: b.active !== false,
  })
  await product.populate('category_id')
  ok(res, serializeProduct(product), { message: 'Product created.', status: 201 })
}))

router.patch('/products/:id', asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).catch(() => null)
  if (!product) throw notFound('Product not found.')
  const b = req.body || {}
  if (b.category_id) {
    const category = await Category.findById(b.category_id).catch(() => null)
    if (!category) throw badRequest('Category not found.', { category_id: ['Choose a valid category.'] })
    product.category_id = category._id
  }
  const fields = ['name', 'unit', 'display_tag', 'description', 'instructions']
  for (const key of fields) if (key in b) product[key] = b[key]
  if ('price' in b) product.price = Number(b.price) || 0
  if ('old_price' in b) product.old_price = b.old_price != null ? Number(b.old_price) : undefined
  if ('requires_inquiry' in b) product.requires_inquiry = Boolean(b.requires_inquiry)
  if ('orderable' in b) product.orderable = Boolean(b.orderable)
  if ('active' in b) product.active = Boolean(b.active)
  await product.save()
  await product.populate('category_id')
  ok(res, serializeProduct(product), { message: 'Product updated.' })
}))

router.delete('/products/:id', asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).catch(() => null)
  if (!product) throw notFound('Product not found.')
  product.active = false // soft delete — keeps application history intact
  await product.save()
  ok(res, {}, { message: 'Product deactivated.' })
}))

// ─── Product images (multipart field: "images") ──────────────────────────────
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, path.resolve('uploads')),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg'
    cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`)
  },
})
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 8 },
  fileFilter: (_req, file, cb) => {
    const okType = /image\/(jpeg|png|webp|gif|svg\+xml)/.test(file.mimetype)
    cb(okType ? null : badRequest('Only image files are allowed.'), okType)
  },
})

const serializeImages = product =>
  (product.images || []).map(img => ({
    id: String(img._id),
    product_id: String(product._id),
    image_url: img.image_url,
    created_at: img.created_at,
  }))

router.get('/products/:id/images', asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).catch(() => null)
  if (!product) throw notFound('Product not found.')
  ok(res, { images: serializeImages(product) })
}))

router.post('/products/:id/images', upload.array('images', 8), asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).catch(() => null)
  if (!product) throw notFound('Product not found.')
  if (!req.files?.length) throw badRequest('No images uploaded.', { images: ['Attach at least one image.'] })
  for (const file of req.files) {
    product.images.push({ image_url: `${config.publicUrl}/uploads/${file.filename}` })
  }
  await product.save()
  ok(res, { images: serializeImages(product) }, { message: `${req.files.length} image(s) uploaded.`, status: 201 })
}))

router.delete('/products/:id/images/:imageId', asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).catch(() => null)
  if (!product) throw notFound('Product not found.')
  product.images = product.images.filter(img => String(img._id) !== req.params.imageId)
  await product.save()
  ok(res, {}, { message: 'Image removed.' })
}))

// ─── Packages ─────────────────────────────────────────────────────────────────
const PACKAGE_TYPES = { fixed: 'fixed', provisions: 'provisions', detergents: 'detergents' }

const serializeByType = (pkg, productsById) =>
  pkg.type === 'fixed' ? serializeFixedPackage(pkg, productsById) : serializeSimplePackage(pkg)

const slugify = name =>
  String(name).toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

async function productsMapFor(pkg) {
  const ids = (Array.isArray(pkg.items) ? pkg.items : []).map(i => i.product_id).filter(Boolean)
  if (!ids.length) return new Map()
  const products = await Product.find({ _id: { $in: ids } })
  return new Map(products.map(p => [String(p._id), p]))
}

router.get('/packages', asyncHandler(async (_req, res) => {
  const [fixed, provisions, detergents] = await Promise.all([
    loadFixedPackages(),
    Package.find({ type: 'provisions' }).sort({ sort_order: 1 }),
    Package.find({ type: 'detergents' }).sort({ sort_order: 1 }),
  ])
  // include inactive fixed too, for admin management
  const inactiveFixed = await Package.find({ type: 'fixed', active: false }).sort({ sort_order: 1 })
  const inactiveSerialized = []
  for (const pkg of inactiveFixed) inactiveSerialized.push(serializeFixedPackage(pkg, await productsMapFor(pkg)))

  ok(res, {
    fixed_packages: [...fixed, ...inactiveSerialized],
    provisions_packages: provisions.map(serializeSimplePackage),
    detergent_packages: detergents.map(serializeSimplePackage),
  })
}))

async function findPackage(type, slugOrId) {
  const byslug = await Package.findOne({ type, slug: slugOrId })
  if (byslug) return byslug
  return Package.findOne({ type, _id: slugOrId }).catch(() => null)
}

router.get('/packages/:type/:id', asyncHandler(async (req, res) => {
  const type = PACKAGE_TYPES[req.params.type]
  if (!type) throw notFound('Unknown package type.')
  const pkg = await findPackage(type, req.params.id)
  if (!pkg) throw notFound('Package not found.')
  ok(res, serializeByType(pkg, await productsMapFor(pkg)))
}))

router.post('/packages/:type', asyncHandler(async (req, res) => {
  const type = PACKAGE_TYPES[req.params.type]
  if (!type) throw notFound('Unknown package type.')
  const b = req.body || {}
  if (!b.name?.trim()) throw badRequest('Package name is required.', { name: ['Name is required.'] })

  const slug = b.id?.trim() || slugify(b.name)
  const exists = await Package.findOne({ slug })
  if (exists) throw badRequest('A package with this id already exists.', { id: ['Choose a different id.'] })

  const pkg = await Package.create({
    slug, type,
    name: b.name.trim(),
    tagline: b.tagline,
    price: b.price,
    monthly: b.monthly,
    tag: b.tag,
    popular: Boolean(b.popular),
    rice_options: b.rice_options,
    items: b.items ?? (type === 'fixed' ? [] : ''),
    sort_order: Number(b.sort_order) || 0,
  })
  ok(res, serializeByType(pkg, await productsMapFor(pkg)), { message: 'Package created.', status: 201 })
}))

router.patch('/packages/:type/:id/reactivate', asyncHandler(async (req, res) => {
  const type = PACKAGE_TYPES[req.params.type]
  const pkg = await findPackage(type, req.params.id)
  if (!pkg) throw notFound('Package not found.')
  pkg.active = true
  await pkg.save()
  ok(res, serializeByType(pkg, await productsMapFor(pkg)), { message: 'Package reactivated.' })
}))

router.patch('/packages/:type/:id', asyncHandler(async (req, res) => {
  const type = PACKAGE_TYPES[req.params.type]
  const pkg = await findPackage(type, req.params.id)
  if (!pkg) throw notFound('Package not found.')
  const b = req.body || {}
  const fields = ['name', 'tagline', 'price', 'monthly', 'tag', 'rice_options', 'items', 'sort_order']
  for (const key of fields) if (key in b) pkg[key] = b[key]
  if ('popular' in b) pkg.popular = Boolean(b.popular)
  if ('active' in b) pkg.active = Boolean(b.active)
  await pkg.save()
  ok(res, serializeByType(pkg, await productsMapFor(pkg)), { message: 'Package updated.' })
}))

router.delete('/packages/:type/:id', asyncHandler(async (req, res) => {
  const type = PACKAGE_TYPES[req.params.type]
  const pkg = await findPackage(type, req.params.id)
  if (!pkg) throw notFound('Package not found.')
  pkg.active = false // soft delete; reactivate endpoint restores it
  await pkg.save()
  ok(res, {}, { message: 'Package deactivated.' })
}))

// ─── Applications ─────────────────────────────────────────────────────────────
router.get('/applications', asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query, { defaultLimit: 10 })
  const filter = {}
  if (req.query.status) filter.status = req.query.status
  const [items, total] = await Promise.all([
    Application.find(filter).sort({ created_at: -1 }).skip(skip).limit(limit).populate('user_id'),
    Application.countDocuments(filter),
  ])
  const meta = buildMeta(total, page, limit)
  ok(res, { applications: items.map(a => serializeApplication(a, a.user_id)), meta }, { meta })
}))

router.get('/applications/:id', asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id).populate('user_id').catch(() => null)
  if (!application) throw notFound('Application not found.')
  ok(res, { application: serializeApplication(application, application.user_id) })
}))

router.patch('/applications/:id', asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id).populate('user_id').catch(() => null)
  if (!application) throw notFound('Application not found.')
  const status = req.body?.status
  if (!['pending', 'reviewed', 'approved', 'declined'].includes(status)) {
    throw badRequest('Invalid status.', { status: ['Choose pending, reviewed, approved or declined.'] })
  }
  application.status = status
  await application.save()
  ok(res, serializeApplication(application, application.user_id), { message: `Application marked ${status}.` })
}))

// ─── Conversations ────────────────────────────────────────────────────────────
router.get('/conversations', asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query, { defaultLimit: 10 })
  const [convos, total] = await Promise.all([
    Conversation.find().sort({ last_message_at: -1 }).skip(skip).limit(limit).populate('customer_id'),
    Conversation.countDocuments(),
  ])
  const results = []
  for (const convo of convos) {
    const unread = await Message.countDocuments({
      conversation_id: convo._id,
      sender_id: convo.customer_id?._id || convo.customer_id,
      read_at: null,
    })
    results.push(serializeConversation(convo, convo.customer_id, unread))
  }
  const meta = buildMeta(total, page, limit)
  ok(res, { conversations: results, meta }, { meta })
}))

router.post('/conversations/:id/messages', asyncHandler(async (req, res) => {
  const convo = await Conversation.findById(req.params.id).catch(() => null)
  if (!convo) throw notFound('Conversation not found.')
  const content = String(req.body?.content || '').trim()
  if (!content) throw badRequest('Message cannot be empty.', { content: ['Type a message first.'] })
  const message = await Message.create({ conversation_id: convo._id, sender_id: req.user._id, content })
  convo.last_message = content
  convo.last_message_at = new Date()
  await convo.save()
  ok(res, serializeMessage(message), { message: 'Message sent.', status: 201 })
}))

// ─── Dashboard ────────────────────────────────────────────────────────────────
const RANGE_DAYS = { week: 7, month: 30, quarter: 90, year: 365 }

router.get('/dashboard', asyncHandler(async (req, res) => {
  const range = req.query.range || 'week'
  const to = req.query.to ? new Date(req.query.to) : new Date()
  const days = RANGE_DAYS[range] || 7
  const from = req.query.from ? new Date(req.query.from) : new Date(to.getTime() - (days - 1) * 24 * 3600 * 1000)
  from.setHours(0, 0, 0, 0)
  to.setHours(23, 59, 59, 999)

  const countsByDay = async Model => {
    const rows = await Model.aggregate([
      { $match: { created_at: { $gte: from, $lte: to } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } }, count: { $sum: 1 } } },
    ])
    return new Map(rows.map(r => [r._id, r.count]))
  }

  const [totals, userDays, productDays, appDays, convoDays, msgDays] = await Promise.all([
    Promise.all([
      User.countDocuments(), Product.countDocuments(), Application.countDocuments(),
      Conversation.countDocuments(), Message.countDocuments(),
    ]),
    countsByDay(User), countsByDay(Product), countsByDay(Application),
    countsByDay(Conversation), countsByDay(Message),
  ])

  const series = []
  for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
    const key = d.toISOString().slice(0, 10)
    series.push({
      date: key,
      users: userDays.get(key) || 0,
      products: productDays.get(key) || 0,
      applications: appDays.get(key) || 0,
      conversations: convoDays.get(key) || 0,
      messages: msgDays.get(key) || 0,
    })
  }

  ok(res, {
    from: from.toISOString(), to: to.toISOString(), range,
    total_users: totals[0], total_products: totals[1], total_applications: totals[2],
    total_conversations: totals[3], total_messages: totals[4],
    series,
  })
}))

// ─── Settings ─────────────────────────────────────────────────────────────────
router.patch('/settings/min-order', asyncHandler(async (req, res) => {
  const value = Number(req.body?.min_order)
  if (!Number.isFinite(value) || value < 0) throw badRequest('Enter a valid amount.', { min_order: ['Enter a valid amount.'] })
  await Setting.findOneAndUpdate({ key: 'min_order' }, { value }, { upsert: true })
  ok(res, { min_order: value }, { message: 'Minimum order updated.' })
}))

export default router
