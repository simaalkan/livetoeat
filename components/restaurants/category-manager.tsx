"use client";

import * as React from 'react';
import { Trash2, Search, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { deleteCategoryAction, createCategoryAction } from '@/app/actions/restaurants'; // createCategoryAction eklediğini varsayıyoruz
import { Badge } from '@/components/ui/badge';

export function CategoryManager({ categories }: { categories: any[] }) {
  const [search, setSearch] = React.useState('');
  const [newCategoryName, setNewCategoryName] = React.useState('');
  const [isAdding, setIsAdding] = React.useState(false);

  const filtered = categories.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newCategoryName.trim();
    if (!name) return;

    setIsAdding(true);
    try {
      await createCategoryAction(name);
      setNewCategoryName('');
    } catch (error) {
      console.error("Failed to create category:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure? This will remove the category from all associated restaurants.")) return;
    await deleteCategoryAction(id);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 text-[10px] font-bold">
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Manage Categories</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* YENİ KATEGORİ EKLEME FORMU */}
          <form onSubmit={handleAddCategory} className="flex gap-2">
            <div className="relative flex-1">
              <Plus className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Add new category..." 
                className="pl-8 h-9 text-sm" 
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                disabled={isAdding}
              />
            </div>
            <Button type="submit" size="sm" className="h-9" disabled={isAdding || !newCategoryName.trim()}>
              {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add'}
            </Button>
          </form>

          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search existing..." 
              className="pl-8 h-9 text-sm" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="max-h-[250px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {filtered.length > 0 ? (
              filtered.map((category) => (
                <div key={category.id} className="flex items-center justify-between p-2 rounded-lg border bg-muted/30 group transition-colors hover:bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="font-medium text-[11px]">
                      #{category.name}
                    </Badge>
                    {category.isCustom && (
                      <span className="text-[10px] text-muted-foreground italic font-medium">Custom</span>
                    )}
                  </div>
                  
                  {category.isCustom && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDelete(category.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-xs text-muted-foreground py-4">No categories found.</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}