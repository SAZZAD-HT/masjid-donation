// app/sitemap.js
export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://alnoormasjid.org';

  const staticRoutes = [
    { url: baseUrl, priority: 1.0, changeFrequency: 'weekly' },
    { url: `${baseUrl}/about`, priority: 0.8, changeFrequency: 'monthly' },
    { url: `${baseUrl}/campaigns`, priority: 0.9, changeFrequency: 'daily' },
    { url: `${baseUrl}/donate`, priority: 1.0, changeFrequency: 'weekly' },
    { url: `${baseUrl}/transparency`, priority: 0.7, changeFrequency: 'daily' },
    { url: `${baseUrl}/zakat`, priority: 0.8, changeFrequency: 'monthly' },
    { url: `${baseUrl}/contact`, priority: 0.7, changeFrequency: 'monthly' },
  ].map(route => ({
    ...route,
    lastModified: new Date().toISOString(),
  }));

  return staticRoutes;
}
