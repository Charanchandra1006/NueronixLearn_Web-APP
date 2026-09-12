import { useEffect } from 'react';

export interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
  noindex?: boolean;
}

const DEFAULT_TITLE = 'NeuronixLearn — AI-Powered Adaptive Learning Platform';
const DEFAULT_DESCRIPTION = 'Learn smarter with AI that adapts to your unique learning style. Personalized content, adaptive difficulty, and deep analytics.';
const DEFAULT_IMAGE = 'https://nueronixlearn.com/og-image.png';
const BASE_URL = 'https://nueronixlearn.com';

export const SEO = ({
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  url,
  type = 'website',
  author,
  publishedTime,
  modifiedTime,
  tags = [],
  noindex = false
}: SEOProps) => {
  const fullTitle = title ? `${title} | NeuronixLearn` : DEFAULT_TITLE;
  const canonicalUrl = url ? `${BASE_URL}${url}` : BASE_URL;
  const fullImageUrl = image.startsWith('http') ? image : `${BASE_URL}${image}`;

  useEffect(() => {
    document.title = fullTitle;

    const metaTags = {
      'title': fullTitle,
      'description': description,
      'robots': noindex ? 'noindex, nofollow' : 'index, follow',
      'canonical': canonicalUrl,
      
      'og:title': fullTitle,
      'og:description': description,
      'og:image': fullImageUrl,
      'og:url': canonicalUrl,
      'og:type': type,
      'og:site_name': 'NeuronixLearn',
      'og:locale': 'en_US',
      
      'twitter:card': 'summary_large_image',
      'twitter:title': fullTitle,
      'twitter:description': description,
      'twitter:image': fullImageUrl,
      'twitter:url': canonicalUrl,
    };

    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      const selector = isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let element = document.querySelector(selector) as HTMLMetaElement;
      
      if (!element) {
        element = document.createElement('meta');
        if (isProperty) {
          element.setAttribute('property', name);
        } else {
          element.setAttribute('name', name);
        }
        document.head.appendChild(element);
      }
      element.content = content;
    };

    Object.entries(metaTags).forEach(([key, value]) => {
      const isProperty = key.startsWith('og:') || key.startsWith('twitter:');
      updateMetaTag(key, value, isProperty);
    });

    if (author) {
      updateMetaTag('author', author);
    }

    if (type === 'article') {
      if (publishedTime) updateMetaTag('article:published_time', publishedTime);
      if (modifiedTime) updateMetaTag('article:modified_time', modifiedTime);
      tags.forEach(tag => updateMetaTag('article:tag', tag));
    }

    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, [fullTitle, description, fullImageUrl, canonicalUrl, type, author, publishedTime, modifiedTime, tags, noindex]);

  return null;
};

export default SEO;
