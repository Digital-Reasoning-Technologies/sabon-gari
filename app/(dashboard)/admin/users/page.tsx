"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardWrapper from "@/app/(dashboard)/components/DashboardWrapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  User as UserIcon,
  Mail,
  Shield,
  Eye,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

type UserRole = 'user' | 'admin' | 'superadmin';

interface UserItem {
  _id: string;
  email: string;
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
}

type ApiResponse<T> = {
  ok: boolean;
  data?: T;
  message?: string;
};

export default function UsersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);

  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [viewingUser, setViewingUser] = useState<UserItem | null>(null);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState<{
    email: string;
    password: string;
    role: UserRole;
  }>({
    email: "",
    password: "",
    role: "user",
  });

  const fetchJson = useCallback(async <T,>(url: string): Promise<ApiResponse<T>> => {
    const res = await fetch(url, { method: 'GET' });
    const json = (await res.json()) as ApiResponse<T>;
    if (!res.ok || json.ok === false) {
      throw new Error(json.message || `Request failed (${res.status})`);
    }
    return json;
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const json = await fetchJson<UserItem[]>('/api/auth/users');
      setUsers(json.data ?? []);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to load users',
        description: error.message || 'An error occurred while loading users',
      });
    } finally {
      setIsLoading(false);
    }
  }, [fetchJson, toast]);

  // Check user access on mount
  useEffect(() => {
    const checkAccess = async () => {
      try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        
        if (!data.ok || data.data?.role !== 'superadmin') {
          toast({
            variant: 'destructive',
            title: 'Access Denied',
            description: 'You do not have permission to access this page.',
          });
          router.replace('/admin');
          return;
        }
        
        setIsCheckingAccess(false);
        loadUsers();
      } catch (error) {
        console.error('Failed to check access:', error);
        toast({
          variant: 'destructive',
          title: 'Access Check Failed',
          description: 'Unable to verify your permissions.',
        });
        router.replace('/admin');
      }
    };
    
    checkAccess();
  }, [router, toast, loadUsers]);

  const filteredUsers = useMemo(() => {
    return users
      .filter(user => {
        const matchesSearch = searchTerm === "" || 
          user.email.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesFilter = filterRole === "all" || user.role === filterRole;
        
        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => {
        // Sort by createdAt (newest first), then by role, then by email
        const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        if (bDate !== aDate) return bDate - aDate; // Newest first
        
        const roleOrder = { superadmin: 0, admin: 1, user: 2 };
        const roleDiff = roleOrder[a.role] - roleOrder[b.role];
        if (roleDiff !== 0) return roleDiff;
        return a.email.localeCompare(b.email);
      });
  }, [users, searchTerm, filterRole]);

  const handleAdd = () => {
    setEditingUser(null);
    setFormData({
      email: "",
      password: "",
      role: "user",
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (user: UserItem) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      password: "", // Don't pre-fill password
      role: user.role,
    });
    setIsDialogOpen(true);
  };

  const handleView = (user: UserItem) => {
    setViewingUser(user);
    setIsViewModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteUserId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteUserId) {
      setIsDeleteDialogOpen(false);
      return;
    }

    setIsDeleting(true);

    try {
      const res = await fetch(`/api/auth/users/${deleteUserId}`, {
        method: 'DELETE',
      });

      const json = await res.json();
      if (!res.ok || json.ok === false) {
        throw new Error(json.message || 'Failed to delete user');
      }

      toast({
        variant: 'success',
        title: 'Deleted',
        description: 'User deleted successfully.',
      });

      setDeleteUserId(null);
      setIsDeleteDialogOpen(false);

      // Refresh users list
      await loadUsers();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Delete failed',
        description: error.message || 'Failed to delete user',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.email.trim()) {
      setAlertMessage("Email is required!");
      setIsAlertDialogOpen(true);
      return;
    }

    if (!editingUser && !formData.password.trim()) {
      setAlertMessage("Password is required for new users!");
      setIsAlertDialogOpen(true);
      return;
    }

    if (formData.password && formData.password.length < 6) {
      setAlertMessage("Password must be at least 6 characters!");
      setIsAlertDialogOpen(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('email', formData.email.trim());
      formDataToSend.append('role', formData.role);
      
      if (editingUser) {
        // Only include password if it was provided
        if (formData.password.trim()) {
          formDataToSend.append('password', formData.password.trim());
        }

        const res = await fetch(`/api/auth/users/${editingUser._id}`, {
          method: 'PUT',
          body: formDataToSend,
        });

        const json = await res.json();
        if (!res.ok || json.ok === false) {
          throw new Error(json.message || 'Failed to update user');
        }

        toast({
          variant: 'success',
          title: 'Updated',
          description: 'User updated successfully.',
        });
      } else {
        formDataToSend.append('password', formData.password.trim());

        const res = await fetch('/api/auth/users', {
          method: 'POST',
          body: formDataToSend,
        });

        const json = await res.json();
        if (!res.ok || json.ok === false) {
          throw new Error(json.message || 'Failed to create user');
        }

        toast({
          variant: 'success',
          title: 'Created',
          description: 'User created successfully.',
        });
      }

      setIsDialogOpen(false);
      await loadUsers();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: editingUser ? 'Update failed' : 'Create failed',
        description: error.message || `Failed to ${editingUser ? 'update' : 'create'} user`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'superadmin':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'admin':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'user':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'superadmin':
        return <Shield className="h-3 w-3" />;
      case 'admin':
        return <Shield className="h-3 w-3" />;
      default:
        return <UserIcon className="h-3 w-3" />;
    }
  };

  // Show loading state while checking access
  if (isCheckingAccess) {
    return (
      <DashboardWrapper
        activeTab="users"
        setActiveTab={() => {}}
        tabConfig={[]}
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="h-8 w-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Checking permissions...</p>
          </div>
        </div>
      </DashboardWrapper>
    );
  }

  return (
    <DashboardWrapper
      activeTab="users"
      setActiveTab={() => {}}
      tabConfig={[]}
    >
      <TooltipProvider>
        <div className="space-y-6">
        {/* Header */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-br from-emerald-50 to-teal-50 border-b">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
                  Users Management
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Manage system users and permissions ({filteredUsers.length} users)
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleAdd}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New User
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {/* Search and Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users by email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 border-gray-200 focus:border-emerald-500"
                />
              </div>
              <div className="flex gap-2">
                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger className="w-[150px] border-gray-200">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="superadmin">Super Admin</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Loading State */}
            {isLoading ? (
              <div className="w-full mb-4">
                <Progress value={undefined} className="h-2 bg-gray-200 [&>*]:bg-gradient-to-r [&>*]:from-emerald-500 [&>*]:to-teal-500 [&>*]:animate-shimmer" />
              </div>
            ) : null}

            {/* Users Table */}
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader className="bg-gradient-to-r from-gray-50 to-gray-100/50">
                  <TableRow className="hover:bg-transparent border-b-2">
                    <TableHead className="font-semibold text-gray-700">Email</TableHead>
                    <TableHead className="font-semibold text-gray-700">Role</TableHead>
                    <TableHead className="font-semibold text-gray-700">Created</TableHead>
                    <TableHead className="text-right font-semibold text-gray-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-16">
                        <div className="flex flex-col items-center gap-4">
                          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                            <UserIcon className="h-10 w-10 text-gray-400" />
                          </div>
                          <div>
                            <p className="text-gray-700 font-medium">No users found</p>
                            <p className="text-sm text-gray-500 mt-1">
                              {searchTerm || filterRole !== "all"
                                ? "Try adjusting your search or filter"
                                : 'Click "Add New User" to create your first user'}
                            </p>
                          </div>
                          {(searchTerm || filterRole !== "all") && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSearchTerm("");
                                setFilterRole("all");
                              }}
                            >
                              Clear filters
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow
                        key={user._id}
                        className="group hover:bg-gradient-to-r hover:from-emerald-50/20 hover:to-teal-50/20 transition-colors duration-200"
                      >
                        <TableCell className="font-semibold">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 flex-shrink-0">
                              <AvatarFallback className="bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-700 font-semibold">
                                {user.email.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-gray-900 group-hover:text-emerald-700 transition-colors">
                              {user.email}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`flex items-center w-fit gap-1 ${getRoleColor(user.role)}`}
                          >
                            {getRoleIcon(user.role)}
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleView(user)}
                                  className="h-8 w-8 p-0 hover:bg-emerald-50 hover:text-emerald-700"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>View</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(user)}
                                  className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-700"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(user._id)}
                                  className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Delete</TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px] bg-white">
            <DialogHeader className="space-y-3">
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
                {editingUser ? "Edit User" : "Add New User"}
              </DialogTitle>
              <DialogDescription>
                {editingUser
                  ? "Update user information. Leave password empty to keep current password."
                  : "Create a new user account with email and password."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="user@example.com"
                  className="border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                  Password {editingUser ? "(leave empty to keep current)" : "*"}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder={editingUser ? "Enter new password" : "Minimum 6 characters"}
                  className="border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                  required={!editingUser}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-semibold text-gray-700">Role *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => {
                    setFormData({ ...formData, role: value as UserRole });
                  }}
                >
                  <SelectTrigger className="border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="superadmin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="hover:bg-gray-100"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    {editingUser ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  editingUser ? "Update" : "Create"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Modal */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-white">
            {viewingUser && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                    <UserIcon className="h-5 w-5 text-emerald-600" />
                    User Details
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">Email:</span>
                      <span>{viewingUser.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <span className="font-medium">Role:</span>
                      <Badge
                        variant="outline"
                        className={`${getRoleColor(viewingUser.role)}`}
                      >
                        {getRoleIcon(viewingUser.role)}
                        {viewingUser.role}
                      </Badge>
                    </div>
                    {viewingUser.createdAt && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <span className="font-medium">Created:</span>
                        <span>
                          {new Date(viewingUser.createdAt).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsViewModalOpen(false)}
                    className="hover:bg-gray-100"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      setIsViewModalOpen(false);
                      handleEdit(viewingUser);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Alert Dialog for Validation Errors */}
        <AlertDialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
          <AlertDialogContent className="bg-white">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                Validation Error
              </AlertDialogTitle>
              <AlertDialogDescription>
                {alertMessage}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setIsAlertDialogOpen(false)}>
                OK
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent className="bg-white">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                Confirm Delete
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this user? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => {
                  setDeleteUserId(null);
                  setIsDeleteDialogOpen(false);
                }}
                disabled={isDeleting}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 inline-block" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        </div>
      </TooltipProvider>
    </DashboardWrapper>
  );
}
