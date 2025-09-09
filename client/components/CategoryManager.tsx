import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  AlertTriangle,
  Loader2,
  Tag
} from 'lucide-react';

interface CategoryManagerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  onCategoriesChange: (categories: string[]) => void;
}

export default function CategoryManager({ isOpen, onClose, categories, onCategoriesChange }: CategoryManagerProps) {
  const [localCategories, setLocalCategories] = useState<string[]>(categories);
  const [newCategory, setNewCategory] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLocalCategories(categories);
  }, [categories]);

  const handleAddCategory = () => {
    const trimmed = newCategory.trim();
    if (!trimmed) {
      setError('اسم الفئة لا يمكن أن يكون فارغاً');
      return;
    }
    
    if (localCategories.includes(trimmed)) {
      setError('هذه الفئة موجودة بالفعل');
      return;
    }

    const updated = [...localCategories, trimmed];
    setLocalCategories(updated);
    setNewCategory('');
    setError(null);
  };

  const handleEditCategory = (index: number) => {
    setEditingIndex(index);
    setEditingValue(localCategories[index]);
  };

  const handleSaveEdit = () => {
    if (editingIndex === null) return;
    
    const trimmed = editingValue.trim();
    if (!trimmed) {
      setError('اسم الفئة لا يمكن أن يكون فارغاً');
      return;
    }

    if (localCategories.includes(trimmed) && trimmed !== localCategories[editingIndex]) {
      setError('هذه الفئة موجودة بالفعل');
      return;
    }

    const updated = [...localCategories];
    updated[editingIndex] = trimmed;
    setLocalCategories(updated);
    setEditingIndex(null);
    setEditingValue('');
    setError(null);
  };

  const handleDeleteCategory = (index: number) => {
    if (window.confirm(`هل أنت متأكد من حذف فئة "${localCategories[index]}"؟`)) {
      const updated = localCategories.filter((_, i) => i !== index);
      setLocalCategories(updated);
    }
  };

  const handleSave = () => {
    // Save categories to localStorage and parent component
    localStorage.setItem('expenseCategories', JSON.stringify(localCategories));
    onCategoriesChange(localCategories);
    onClose();
  };

  const handleCancel = () => {
    setLocalCategories(categories);
    setEditingIndex(null);
    setEditingValue('');
    setNewCategory('');
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            إدارة فئات المصاريف
          </DialogTitle>
          <DialogDescription>
            يمكنك إضافة أو تعديل أو حذف فئات المصاريف
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Add new category */}
          <div className="space-y-2">
            <Label>إضافة فئة جديدة</Label>
            <div className="flex gap-2">
              <Input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="اسم الفئة الجديدة"
                onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
              />
              <Button 
                onClick={handleAddCategory}
                size="sm"
                className="shrink-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Categories list */}
          <div className="space-y-2">
            <Label>الفئات الحالية ({localCategories.length})</Label>
            <div className="flex-1 border rounded-lg">
              <div className="max-h-64 overflow-y-auto p-2 space-y-2 custom-scrollbar">
              {localCategories.map((category, index) => (
                <div key={index} className="flex items-center gap-2 p-2 border rounded-lg bg-gray-50">
                  {editingIndex === index ? (
                    <>
                      <Input
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        className="flex-1"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') handleSaveEdit();
                          if (e.key === 'Escape') {
                            setEditingIndex(null);
                            setEditingValue('');
                          }
                        }}
                        autoFocus
                      />
                      <Button 
                        onClick={handleSaveEdit}
                        size="sm"
                        variant="outline"
                      >
                        حفظ
                      </Button>
                      <Button 
                        onClick={() => {
                          setEditingIndex(null);
                          setEditingValue('');
                        }}
                        size="sm"
                        variant="outline"
                      >
                        إلغاء
                      </Button>
                    </>
                  ) : (
                    <>
                      <Tag className="h-4 w-4 text-gray-500 shrink-0" />
                      <span className="flex-1 text-sm">{category}</span>
                      <Button
                        onClick={() => handleEditCategory(index)}
                        size="sm"
                        variant="ghost"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleDeleteCategory(index)}
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              ))}
              
                {localCategories.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Tag className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p>لا توجد فئات محددة</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleCancel}>
            إلغاء
          </Button>
          <Button onClick={handleSave}>
            حفظ التغييرات
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
