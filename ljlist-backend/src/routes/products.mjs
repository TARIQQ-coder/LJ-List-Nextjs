import { Router } from 'express'
import { Product, Category, serializeProduct, serializeCategory } from '../models/index.mjs'
import { ok, asyncHandler, notFound } from '../utils/respond.mjs'
import { getPagination, buildMeta } from '../utils/pagination.mjs'

const router = Router()

// Shared list logic (public + admin both use products?page&limit&category)
export async function listProducts(query, { includeInactive = false } = {}) {
  const { page, limit, skip } = getPagination(query, { defaultLimit: 100 })
  const filter = includeInactive ? {} : { active: true }

  if (query.category) {
    // Accept either a category id or a (partial) category name
    const byId = /^[a-f0-9]{24}$/i.test(query.category) ? await Category.findById(query.category) : null
    const cat = byId || (await Category.findOne({ name: new RegExp(query.category, 'i') }))
    filter.category_id = cat ? cat._id : null
  }

  const [items, total] = await Promise.all([
    Product.find(filter).populate('category_id').sort({ created_at: -1 }).skip(skip).limit(limit),
    Product.countDocuments(filter),
  ])
  return { products: items.map(p => serializeProduct(p)), meta: buildMeta(total, page, limit) }
}

router.get('/', asyncHandler(async (req, res) => {
  const { products, meta } = await listProducts(req.query)
  ok(res, { products, meta }, { meta })
}))

router.get('/categories', asyncHandler(async (_req, res) => {
  const categories = await Category.find({ active: true }).sort({ sort_order: 1, name: 1 })
  ok(res, { categories: categories.map(serializeCategory) })
}))

router.get('/:id', asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('category_id').catch(() => null)
  if (!product || !product.active) throw notFound('Product not found.')
  ok(res, serializeProduct(product))
}))

export default router
