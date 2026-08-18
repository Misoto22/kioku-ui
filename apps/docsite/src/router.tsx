import {useEffect, useState} from 'react';

/** Every page this site serves. */
export const routes = ['components', 'templates', 'themes', 'docs'] as const;

export type Route = (typeof routes)[number] | 'home';

function readRoute(): Route {
  const path = window.location.hash.replace(/^#\/?/u, '').split('/')[0] ?? '';
  return (routes as readonly string[]).includes(path)
    ? (path as Route)
    : 'home';
}

/**
 * A hash router in twenty lines. The site has four pages and no data loading,
 * so a routing library would be more configuration than navigation — and this
 * repository deliberately depends on none.
 */
export function useRoute(): [Route, (next: Route) => void] {
  const [route, setRoute] = useState<Route>(() =>
    typeof window === 'undefined' ? 'home' : readRoute(),
  );

  useEffect(() => {
    function sync() {
      setRoute(readRoute());
    }

    window.addEventListener('hashchange', sync);
    return () => {
      window.removeEventListener('hashchange', sync);
    };
  }, []);

  function navigate(next: Route) {
    window.location.hash = next === 'home' ? '/' : `/${next}`;
    // Landing on a new page should start at its top, not keep the old offset.
    window.scrollTo({top: 0});
  }

  return [route, navigate];
}

/** Builds the href for a route so links stay real links. */
export function routeHref(route: Route): string {
  return route === 'home' ? '#/' : `#/${route}`;
}
