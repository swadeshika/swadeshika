
import { Category } from "@/lib/services/productService"

export interface CategoryTreeItem extends Category {
    children?: CategoryTreeItem[]
    level?: number // Depth level (0 for root, 1 for child, etc.)
}

/**
 * Builds a nested tree structure from a flat list of categories.
 * Assumes categories have `id` and `parent_id`.
 */
export function buildCategoryTree(categories: Category[], parentId: number | null = null): CategoryTreeItem[] {
    return categories
        .filter((cat) => (cat.parent_id ?? null) === (parentId ?? null)) // Get direct children, handle null/undefined
        .map((cat) => ({
            ...cat,
            children: buildCategoryTree(categories, cat.id), // Recursively find children
        }))
        .sort((a, b) => a.name.localeCompare(b.name)); // Optional: Alphabetical sort
}

/**
 * Flattens a category tree into a list with indentation information.
 * Useful for Dropdowns/Select inputs (e.g., "Electronics", " - Laptops").
 */
export function flattenCategoryTree(categories: Category[], parentId: number | null = null, level: number = 0): CategoryTreeItem[] {
    let result: CategoryTreeItem[] = [];

    // Find all children of the current parent
    const children = categories
        .filter(cat => cat.parent_id === parentId)
        .sort((a, b) => a.name.localeCompare(b.name));

    children.forEach(child => {
        // Add the current child with its level
        result.push({ ...child, level });

        // Recursively add grandchildren, incrementing the level
        const grandChildren = flattenCategoryTree(categories, child.id, level + 1);
        result = result.concat(grandChildren);
    });

    return result;
}
