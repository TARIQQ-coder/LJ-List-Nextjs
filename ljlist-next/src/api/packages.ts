import { request } from './client'
import type { DepartmentPackage, FixedPackage, PackageCatalogResponse } from './types'

export const packages = {
  catalog() {
    return request<PackageCatalogResponse>('/api/v1/packages')
  },
  fixed() {
    return request<{ fixed_packages: FixedPackage[] }>('/api/v1/packages/fixed')
  },
  provisions() {
    return request<{ provisions_packages: DepartmentPackage[] }>('/api/v1/packages/provisions')
  },
  detergents() {
    return request<{ detergent_packages: DepartmentPackage[] }>('/api/v1/packages/detergents')
  },
}
