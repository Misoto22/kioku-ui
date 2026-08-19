import {useEffect, useState} from 'react';

/** Every page this site serves. */
export const routes = ['components', 'templates', 'themes', 'docs'] as const;

export type Route = (typeof routes)[number] | 'home';

/**
 * Where a hash points: a page, and the subject a detail page is showing —
 * which is a component under `components` and a template under `templates`.
 * Two fields rather than one, because the two catalogues are different shapes
 * and a shared `slug` would leave every reader of it asking which one it is.
 */
export interface Location {
  readonly component: string | null;
  readonly route: Route;
  readonly template: string | null;
}

const home: Location = {component: null, route: 'home', template: null};

function readLocation(previous: Location): Location {
  const hash = window.location.hash;
  // A bare `#anchor` is an in-page link, not a destination. Returning the
  // previous location leaves the page where it is and lets the browser do the
  // scrolling, which is what a fragment is for.
  if (!hash.startsWith('#/')) {
    return previous;
  }

  const [page = '', subject = ''] = hash.slice(2).split('/');
  if (!(routes as readonly string[]).includes(page)) {
    return home;
  }

  return {
    component: page === 'components' && subject !== '' ? subject : null,
    route: page as Route,
    template: page === 'templates' && subject !== '' ? subject : null,
  };
}

/**
 * A hash router in twenty lines. The site has five pages and no data loading,
 * so a routing library would be more configuration than navigation — and this
 * repository deliberately depends on none.
 */
export function useRoute(): [Location, (next: Route) => void] {
  const [location, setLocation] = useState<Location>(() =>
    typeof window === 'undefined' ? home : readLocation(home),
  );

  useEffect(() => {
    function sync() {
      setLocation(readLocation);
    }

    window.addEventListener('hashchange', sync);
    return () => {
      window.removeEventListener('hashchange', sync);
    };
  }, []);

  // Landing on a new page should start at its top, not keep the old offset.
  // Keyed on the destination so an in-page anchor, which leaves the location
  // untouched, does not undo the browser's own scroll.
  useEffect(() => {
    window.scrollTo({top: 0});
  }, [location.route, location.component, location.template]);

  function navigate(next: Route) {
    window.location.hash = routeHref(next).slice(1);
  }

  return [location, navigate];
}

/** Builds the href for a route so links stay real links. */
export function routeHref(route: Route): string {
  return route === 'home' ? '#/' : `#/${route}`;
}

/** The slug one component answers to: `DropdownMenu` becomes `dropdown-menu`. */
export function componentSlug(name: string): string {
  return name.replace(/([a-z\d])([A-Z])/gu, '$1-$2').toLowerCase();
}

/** Builds the href for one component's page. */
export function componentHref(name: string): string {
  return `#/components/${componentSlug(name)}`;
}

/**
 * Builds the href for one template's page. A template's id is already the
 * name the CLI answers to — `kioku-ui add pages login-card` — so it needs no
 * slug of its own: the URL and the command say the same word.
 */
export function templateHref(id: string): string {
  return `#/templates/${id}`;
}
