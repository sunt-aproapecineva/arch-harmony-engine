import {
  Link as TLink,
  useNavigate as tUseNavigate,
  useParams as tUseParams,
  useRouterState,
  Outlet as TOutlet,
} from '@tanstack/react-router';
import { useEffect, type ReactNode } from 'react';

export const Outlet = TOutlet;

export function Link({ to, children, className, style, onClick, target, rel, ...rest }: any) {
  return (
    <TLink to={to} className={className} style={style} onClick={onClick} target={target} rel={rel} {...rest}>
      {children}
    </TLink>
  );
}

export function NavLink({ to, children, className, end, style, ...rest }: any) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = end ? pathname === to : pathname === to || pathname.startsWith(to + '/');
  const cls = typeof className === 'function' ? className({ isActive }) : className;
  const sty = typeof style === 'function' ? style({ isActive }) : style;
  const content = typeof children === 'function' ? (children as any)({ isActive }) : children;
  return (
    <TLink to={to} className={cls} style={sty} {...rest}>
      {content as ReactNode}
    </TLink>
  );
}

export function useNavigate() {
  const nav = tUseNavigate();
  return (to: string | number, opts?: any) => {
    if (typeof to === 'number') {
      if (typeof window !== 'undefined') window.history.go(to);
      return;
    }
    nav({ to, ...(opts || {}) });
  };
}

export function useParams<T = Record<string, string>>(): T {
  return tUseParams({ strict: false } as any) as T;
}

export function useSearchParams(): [URLSearchParams, (s: URLSearchParams | ((p: URLSearchParams) => URLSearchParams)) => void] {
  const search = typeof window !== 'undefined' ? window.location.search : '';
  const params = new URLSearchParams(search);
  const nav = tUseNavigate();
  const set = (s: any) => {
    const next = typeof s === 'function' ? s(new URLSearchParams(search)) : s;
    const obj: Record<string, string> = {};
    next.forEach((v: string, k: string) => {
      obj[k] = v;
    });
    nav({ to: typeof window !== 'undefined' ? window.location.pathname : '/', search: obj });
  };
  return [params, set];
}

export function Navigate({ to, replace }: { to: string; replace?: boolean }) {
  const nav = tUseNavigate();
  useEffect(() => {
    nav({ to, replace });
  }, [to, replace, nav]);
  return null;
}
