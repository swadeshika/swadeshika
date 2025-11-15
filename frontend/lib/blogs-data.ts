export type BlogStatus = 'published' | 'draft'

export interface BlogListItem {
  id: string
  title: string
  author: string
  category: string
  status: BlogStatus
  date: string // ISO or yyyy-mm-dd
  views: number
  image: string
}

export const BLOGS: BlogListItem[] = [
  {
    id: "1",
    title: "The Health Benefits of Pure Desi Ghee",
    author: "Dr. Anjali Sharma",
    category: "Health & Wellness",
    status: "published",
    date: "2025-10-15",
    views: 1245,
    image: "/golden-ghee-in-glass-jar.jpg",
  },
  {
    id: "2",
    title: "Organic Farming: Why It Matters",
    author: "Rahul Verma",
    category: "Sustainable Living",
    status: "published",
    date: "2025-10-10",
    views: 892,
    image: "/organic-farming.jpg",
  },
  {
    id: "3",
    title: "The Art of Mindful Eating",
    author: "Priya Patel",
    category: "Health & Wellness",
    status: "draft",
    date: "2025-10-05",
    views: 0,
    image: "/mindful-eating.jpg",
  },
  {
    id: "4",
    title: "Ayurvedic Herbs for Daily Wellness",
    author: "Dr. Rajesh Kumar",
    category: "Ayurveda",
    status: "published",
    date: "2025-09-28",
    views: 1560,
    image: "/ayurvedic-herbs.jpg",
  },
  {
    id: "5",
    title: "5 Traditional Indian Superfoods",
    author: "Ananya Gupta",
    category: "Nutrition",
    status: "published",
    date: "2025-09-20",
    views: 2034,
    image: "/indian-superfoods.jpg",
  },
]
