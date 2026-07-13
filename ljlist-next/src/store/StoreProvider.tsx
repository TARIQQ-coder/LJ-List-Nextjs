'use client'

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useRouter } from 'next/navigation'
import {
  profile as profileApi,
  products as productsApi,
  packages as packagesApi,
} from '@/api'
import {
  normalizeApiCategory,
  normalizeApiProduct,
  normalizeFixedPackage,
  packageOptionFor,
} from '@/utils/catalog'

let catalogPromise: Promise<any> | null = null
let profilePromise: Promise<any> | null = null

const loadCatalogOnce = () => {
  if (!catalogPromise) {
    catalogPromise = Promise.allSettled([
      productsApi.categories(),
      productsApi.list({ limit: 100 }),
      packagesApi.catalog(),
      packagesApi.fixed(),
      packagesApi.provisions(),
      packagesApi.detergents(),
    ])
  }
  return catalogPromise
}

const loadProfileOnce = () => {
  if (!profilePromise) profilePromise = profileApi.get()
  return profilePromise
}

export type Store = {
  user: any
  setUser: (u: any) => void
  profileLoading: boolean
  refreshUserFromApi: (fallbackUser?: any) => Promise<void>
  logoutUser: () => void

  categories: any[]
  liveProducts: any[]
  setLiveProducts: (updater: any) => void
  fixedPackages: any[]
  provisionPackages: any[]
  detergentPackages: any[]
  packageOptions: string[]
  minOrder: number
  productsLoading: boolean
  featuredProducts: any[]

  cart: Record<string, number>
  cartOpen: boolean
  setCartOpen: (open: boolean) => void
  addToCart: (id: string) => void
  removeFromCart: (id: string) => void
  removeAllFromCart: (id: string) => void
  clearCart: () => void
  cartTotal: number
  cartCount: number
  cartItems: [string, number][]
  findProduct: (id: any) => any

  prefilled: string
  setPrefilled: (v: string) => void
  shopCat: string
  setShopCat: (v: string) => void
  searchQuery: string
  setSearchQuery: (v: string) => void

  goToProduct: (product: any) => void
  goToPackage: (pkg: any) => void
  goToCart: () => void
  scrollHome: (id: string, delay?: number) => void
  toApply: () => void
  toShop: (cat?: string) => void
  applyWithPkg: (pkg: string) => void
}

