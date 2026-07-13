import { Router } from 'express'
import { Application, Product, getSetting, serializeApplication } from '../models/index.mjs'
import { ok, asyncHandler, badRequest, notFound } from '../utils/respond.mjs'
import { getPagination, buildMeta } from '../utils/pagination.mjs'
import { requireAuth } from '../middleware/auth.mjs'

const router = Router()

router.post('/', requireAuth, asyncHandler(async (req, res) => {
  const b = req.body || {}
  const errors = {}
  if (!b.mandate_number?.trim()) errors.mandate_number = ['Mandate number is required.']
  if (!['fixed', 'custom'].includes(b.package_type)) errors.package_type = ['Choose a package or build a custom cart.']
  if (b.package_type === 'fixed' && !b.package_name?.trim()) errors.package_name = ['Select a package.']
  if (b.package_type === 'custom' && !Array.isArray(b.cart_items)) errors.cart_items = ['Your cart is empty.']
  if (Object.keys(errors).length) throw badRequest('Please fix the highlighted fields.', errors)

  const user = req.user
  let cart_items, total_amount, monthly_amount

  if (b.package_type === 'custom') {
    const ids = b.cart_items.map(i => i.product_id).filter(Boolean)
    const products = await Product.find({ _id: { $in: ids } })
    const byId = new Map(products.map(p => [String(p._id), p]))

    cart_items = b.cart_items.map(item => {
      const p = byId.get(String(item.product_id))
      const quantity = Math.max(1, Number(item.quantity) || 1)
      const price = p?.price || 0
      return {
        product_id: String(item.product_id),
        name: p?.name || item.name || 'Unknown product',
        image_url: p?.images?.[0]?.image_url,
        price,
        quantity,
        subtotal: price * quantity,
      }
    })
    total_amount = cart_items.reduce((s, i) => s + (i.subtotal || 0), 0)

    const minOrder = await getSetting('min_order', 300)
    if (total_amount < minOrder) {
      throw badRequest(`Minimum order is GH₵${minOrder}.`, { cart_items: [`Your cart total (GH₵${total_amount}) is below the minimum of GH₵${minOrder}.`] })
    }
    monthly_amount = Math.ceil(total_amount / 3)
  }

  const application = await Application.create({
    user_id: user._id,
    package_type: b.package_type,
    package_name: b.package_name,
    cart_items,
    total_amount,
    monthly_amount,
    staff_number: b.staff_number || user.staff_number,
    mandate_number: b.mandate_number.trim(),
    institution: b.institution || user.institution,
    ghana_card_number: b.ghana_card_number || user.ghana_card_number,
    preferred_date: b.preferred_date,
    notes: b.notes,
    // Delivery snapshot — request body wins, profile is the fallback
    address: b.address ?? user.address,
    landmark: b.landmark ?? user.landmark,
    region: b.region ?? user.region,
    city: b.city ?? user.city,
  })

  // Keep profile defaults fresh for next time
  const profileUpdates = ['staff_number', 'institution', 'ghana_card_number']
  let touched = false
  for (const key of profileUpdates) {
    if (b[key] && b[key] !== user[key]) { user[key] = b[key]; touched = true }
  }
  if (b.address) {
    for (const key of ['address', 'landmark', 'region', 'city']) {
      if (b[key] && b[key] !== user[key]) { user[key] = b[key]; touched = true }
    }
  }
  if (touched) await user.save()

  ok(res, { application: serializeApplication(application) }, { message: 'Application submitted. We will contact you shortly.', status: 201 })
}))

router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query)
  const filter = { user_id: req.user._id }
  const [items, total] = await Promise.all([
    Application.find(filter).sort({ created_at: -1 }).skip(skip).limit(limit),
    Application.countDocuments(filter),
  ])
  const meta = buildMeta(total, page, limit)
  ok(res, { applications: items.map(a => serializeApplication(a)), meta }, { meta })
}))

router.get('/:id', requireAuth, asyncHandler(async (req, res) => {
  const application = await Application.findOne({ _id: req.params.id, user_id: req.user._id }).catch(() => null)
  if (!application) throw notFound('Application not found.')
  ok(res, { application: serializeApplication(application) })
}))

export default router
