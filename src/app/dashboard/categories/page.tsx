"use client"

import { CategoryManagement } from "@/components/dashboard/category-management"

export default function CategoriesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Category Management</h1>
        <p className="text-muted-foreground">
          Organize your tickets by creating and managing categories
        </p>
      </div>
      
      <CategoryManagement />
    </div>
  )
}
