'use client'

import { useNavigate } from '@/lib/router'
import { useStore } from '@/store/StoreProvider'
import { CartPage } from '@/features/cart/CartViews'

export default function CartRoute() {
  const navigate = useNavigate()
  const {
    user, cart, addToCart, removeFromCart, removeAllFromCart,
    cartCount, goToCart, liveProducts, minOrder, toShop, toApply,
  } = useStore()

  return (
    <CartPage
      cart={cart}
      onAdd={addToCart}
      onRemove={removeFromCart}
      onClear={removeAllFromCart}
      onBack={() => navigate('/')}
      onShop={() => toShop()}
      onCheckout={() => toApply()}
      cartCount={cartCount}
      onCartOpen={goToCart}
      allProducts={liveProducts}
      minOrder={minOrder}
      onDeptClick={(catId: string) => toShop(catId)}
      user={user}
      onAccountClick={() => navigate(user ? '/profile' : '/auth/login')}
    />
  )
}
