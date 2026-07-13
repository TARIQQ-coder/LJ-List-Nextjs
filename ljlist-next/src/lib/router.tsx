'use client'

// react-router-dom → next/navigation compatibility layer.
// Ported components keep their familiar API (Link to=, useNavigate, useParams,
// useSearchParams, <Navigate/>) while running on the Next.js App Router.

import NextLink from 'next/link'
import {
  useRouter,
  useParams as useNextParams,
  useSearchParams as useNextSearchParams,
} from 'next/navigation'
import { useEffect, type AnchorHTMLAttributes, type ReactNode } from 'react'

type LinkProps = { to: string; children?: ReactNode } & Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  'href'
>

export function Link({ to, children, ...rest }: LinkProps) {
  return (
    <NextLink href={to} {...rest}>
      {children}
    </NextLink>
  )
}

export function useNavigate() {
  const router = useRouter()
  return (to: string, options?: { replace?: boolean }) => {
    if (options?.replace) router.replace(to)
    else router.push(to)
  }
}

export function useParams<T = Record<string, string>>(): T {
  return useNextParams() as T
}

// react-router returns [searchParams, setSearchParams] — components here only read.
export function useSearchParams() {
  const searchParams = useNextSearchParams()
  return [searchParams] as const
}

export function Navigate({ to, replace }: { to: string; replace?: boolean }) {
  const router = useRouter()
  useEffect(() => {
    if (replace) router.replace(to)
    else router.push(to)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return null
}
