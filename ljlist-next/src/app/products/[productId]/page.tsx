'use client'

import { useNavigate } from '@/lib/router'
import { useStore } from '@/store/StoreProvider'
import { ProductRoutePage } from '@/features/catalog/ProductRoutePage'

export default function ProductPage() {
  const navigate = useNavigate()
  const {
    user, liveProducts, setLiveProducts, categories,
    cart, addToCart, removeFromCart, cartCount, goToCart, toShop,
  } = useStore()

  return (
    <ProductRoutePage
      liveProducts={liveProducts}
      categories={categories}
      cart={cart}
      addToCart={addToCart}
      removeFromCart={removeFromCart}
      cartCount={cartCount}
      goToCart={goToCart}
      toShop={toShop}
      user={user}
      onAccountClick={() => navigate(user ? '/profile' : '/auth/login')}
      setLiveProducts={setLiveProducts}
    />
  )
}
