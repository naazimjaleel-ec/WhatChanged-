import { MetadataRoute } from 'next';
import { allSlugs } from '@/utils/seoData';
import { allBlogSlugs } from '@/utils/blogData';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://whatchanged.com';
  const sitemaps: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  // Add all SEO landing pages
  for (const slug of allSlugs) {
    sitemaps.push({
      url: `${baseUrl}/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    });
  }

  // Add all Blog posts
  for (const slug of allBlogSlugs) {
    sitemaps.push({
      url: `${baseUrl}/blog/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    });
  }

  return sitemaps;
}
