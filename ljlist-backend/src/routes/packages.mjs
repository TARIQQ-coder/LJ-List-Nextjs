import { Router } from 'express'
import { Package, Product, getSetting, serializeFixedPackage, serializeSimplePackage } from '../models/index.mjs'
import { ok, asyncHandler } from '../utils/respond.mjs'

const router = Router()

export function packageOptionFor(pkg) {
  if (pkg.slug === 'custom') return 'CUSTOMIZED REQUEST (Call/WhatsApp 0244854206)'
  const rawPrice = String(pkg.price || '').replace(/[^\d,]/g, '')
  return `${String(pkg.name || '').toUpperCase()}${rawPrice ? ` (GHC${rawPrice})` : ''}`
}

export async function loadFixedPackages() {
  const pkgs = await Package.find({ type: 'fixed', active: true }).sort({ sort_order: 1 })
  const productIds = pkgs.flatMap(p => (Array.isArray(p.items) ? p.items : []))
    .map(i => i.product_id).filter(Boolean)
  const products = productIds.length ? await Product.find({ _id: { $in: productIds } }) : []
  const byId = new Map(products.map(p => [String(p._id), p]))
  return pkgs.map(p => serializeFixedPackage(p, byId))
}

const loadSimple = async type =>
  (await Package.find({ type, active: true }).sort({ sort_order: 1 })).map(serializeSimplePackage)

router.get('/', asyncHandler(async (_req, res) => {
  const [fixed, provisions, detergents, minOrder] = await Promise.all([
    loadFixedPackages(),
    loadSimple('provisions'),
    loadSimple('detergents'),
    getSetting('min_order', 300),
  ])
  ok(res, {
    min_order: minOrder,
    package_options: [...fixed.map(f => packageOptionFor({ slug: f.id, name: f.name, price: f.price }))],
    fixed_packages: fixed,
    provisions_packages: provisions,
    detergent_packages: detergents,
  })
}))

router.get('/fixed', asyncHandler(async (_req, res) => {
  ok(res, { fixed_packages: await loadFixedPackages() })
}))

router.get('/provisions', asyncHandler(async (_req, res) => {
  ok(res, { provisions_packages: await loadSimple('provisions') })
}))

router.get('/detergents', asyncHandler(async (_req, res) => {
  ok(res, { detergent_packages: await loadSimple('detergents') })
}))

export default router
