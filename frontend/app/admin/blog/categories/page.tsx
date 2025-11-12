import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Edit, Trash2 } from "lucide-react"

type Category = {
  id: string
  name: string
  slug: string
  description: string
  parentId: string | null
  createdAt: string
}

export default function BlogCategoriesPage() {
  // Mock data - replace with actual API calls
  const categories: Category[] = [
    {
      id: '1',
      name: 'Health & Wellness',
      slug: 'health-wellness',
      description: 'Articles about health and wellness',
      parentId: null,
      createdAt: '2023-11-12'
    },
    {
      id: '2',
      name: 'Ayurveda',
      slug: 'ayurveda',
      description: 'Traditional Indian medicine',
      parentId: '1',
      createdAt: '2023-11-12'
    },
    {
      id: '3',
      name: 'Recipes',
      slug: 'recipes',
      description: 'Healthy recipes using our products',
      parentId: null,
      createdAt: '2023-11-12'
    }
  ]

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#6B4423]">Blog Categories</h1>
            <p className="text-[#8B6F47]">Manage your blog categories and subcategories</p>
          </div>
          <Button className="bg-[#2D5F3F] hover:bg-[#1e4a30]">
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </div>

        <div className="bg-white rounded-xl border-2 border-[#E8DCC8] p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8B6F47]" />
              <Input
                placeholder="Search categories..."
                className="pl-9 border-2 border-[#E8DCC8] focus-visible:ring-0 focus-visible:border-[#2D5F3F]"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Parent Category</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{category.slug}</TableCell>
                  <TableCell className="text-[#8B6F47]">{category.description}</TableCell>
                  <TableCell>
                    {categories.find(c => c.id === category.parentId)?.name || '-'}
                  </TableCell>
                  <TableCell>{new Date(category.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  )
}
