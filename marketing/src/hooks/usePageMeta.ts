import { useEffect } from 'react';
import { pageUrl, siteConfig } from '../config/site';

type PageMetaOptions = {
  title: string;
  description?: string;
  path?: string;
};

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel: string, href: string) {
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/** Sets document title, description, Open Graph tags, and canonical URL. */
export function usePageMeta({ title, description, path = '' }: PageMetaOptions) {
  useEffect(() => {
    const desc = description ?? siteConfig.description;
    const url = pageUrl(path);
    const fullTitle = title.includes(siteConfig.name) ? title : `${title} | ${siteConfig.name}`;

    document.title = fullTitle;
    upsertMeta('name', 'description', desc);
    upsertMeta('property', 'og:title', fullTitle);
    upsertMeta('property', 'og:description', desc);
    upsertMeta('property', 'og:url', url);
    upsertMeta('property', 'og:type', 'website');
    upsertMeta('property', 'og:site_name', siteConfig.name);
    upsertMeta('name', 'twitter:card', 'summary');
    upsertMeta('name', 'twitter:title', fullTitle);
    upsertMeta('name', 'twitter:description', desc);
    upsertLink('canonical', url);
  }, [title, description, path]);
}
