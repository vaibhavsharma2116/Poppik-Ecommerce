
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Palette,
  Eye,
  EyeOff,
  Loader2
} from "lucide-react";

interface Shade {
  id: number;
  name: string;
  colorCode: string;
  value: string;
  isActive: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export default function AdminShades() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedShade, setSelectedShade] = useState<Shade | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    colorCode: '#F7E7CE',
    value: '',
    isActive: true,
    sortOrder: 0
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch shades
  const { data: shades = [], isLoading } = useQuery<Shade[]>({
    queryKey: ['/api/admin/shades'],
  });

  // Create shade mutation
  const createShadeMutation = useMutation({
    mutationFn: async (shadeData: any) => {
      const response = await fetch('/api/admin/shades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shadeData),
      });
      if (!response.ok) throw new Error('Failed to create shade');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/shades'] });
      queryClient.invalidateQueries({ queryKey: ['/api/shades'] });
      setIsAddModalOpen(false);
      resetForm();
      toast({ title: "Success", description: "Shade created successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // Update shade mutation
  const updateShadeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await fetch(`/api/admin/shades/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update shade');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/shades'] });
      queryClient.invalidateQueries({ queryKey: ['/api/shades'] });
      setIsEditModalOpen(false);
      resetForm();
      toast({ title: "Success", description: "Shade updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // Delete shade mutation
  const deleteShadeMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/shades/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete shade');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/shades'] });
      queryClient.invalidateQueries({ queryKey: ['/api/shades'] });
      setIsDeleteModalOpen(false);
      setSelectedShade(null);
      toast({ title: "Success", description: "Shade deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      colorCode: '#F7E7CE',
      value: '',
      isActive: true,
      sortOrder: 0
    });
    setSelectedShade(null);
  };

  const handleAdd = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const handleEdit = (shade: Shade) => {
    setSelectedShade(shade);
    setFormData({
      name: shade.name,
      colorCode: shade.colorCode,
      value: shade.value,
      isActive: shade.isActive,
      sortOrder: shade.sortOrder
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (shade: Shade) => {
    setSelectedShade(shade);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = (isEdit: boolean) => {
    if (!formData.name || !formData.colorCode) {
      toast({ title: "Error", description: "Name and color code are required", variant: "destructive" });
      return;
    }

    const value = formData.value || formData.name.toLowerCase().replace(/\s+/g, '-');

    if (isEdit && selectedShade) {
      updateShadeMutation.mutate({ 
        id: selectedShade.id, 
        data: { ...formData, value } 
      });
    } else {
      createShadeMutation.mutate({ ...formData, value });
    }
  };

  const handleToggleActive = (shade: Shade) => {
    updateShadeMutation.mutate({
      id: shade.id,
      data: { ...shade, isActive: !shade.isActive }
    });
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading shades...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
            Shade Management
          </h2>
          <p className="text-slate-600 mt-1">Manage product shade colors and options</p>
        </div>
        <Button onClick={handleAdd} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
          <Plus className="h-4 w-4 mr-2" />
          Add New Shade
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Shades</p>
                <p className="text-2xl font-bold text-slate-900">{shades.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                <Palette className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Active Shades</p>
                <p className="text-2xl font-bold text-slate-900">{shades.filter(s => s.isActive).length}</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500">
                <Eye className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Inactive Shades</p>
                <p className="text-2xl font-bold text-slate-900">{shades.filter(s => !s.isActive).length}</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-500">
                <EyeOff className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shades Table */}
      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>All Shades</CardTitle>
          <CardDescription>Manage your product shade colors</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-slate-200 bg-slate-50/50">
                <TableHead className="text-slate-800 font-semibold py-4">Preview</TableHead>
                <TableHead className="text-slate-800 font-semibold py-4">Name</TableHead>
                <TableHead className="text-slate-800 font-semibold py-4">Color Code</TableHead>
                <TableHead className="text-slate-800 font-semibold py-4">Value</TableHead>
                <TableHead className="text-slate-800 font-semibold py-4">Status</TableHead>
                <TableHead className="text-slate-800 font-semibold py-4">Sort Order</TableHead>
                <TableHead className="text-slate-800 font-semibold py-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shades.map((shade) => (
                <TableRow key={shade.id} className="border-b border-slate-100 hover:bg-slate-50/60 transition-all duration-200">
                  <TableCell className="py-4">
                    <div 
                      className="w-8 h-8 rounded-full border-2 border-gray-300 shadow-sm"
                      style={{ backgroundColor: shade.colorCode }}
                      title={`${shade.name} - ${shade.colorCode}`}
                    ></div>
                  </TableCell>
                  <TableCell className="py-4 font-medium">{shade.name}</TableCell>
                  <TableCell className="py-4">
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm">{shade.colorCode}</code>
                  </TableCell>
                  <TableCell className="py-4 text-gray-600">{shade.value}</TableCell>
                  <TableCell className="py-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(shade)}
                      className="p-1"
                    >
                      <Badge 
                        variant={shade.isActive ? "default" : "secondary"}
                        className={shade.isActive 
                          ? "bg-green-100 text-green-800 border border-green-200" 
                          : "bg-gray-100 text-gray-800 border border-gray-200"
                        }
                      >
                        {shade.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </Button>
                  </TableCell>
                  <TableCell className="py-4">{shade.sortOrder}</TableCell>
                  <TableCell className="text-right py-4">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-9 w-9 p-0 rounded-lg transition-all hover:bg-emerald-50 hover:text-emerald-600"
                        onClick={() => handleEdit(shade)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-9 w-9 p-0 rounded-lg transition-all hover:bg-red-50 hover:text-red-600"
                        onClick={() => handleDelete(shade)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Shade Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-purple-600" />
              Add New Shade
            </DialogTitle>
            <DialogDescription>
              Create a new shade color option for products
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="add-name">Shade Name *</Label>
              <Input
                id="add-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Fair to Light"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-color">Color Code *</Label>
              <div className="flex gap-3 items-center">
                <Input
                  id="add-color"
                  type="color"
                  value={formData.colorCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, colorCode: e.target.value }))}
                  className="w-16 h-10"
                  required
                />
                <Input
                  value={formData.colorCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, colorCode: e.target.value }))}
                  placeholder="#F7E7CE"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-value">Value (auto-generated if empty)</Label>
              <Input
                id="add-value"
                value={formData.value}
                onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                placeholder="fair-light"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-sort">Sort Order</Label>
              <Input
                id="add-sort"
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                placeholder="0"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="add-active"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <Label htmlFor="add-active" className="text-sm">Active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => handleSubmit(false)} 
              disabled={createShadeMutation.isPending}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {createShadeMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Shade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Shade Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-emerald-600" />
              Edit Shade
            </DialogTitle>
            <DialogDescription>
              Update shade information
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Shade Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Fair to Light"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-color">Color Code *</Label>
              <div className="flex gap-3 items-center">
                <Input
                  id="edit-color"
                  type="color"
                  value={formData.colorCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, colorCode: e.target.value }))}
                  className="w-16 h-10"
                  required
                />
                <Input
                  value={formData.colorCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, colorCode: e.target.value }))}
                  placeholder="#F7E7CE"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-value">Value</Label>
              <Input
                id="edit-value"
                value={formData.value}
                onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                placeholder="fair-light"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-sort">Sort Order</Label>
              <Input
                id="edit-sort"
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                placeholder="0"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-active"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <Label htmlFor="edit-active" className="text-sm">Active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => handleSubmit(true)} 
              disabled={updateShadeMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {updateShadeMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Update Shade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Delete Shade
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. Are you sure you want to delete this shade?
            </DialogDescription>
          </DialogHeader>
          {selectedShade && (
            <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-lg border border-red-200">
              <div 
                className="w-8 h-8 rounded-full border-2 border-gray-300"
                style={{ backgroundColor: selectedShade.colorCode }}
              ></div>
              <div>
                <p className="font-medium text-slate-900">{selectedShade.name}</p>
                <p className="text-sm text-slate-600">{selectedShade.colorCode}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => selectedShade && deleteShadeMutation.mutate(selectedShade.id)}
              disabled={deleteShadeMutation.isPending}
            >
              {deleteShadeMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete Shade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