const StoreContext = createContext<Store | null>(null)

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>')
  return ctx
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const router = useRouter()

  const [user, setUser] = useState<any>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [liveProducts, setLiveProducts] = useState<any[]>([])
  const [fixedPackages, setFixedPackages] = useState<any[]>([])
  const [provisionPackages, setProvisionPackages] = useState<any[]>([])
  const [detergentPackages, setDetergentPackages] = useState<any[]>([])
  const [packageOptions, setPackageOptions] = useState<string[]>([])
  const [minOrder, setMinOrder] = useState(0)
  const [productsLoading, setProductsLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(true)

  const [cart, setCart] = useState<Record<string, number>>({})
  const [cartOpen, setCartOpen] = useState(false)
  const [prefilled, setPrefilled] = useState('')
  const [shopCat, setShopCat] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    let mounted = true

    const loadCatalog = async () => {
      setProductsLoading(true)
      try {
        const [
          categoryResult,
          productResult,
          packageResult,
          fixedPackagesResult,
          provisionsPackagesResult,
          detergentPackagesResult,
        ] = await loadCatalogOnce()

        const apiCategories =
          categoryResult.status === 'fulfilled' ? categoryResult.value.categories || [] : []
        const nextCategories = apiCategories.map(normalizeApiCategory)

        const apiProducts =
          productResult.status === 'fulfilled' ? productResult.value.products || [] : []
        const nextProducts = apiProducts.map((product: any) =>
          normalizeApiProduct(product, nextCategories),
        )

        const packageCatalog: any =
          packageResult.status === 'fulfilled' ? packageResult.value : {}
        const apiFixedFromEndpoint =
          fixedPackagesResult.status === 'fulfilled'
            ? fixedPackagesResult.value.fixed_packages || []
            : []
        const apiProvisionsFromEndpoint =
          provisionsPackagesResult.status === 'fulfilled'
            ? provisionsPackagesResult.value.provisions_packages || []
            : []
        const apiDetergentsFromEndpoint =
          detergentPackagesResult.status === 'fulfilled'
            ? detergentPackagesResult.value.detergent_packages || []
            : []

        const apiFixed =
          apiFixedFromEndpoint.length > 0
            ? apiFixedFromEndpoint
            : packageCatalog.fixed_packages || packageCatalog.fixedPackages || []
        const apiProvisions =
          apiProvisionsFromEndpoint.length > 0
            ? apiProvisionsFromEndpoint
            : packageCatalog.provisions_packages || packageCatalog.provisionsPackages || []
        const apiDetergents =
          apiDetergentsFromEndpoint.length > 0
            ? apiDetergentsFromEndpoint
            : packageCatalog.detergent_packages || packageCatalog.detergentPackages || []

        const nextFixedPackages = apiFixed.map(normalizeFixedPackage)
        const generatedOptions = nextFixedPackages.map(packageOptionFor)
        const apiPackageOptions =
          packageCatalog.package_options || packageCatalog.packageOptions || []
        const nextPackageOptions =
          apiPackageOptions.length > 1
            ? apiPackageOptions
            : [...generatedOptions, ...apiPackageOptions]

        if (!mounted) return
        setCategories(nextCategories)
        setLiveProducts(nextProducts)
        setFixedPackages(nextFixedPackages)
        setProvisionPackages(apiProvisions)
        setDetergentPackages(apiDetergents)
        setPackageOptions(nextPackageOptions)
        setMinOrder(packageCatalog.min_order || packageCatalog.minOrder || 0)
      } finally {
        if (mounted) setProductsLoading(false)
      }
    }

    loadCatalog()
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    let mounted = true
    setProfileLoading(true)
    loadProfileOnce()
      .then((data) => {
        if (!mounted || !data.user) return
        setUser(data.user)
      })
      .catch(() => {
        if (mounted) setUser(null)
      })
      .finally(() => {
        if (mounted) setProfileLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [])

  // Derived: featured products — first 18 from live list across all categories
  const featuredProducts = useMemo(() => {
    const seen = new Set()
    const result: any[] = []
    for (const cat of categories.map((c) => c.id)) {
      const catItems = liveProducts.filter((p) => p.cat === cat).slice(0, 3)
      catItems.forEach((p) => {
        if (!seen.has(p.id)) {
          seen.add(p.id)
          result.push(p)
        }
      })
      if (result.length >= 18) break
    }
    return result.slice(0, 18)
  }, [categories, liveProducts])

  const addToCart = (id: string) => setCart((p) => ({ ...p, [id]: (p[id] || 0) + 1 }))
  const removeFromCart = (id: string) =>
    setCart((p) => {
      const q = (p[id] || 0) - 1
      if (q <= 0) {
        const n = { ...p }
        delete n[id]
        return n
      }
      return { ...p, [id]: q }
    })
  const removeAllFromCart = (id: string) => {
    if (id === 'all') {
      setCart({})
      return
    }
    setCart((p) => {
      const n = { ...p }
      delete n[id]
      return n
    })
  }
  const clearCart = () => setCart({})

  const findProduct = (id: any) =>
    liveProducts.find((p) => p.id === id || p.legacyId === Number(id) || p.id === Number(id))

  const cartTotal = Object.entries(cart).reduce((s, [id, q]) => {
    const p = findProduct(id)
    return s + (p?.price ? p.price * q : 0)
  }, 0)
  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0)
  const cartItems = Object.entries(cart).filter(([, q]) => q > 0)

  const goToProduct = (product: any) => {
    router.push(`/products/${product.id}`)
    window.scrollTo(0, 0)
  }
  const goToPackage = (pkg: any) => {
    router.push(`/packages/${pkg.id}`)
    window.scrollTo(0, 0)
  }
  const goToCart = () => {
    router.push('/cart')
    window.scrollTo(0, 0)
  }

  const scrollHome = (id: string, delay = 100) => {
    router.push('/')
    setTimeout(
      () => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }),
      delay + 150,
    )
  }
  const toApply = () => {
    setCartOpen(false)
    scrollHome('apply', 150)
  }
  const toShop = (cat = 'all') => {
    setShopCat(cat)
    scrollHome('shop', 80)
  }
  const applyWithPkg = (pkg: string) => {
    setPrefilled(pkg)
    document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth' })
  }

  const refreshUserFromApi = async (fallbackUser?: any) => {
    if (fallbackUser) setUser(fallbackUser)
    profilePromise = null
    try {
      const data = await loadProfileOnce()
      setUser(data.user || null)
    } catch {
      setUser(fallbackUser || null)
    }
  }

  const logoutUser = () => {
    profilePromise = null
    setUser(null)
  }

  const value: Store = {
    user,
    setUser,
    profileLoading,
    refreshUserFromApi,
    logoutUser,
    categories,
    liveProducts,
    setLiveProducts,
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
    removeAllFromCart,
    clearCart,
    cartTotal,
    cartCount,
    cartItems,
    findProduct,
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
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}
