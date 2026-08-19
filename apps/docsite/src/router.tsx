import {useEffect, useState} from 'react';

/** Every page this site serves. */
export const routes = ['components', 'templates', 'themes', 'docs'] as const;

export type Route = (typeof routes)[number] | 'home';

/**
 * A destination inside an index rather than a page of its own: a component
 * group on the components index, a category in the template gallery. Named by
 * the catalogue it belongs to, so a call site says which one it means.
 */
export type Section = {readonly category: string} | {readonly group: string};

/**
 * Where a hash points: a page, the subject a detail page is showing — which is
 * a component under `components` and a template under `templates` — and the
 * section an index has been asked to show. Separate fields rather than one,
 * because the catalogues are different shapes and a shared `slug` would leave
 * every reader of it asking which one it is.
 */
export interface Location {
  readonly category: string | null;
  readonly component: string | null;
  readonly group: string | null;
  readonly route: Route;
  readonly template: string | null;
}

const home: Location = {
  category: null,
  component: null,
  group: null,
  route: 'home',
  template: null,
};

function readLocation(previous: Location): Location {
  const hash = window.location.hash;
  // A bare `#anchor` is an in-page link, not a destination. Returning the
  // previous location leaves the page where it is and lets the browser do the
  // scrolling, which is what a fragment is for.
  if (!hash.startsWith('#/')) {
    return previous;
  }

  const [path = '', query = ''] = hash.slice(2).split('?');
  const [page = '', subject = ''] = path.split('/');
  if (!(routes as readonly string[]).includes(page)) {
    return home;
  }

  // A section is something an index shows. A detail page is already at one
  // subject, so `#/components/button?group=action` names two places at once
  // and the subject wins.
  const section = new URLSearchParams(subject === '' ? query : '');

  return {
    category: page === 'templates' ? section.get('category') : null,
    component: page === 'components' && subject !== '' ? subject : null,
    group: page === 'components' ? section.get('group') : null,
    route: page as Route,
    template: page === 'templates' && subject !== '' ? subject : null,
  };
}

/**
 * The current location, kept in step with the hash. An index page reads this
 * itself rather than being handed it: the section is part of where the reader
 * is, and the page is the only thing that can honour it.
 */
export function useLocation(): Location {
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

  return location;
}

/**
 * A hash router in twenty lines. The site has five pages and no data loading,
 * so a routing library would be more configuration than navigation — and this
 * repository deliberately depends on none.
 */
export function useRoute(): [Location, (next: Route) => void] {
  const location = useLocation();

  // Landing on a new page should start at its top, not keep the old offset.
  // Keyed on the destination so an in-page anchor, which leaves the location
  // untouched, does not undo the browser's own scroll. A section is left out
  // on purpose: it changes what an index shows, not which page is on screen.
  useEffect(() => {
    window.scrollTo({top: 0});
  }, [location.route, location.component, location.template]);

  function navigate(next: Route) {
    window.location.hash = routeHref(next).slice(1);
  }

  return [location, navigate];
}

/**
 * The slug a section answers to: `Data input` becomes `data-input` and `AI
 * chat` becomes `ai-chat`. Group titles and category names are prose, so this
 * is not the slug that splits a component's camel case.
 */
export function sectionSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z\d]+/gu, '-')
    .replace(/^-|-$/gu, '');
}

/**
 * Builds the href for a route so links stay real links, optionally for one
 * section inside it. The section rides in the hash's query rather than in a
 * fragment, because a hash holds one thing: a page that reached its groups
 * with a bare `#anchor` had left the route behind to do it, which is why the
 * group was a place the rail could mark but the breadcrumb could not link to.
 */
export function routeHref(route: Route, section?: Section): string {
  const path = route === 'home' ? '#/' : `#/${route}`;
  if (section === undefined) {
    return path;
  }

  const query =
    'group' in section
      ? `group=${sectionSlug(section.group)}`
      : `category=${sectionSlug(section.category)}`;

  return `${path}?${query}`;
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
