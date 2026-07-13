'use client'

import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams } from '@/lib/router'
import { products as productsApi } from '../../api'
import { normalizeApiProduct } from '../../utils/catalog'
import { ProductSkeleton } from '../loading/LoadingSkeletons'
import { ProductDetail } from './ProductDetail'

const productPromises = new Map<string, Promise<any>>()

const getProductOnce = (productId: string) => {
  if (!productPromises.has(productId)) {
    productPromises.set(productId, productsApi.get(productId))
  }
  return productPromises.get(productId)!
}

export const ProductRoutePage = ({
  liveProducts,
  categories,
  cart,
  addToCart,
  removeFromCart,
  cartCount,
  goToCart,
  toShop,
  user,
  onAccountClick,
  setLiveProducts,
}: any) => {
  const navigate = useNavigate()
  const { productId } = useParams()
  const cachedProduct = liveProducts.find((p: any) => String(p.id) === productId || String(p.legacyId) === productId)
  const [apiProduct, setApiProduct] = useState<any>(null)
  const loading = Boolean(productId && !cachedProduct && !apiProduct)

  useEffect(() => {
    if (!productId || cachedProduct) return

    let mounted = true
    getProductOnce(productId)
      .then(product => {
        if (!mounted) return
        const normalized = normalizeApiProduct(product, categories)
        setApiProduct(normalized)
        setLiveProducts((prev: any[]) => {
          const exists = prev.some(p => p.id === normalized.id)
          return exists ? prev.map(p => p.id === normalized.id ? normalized : p) : [normalized, ...prev]
        })
      })
      .catch(() => {
        setApiProduct(null)
      })

    return () => { mounted = false }
  }, [productId, cachedProduct, categories, setLiveProducts])

  const product = apiProduct || cachedProduct

  if (loading && !product) {
    return <ProductSkeleton />
  }

  if (!product) return <Navigate to="/" replace />

  return (
    <ProductDetail
      product={product}
      qty={cart[product.id] || 0}
      onAdd={() => addToCart(product.id)}
      onRemove={() => removeFromCart(product.id)}
      onBack={() => navigate('/')}
      onViewProduct={(item: any) => navigate(`/products/${item.id}`)}
      cartCount={cartCount}
      onCartOpen={goToCart}
      onDeptClick={(catId: string) => toShop(catId)}
      user={user}
      onAccountClick={onAccountClick}
      categories={categories}
      allProducts={liveProducts}
    />
  )
}
