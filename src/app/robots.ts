import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/_next/',
        '/static/',
        '/api/',
        '/*?*', // Disallow indexing of query parameters to avoid duplicate content flags
      ],
    },
    sitemap: 'https://whatchanged.com/sitemap.xml',
  };
}
