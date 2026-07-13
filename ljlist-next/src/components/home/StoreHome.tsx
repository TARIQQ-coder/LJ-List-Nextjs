'use client'

import { useNavigate } from '@/lib/router'
import { useStore } from '@/store/StoreProvider'
import { fmt } from '@/utils/format'

import { Navbar } from '@/layout/Navbar'
import { Hero } from '@/layout/Hero'
import { TrustBar } from '@/layout/TrustBar'
import { PromoStrip } from '@/layout/PromoStrip'
import { WhatsAppFloat } from '@/layout/WhatsAppFloat'
import { Footer } from '@/layout/Footer'
import { FeaturedGrid } from '@/features/catalog/FeaturedGrid'
import { ShopSection } from '@/features/catalog/ShopSection'
import { FixedPackages } from '@/features/packages/FixedPackages'
import { CartDrawer } from '@/features/cart/CartViews'
import { ApplySection } from '@/features/checkout/ApplySection'

export function StoreHome() {
  const navigate = useNavigate()
  const {
    user,
    profileLoading: _profileLoading,
    categories,
    liveProducts,
    fixedPackages,
    provisionPackages,
    detergentPackages,
    packageOptions,
    minOrder,
    productsLoading,
    featuredProducts,
    cart,
    cartOpen,
    setCartOpen,
    addToCart,
    removeFromCart,
    clearCart,
    cartTotal,
    cartCount,
    cartItems,
    prefilled,
    setPrefilled,
    shopCat,
    setShopCat,
    searchQuery,
    setSearchQuery,
    goToProduct,
    goToPackage,
    goToCart,
    scrollHome,
    toApply,
    toShop,
    applyWithPkg,
  } = useStore()

  const viewProduct = (product: any) => goToProduct(product)
  const viewPackage = (pkg: any) => goToPackage(pkg)

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar
        cartCount={cartCount}
        onCartOpen={goToCart}
        onApply={toApply}
        onSearch={setSearchQuery}
        user={user}
        categories={categories}
        onAccountClick={() => navigate(user ? '/profile' : '/auth/login')}
        onDeptClick={(catId: string) => {
          setSearchQuery('')
          if (catId === 'packages') {
            scrollHome('packages')
          } else {
            setShopCat(catId)
            setTimeout(
              () => document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' }),
              80,
            )
          }
        }}
      />

      {/* Live search results */}
      {searchQuery &&
        (() => {
          const results = liveProducts.filter(
            (p) =>
              p.name.toLowerCase().includes(searchQuery) ||
              categories.find((c) => c.id === p.cat)?.label.toLowerCase().includes(searchQuery),
          )
          return (
            <div className="fixed top-[108px] left-0 right-0 z-40 px-4">
              <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                  <p className="text-xs font-bold text-gray-600">
                    {results.length > 0
                      ? `${results.length} result${results.length > 1 ? 's' : ''} for "${searchQuery}"`
                      : `No results for "${searchQuery}"`}
                  </p>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-gray-400 hover:text-gray-700 text-lg leading-none"
                  >
                    ×
                  </button>
                </div>
                {results.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <p className="text-gray-400 text-sm">
                      Try searching for rice, oil, mackerel, sardine, chicken...
                    </p>
                    <a
                      href="https://wa.me/233244854206"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-3 text-amber-600 text-xs font-semibold hover:underline"
                    >
                      Can't find it? WhatsApp us →
                    </a>
                  </div>
                ) : (
                  <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                    {results.slice(0, 10).map((p) => {
                      const cat = categories.find((c) => c.id === p.cat)
                      return (
                        <button
                          key={p.id}
                          onClick={() => {
                            viewProduct(p)
                            setSearchQuery('')
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-amber-50 transition-colors text-left"
                        >
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {p.img ? (
                              <img
                                src={p.img}
                                alt={p.name}
                                className="w-full h-full object-contain p-1"
                              />
                            ) : (
                              <span className="text-lg">{p.emoji}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-800 text-sm font-semibold truncate">{p.name}</p>
                            <p className="text-gray-400 text-xs">{cat?.label}</p>
                          </div>
                          <span className="text-gray-900 font-black text-sm flex-shrink-0">
                            {fmt(p.price)}
                          </span>
                        </button>
                      )
                    })}
                    {results.length > 10 && (
                      <div className="px-4 py-3 text-center text-xs text-gray-400">
                        +{results.length - 10} more results — refine your search
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })()}

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        onAdd={addToCart}
        onRemove={removeFromCart}
        onClear={clearCart}
        onCheckout={toApply}
        total={cartTotal}
        allProducts={liveProducts}
        minOrder={minOrder}
      />

      <Hero onShop={() => toShop()} />
      <TrustBar />

      {/* Packages shown first after homepage */}
      <FixedPackages
        onApplyWithPackage={applyWithPkg}
        onViewPackage={viewPackage}
        packages={fixedPackages}
        packageOptions={packageOptions}
      />

      {/* 3 rows of mixed featured products — GH Basket style */}
      <FeaturedGrid
        cart={cart}
        onAdd={addToCart}
        onRemove={removeFromCart}
        onShop={() => toShop()}
        onView={viewProduct}
        products={featuredProducts}
      />

      <PromoStrip onApply={toApply} onShop={() => toShop()} />
      <ShopSection
        cart={cart}
        onAdd={addToCart}
        onRemove={removeFromCart}
        onCartOpen={goToCart}
        cartTotal={cartTotal}
        cartCount={cartCount}
        onView={viewProduct}
        defaultCat={shopCat}
        products={liveProducts}
        productsLoading={productsLoading}
        categories={categories}
        minOrder={minOrder}
        provisionPackages={provisionPackages}
        detergentPackages={detergentPackages}
        onApply={(pkgName: string) => {
          setPrefilled(pkgName)
          setTimeout(
            () => document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth' }),
            100,
          )
        }}
      />
      <ApplySection
        user={user}
        prefilledPackage={prefilled}
        cartTotal={cartTotal}
        cartItems={cartItems}
        allProducts={liveProducts}
        packageOptions={packageOptions}
        minOrder={minOrder}
        onAuthRequired={() => navigate('/auth/login')}
      />
      <Footer />
      <WhatsAppFloat />
    </div>
  )
}
