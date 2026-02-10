import { MetadataRoute } from 'next'
import { productService } from '@/lib/services/productService'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://swadeshika.in'

    // 1. Static Routes
    const staticRoutes = [
        '',
        '/shop',
        '/about',
        '/contact',
        '/policies/privacy-policy',
        '/policies/terms-of-service',
        '/policies/shipping-policy',
        '/policies/refund-policy',
        '/blog',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }))

    // 2. Dynamic Product Routes
    let productRoutes: MetadataRoute.Sitemap = []
    try {
        const { products } = await productService.getAllProducts({ limit: 1000 })
        productRoutes = products.map((product) => ({
            url: `${baseUrl}/products/${product.slug}`,
            lastModified: new Date(product.updated_at || new Date()),
            changeFrequency: 'daily' as const,
            priority: 0.9,
        }))
    } catch (error) {
        console.error('Failed to generate product sitemap:', error)
    }

    // 3. Dynamic Category Routes
    let categoryRoutes: MetadataRoute.Sitemap = []
    try {
        const categories = await productService.getAllCategories()
        categoryRoutes = categories.map((category) => ({
            url: `${baseUrl}/shop?category=${category.slug}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        }))
    } catch (error) {
        console.error('Failed to generate category sitemap:', error)
    }

    return [...staticRoutes, ...categoryRoutes, ...productRoutes]
}
