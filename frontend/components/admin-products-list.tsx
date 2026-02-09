"use client"

// AdminProductsList renders the Products table in the admin area.
// Responsibilities:
// - Render a client-side search input and filter the in-memory list by name/category
// - Provide actions per row including navigation to the edit page
// Notes:
// - Search is purely client-side for now (no API integration).
// - Edit links use a slugified product name in the query per requirements.

import { useState, useEffect } from "react"
import { Plus, Search, Edit, Trash2, MoreVertical, Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { productService, Product } from "@/lib/services/productService"
import { toast } from "@/components/ui/use-toast"

export function AdminProductsList() {
  const [searchQuery, setSearchQuery] = useState("")
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [pendingDelete, setPendingDelete] = useState<{ id: number; name: string } | null>(null)

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const data = await productService.getAllProducts({
        limit: 100, // Fetch all for now
        view: 'admin',
        search: searchQuery
      })
      
      
      const mapped = data.products.map((p: any) => {
        // Prefer explicit `status` returned by backend (draft/published/archived)
        // Fallback to computed stock status if `status` not provided
        // Status Logic:
        // 1. Inactive/Unpublished (is_active = 0/false) -> "Inactive"
        // 2. Out of Stock (stock_quantity = 0) -> "Out of Stock"
        // 3. Active (is_active = 1, stock_quantity > 0) -> "Active"
        
        const isPublished = p.is_active === 1 || p.is_active === true;
        
        // Use stock quantity as the primary source of truth for "Out of Stock" status
        // The in_stock flag might be inconsistent for variant products
        const hasStock = p.stock_quantity > 0;
        
        let status = "Inactive";
        if (isPublished) {
            if (hasStock) {
                status = "Active";
            } else {
                status = "Out of Stock";
            }
        }
        
        // Calculate variant price range if variants exist
        const hasVariants = p.variant_count > 0 || (p.variants && p.variants.length > 0);
        let minPrice = p.price;
        let maxPrice = p.price;
        
        if (hasVariants && p.variants && p.variants.length > 0) {
          const variantPrices = p.variants.map((v: any) => parseFloat(v.price));
          minPrice = Math.min(...variantPrices, p.price);
          maxPrice = Math.max(...variantPrices, p.price);
        }
        
        return {
          id: p.id,
          name: p.name,
          category: p.category_name || 'Uncategorized',
          price: p.price,
          minPrice,
          maxPrice,
          hasVariants,
          variantCount: p.variant_count || 0,
          stock: p.stock_quantity,
          /**
           * CRITICAL FIX: Stock Status Display
           * ===================================
           * 
           * PROBLEM:
           * - in_stock field from database is 1/0 (TINYINT)
           * - Need to properly convert to boolean
           * - Also check stock_quantity > 0
           * 
           * SOLUTION:
           * - Convert in_stock to boolean: !!p.in_stock or p.in_stock === 1
           * - Check if stock_quantity > 0
           * - Both conditions must be true for "Active" status
           */
          status,
          rawStatus: p.status,
          image: p.primary_image || p.image || '/placeholder.jpg',
        };
      })
      setItems(mapped)
    } catch (error) {
      console.error("Failed to fetch products", error)
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
        fetchProducts()
    }, 500)
    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  const handleDelete = async () => {
    if (!pendingDelete) return
    try {
      await productService.deleteProduct(pendingDelete.id)
      setItems((prev) => prev.filter((p) => p.id !== pendingDelete.id))
      toast({
        title: "Success",
        description: "Product deleted successfully",
      })
    } catch (error) {
       toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
       })
    } finally {
      setPendingDelete(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between">
        <div className="text-center md:text-left">
          <h1 className="font-serif text-3xl font-bold mb-2 text-[#6B4423]">Products</h1>
          <p className="text-[#8B6F47]">Manage your product inventory</p>
        </div>
        <Button className="gap-2 bg-[#2D5F3F] hover:bg-[#234A32] text-white mt-3 md:mt-0" asChild>
          <Link href="/admin/products/new">
            <Plus className="h-4 w-4" />
            Add Product
          </Link>
        </Button>
      </div>

      <Card className="rounded-2xl border-2 border-[#E8DCC8]">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8B6F47]" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 border-2 border-[#E8DCC8] focus-visible:ring-0 focus-visible:border-[#2D5F3F]"
              />
            </div>
          </div>

          <div className="rounded-2xl border-2 border-[#E8DCC8] overflow-hidden bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[#6B4423]">Product</TableHead>
                  <TableHead className="text-[#6B4423]">Category</TableHead>
                  <TableHead className="text-[#6B4423]">Price</TableHead>
                  <TableHead className="text-[#6B4423]">Stock</TableHead>
                  <TableHead className="text-[#6B4423]">Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                   <TableRow>
                    <TableCell colSpan={6} className="py-12 text-center text-[#8B6F47]">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-12 text-center text-[#8B6F47]">
                      No products found. Please add a product to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 flex-shrink-0 overflow-hidden rounded-md bg-[#F5F1E8] border-2 border-[#E8DCC8]">
                            <img
                              src={product.image || "/placeholder.svg"}
                              alt={product.name}
                              className="object-cover w-full h-full"
                            />
                          </div>
                          <span className="font-medium text-[#6B4423]">{product.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell className="text-[#6B4423]">
                        <div className="flex flex-col">
                          {product.hasVariants ? (
                            <>
                              <span className="font-medium">
                                ₹{product.minPrice}{product.minPrice !== product.maxPrice && ` - ₹${product.maxPrice}`}
                              </span>
                              <span className="text-xs text-[#8B6F47]">
                                {product.variantCount} variant{product.variantCount > 1 ? 's' : ''}
                              </span>
                            </>
                          ) : (
                            <span className="font-medium">₹{product.price}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-[#6B4423]">{product.stock}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            product.status === "Active"
                              ? "bg-[#2D5F3F]/10 text-[#2D5F3F] border-0"
                              : "bg-red-100 text-red-700"
                          }
                        >
                          {product.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/products/edit?id=${product.id}`}>
                                <span className="flex items-center"><Edit className="h-4 w-4 mr-2 hover:text-white" />Edit</span>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setPendingDelete({ id: product.id, name: product.name })}
                            >
                              <Trash2 className="h-4 w-4 mr-2 hover:text-white" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {/* Delete confirmation dialog */}
          <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete product?</AlertDialogTitle>
                <AlertDialogDescription>
                  {pendingDelete ? `This will remove “${pendingDelete.name}” from the list. You can’t undo this.` : ""}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setPendingDelete(null)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  )
}
