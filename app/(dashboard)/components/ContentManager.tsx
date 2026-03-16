"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Eye,
  Search,
  Calendar,
  User,
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

type ContentType = "news" | "gallery" | "projects";

type StatusType = "draft" | "published" | "archived" | "ongoing" | "completed" | "pending";

interface ContentItem {
  id: string;
  slug?: string;
  title: string;
  description: string;
  content?: string;
  date: string;
  createdAt?: string;
  image?: string;
  images?: string[];
  status?: StatusType;
  views?: number;
  category?: string;
  author?: string;
  progress?: number;
}

type ApiResponse<T> = {
  ok: boolean;
  data?: T;
  message?: string;
  pagination?: any;
};

interface ContentManagerProps {
  type: ContentType;
  title: string;
}

const ContentManager = ({ type, title }: ContentManagerProps) => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [alertMessage, setAlertMessage] = useState<string>("");

  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [viewingItem, setViewingItem] = useState<ContentItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "title">("date");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [pagination, setPagination] = useState<{
    total: number;
    page: number;
    pages: number;
    limit: number;
  } | null>(null);

  const [items, setItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]); // Store selected files for later upload

  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    content: string;
    date: string;
    image: string;
    images: string[];
    status: StatusType;
    category: string;
    author: string;
  }>({
    title: "",
    description: "",
    content: "",
    date: new Date().toISOString().split('T')[0],
    image: "",
    images: [],
    status: type === "projects" ? "ongoing" : "published",
    category: "",
    author: "",
  });

  const fetchJson = useCallback(async <T,>(url: string): Promise<ApiResponse<T>> => {
    const res = await fetch(url, { method: 'GET' });
    const json = (await res.json()) as ApiResponse<T>;
    
    // Check for authentication errors (401)
    if (res.status === 401 || (json.ok === false && ((json as any).code === 'INVALID_TOKEN' || (json as any).code === 'NO_TOKEN'))) {
      // Import logout function dynamically to avoid SSR issues
      const { logoutUser } = await import('@/lib/auth-utils');
      await logoutUser();
      throw new Error('Session expired. Please login again.');
    }
    
    if (!res.ok || json.ok === false) {
      throw new Error(json.message || `Request failed (${res.status})`);
    }
    return json;
  }, []);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const endpoint = type === 'news' 
        ? `/api/dashboard/news?page=${currentPage}&limit=${itemsPerPage}`
        : type === 'gallery'
        ? `/api/dashboard/gallery?page=${currentPage}&limit=${itemsPerPage}`
        : `/api/dashboard/projects?page=${currentPage}&limit=${itemsPerPage}`;
      
      const json = await fetchJson<any[]>(endpoint);
      if (json.pagination) {
        setPagination(json.pagination);
      }
      
      const mapped: ContentItem[] = (json.data ?? []).map((item: any) => {
        if (type === 'news') {
          return {
            id: item._id?.toString?.() ?? String(item._id),
            slug: item.slug,
            title: item.title,
            description: item.description,
            content: item.content,
            date: item.date ?? new Date().toISOString().slice(0, 10),
            createdAt: item.createdAt,
            image: Array.isArray(item.images) ? item.images[0] : item.image,
            images: Array.isArray(item.images) ? item.images : (item.image ? [item.image] : []),
            status: 'published',
            views: 0,
            author: 'Admin',
            category: item.location,
          };
        } else if (type === 'gallery') {
          return {
            id: item._id?.toString?.() ?? String(item._id),
            title: item.title,
            description: item.description,
            date: item.date ?? new Date().toISOString().slice(0, 10),
            createdAt: item.createdAt,
            image: item.image ?? (Array.isArray(item.images) ? item.images[0] : undefined),
            images: Array.isArray(item.images) ? item.images : (item.image ? [item.image] : []),
            status: 'published',
            views: 0,
            category: 'Gallery',
          };
        } else {
          return {
            id: item._id?.toString?.() ?? String(item._id),
            title: item.title,
            description: item.description,
            date: item.date ?? new Date().toISOString().slice(0, 10),
            createdAt: item.createdAt,
            image: item.image,
            images: item.images || [],
            status: item.status ?? 'ongoing',
            progress: 0,
          };
        }
      });
      
      setItems(mapped);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to load data',
        description: error.message || 'An error occurred while loading data',
      });
    } finally {
      setIsLoading(false);
    }
  }, [type, fetchJson, toast, currentPage, itemsPerPage]);

  useEffect(() => {
    loadData();
  }, [loadData, currentPage, itemsPerPage]);

  // Reset to page 1 when search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  const filteredItems = useMemo(() => {
    return items
      .filter(item => {
        const matchesSearch = searchTerm === "" || 
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesFilter = filterStatus === "all" || item.status === filterStatus;
        
        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => {
        if (sortBy === "date") {
          const aTime = a.createdAt 
            ? new Date(a.createdAt).getTime() 
            : new Date(a.date).getTime();
          const bTime = b.createdAt 
            ? new Date(b.createdAt).getTime() 
            : new Date(b.date).getTime();
          return bTime - aTime;
        }
        return a.title.localeCompare(b.title);
      });
  }, [items, searchTerm, filterStatus, sortBy]);

  const handleAdd = () => {
    setEditingItem(null);
    const defaultStatus = type === "projects" ? "ongoing" : "published";
    setFormData({
      title: "",
      description: "",
      content: "",
      date: new Date().toISOString().split('T')[0],
      image: "",
      images: [],
      status: defaultStatus as StatusType,
      category: "",
      author: "",
    });
    setUploadedImageUrls([]);
    setImagePreviews([]);
    setSelectedFiles([]);
    setIsDialogOpen(true);
  };

  const handleEdit = (item: ContentItem) => {
    setEditingItem(item);
    const existingImages = Array.isArray((item as any).images) ? (item as any).images : (item.image ? [item.image] : []);
    const defaultStatus = type === "projects" ? "ongoing" : "published";
    setFormData({
      title: item.title,
      description: item.description,
      content: item.content || "",
      date: item.date,
      image: item.image || "",
      images: existingImages,
      status: item.status || (defaultStatus as StatusType),
      category: item.category || "",
      author: item.author || "",
    });
    setUploadedImageUrls(existingImages);
    setImagePreviews(existingImages);
    setSelectedFiles([]);
    setIsDialogOpen(true);
  };

  const handleView = (item: ContentItem) => {
    setViewingItem(item);
    setIsViewModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteItemId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleImageSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    // Create immediate previews for selected files (no upload yet)
    const fileArray = Array.from(files);
    const previews = fileArray.map(file => URL.createObjectURL(file));

    // Store files and previews - upload will happen on form submit
    setSelectedFiles((prev) => [...prev, ...fileArray]);
    setImagePreviews((prev) => [...prev, ...previews]);
  };

  const handleImageUpload = async (files: File[]): Promise<string[]> => {
    if (!files || files.length === 0) return [];

    // Validate files
    const validFiles = files.filter(file => file instanceof File && file.size > 0);
    if (validFiles.length === 0) {
      throw new Error('No valid files to upload');
    }

    const formData = new FormData();
      
    // Append files with correct field name 'file' (not 'files')
    validFiles.forEach((file) => {
      formData.append('file', file, file.name);
    });
    
    // Add folder based on content type
    const folder = type === 'gallery' ? 'kudan/gallery' : type === 'news' ? 'kudan/news' : 'kudan/projects';
    formData.append('folder', folder);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header - browser will set it automatically with boundary
    });

    const json = await res.json();
    if (!res.ok || json.ok === false) {
      throw new Error(json.message || 'Failed to upload images');
    }

    // Parse response - API returns different structures for single vs multiple files
    let urls: string[] = [];
    if (json.data?.url) {
      // Single file response
      urls = [json.data.url];
    } else if (json.data?.items && Array.isArray(json.data.items)) {
      // Multiple files response
      urls = json.data.items.map((item: any) => item.url);
    } else if (json.data?.urls && Array.isArray(json.data.urls)) {
      // Fallback for urls array
      urls = json.data.urls;
    }

    if (urls.length === 0) {
      throw new Error('No image URLs returned from server');
    }

    return urls;
  };

  const removeImage = (sourceIndex: number, isPreview: boolean) => {
    if (type === 'gallery' || type === 'news') {
      // Calculate filtered arrays first
      let newSelectedFiles: File[] = selectedFiles;
      let newImagePreviews: string[] = imagePreviews;
      let newUploadedUrls: string[] = uploadedImageUrls;
      
      if (isPreview) {
        // Remove from selected files and imagePreviews
        // Only remove if it's actually a blob URL (new file), otherwise it's an existing uploaded URL
        const previewToRemove = imagePreviews[sourceIndex];
        if (previewToRemove?.startsWith('blob:')) {
          URL.revokeObjectURL(previewToRemove);
          // Find the correct index in selectedFiles by counting blob URLs before this one
          let blobIndex = 0;
          for (let i = 0; i < sourceIndex; i++) {
            if (imagePreviews[i]?.startsWith('blob:')) {
              blobIndex++;
            }
          }
          // Remove from selectedFiles using the correct blob index
          newSelectedFiles = selectedFiles.filter((_, i) => i !== blobIndex);
          newImagePreviews = imagePreviews.filter((_, i) => i !== sourceIndex);
        } else {
          // Non-blob URL in imagePreviews means it's an existing uploaded URL
          // Find and remove it from uploadedImageUrls instead
          const urlToRemove = imagePreviews[sourceIndex];
          const uploadedIndex = uploadedImageUrls.indexOf(urlToRemove);
          if (uploadedIndex !== -1) {
            newUploadedUrls = uploadedImageUrls.filter((_, i) => i !== uploadedIndex);
            // Also remove from imagePreviews
            newImagePreviews = imagePreviews.filter((_, i) => i !== sourceIndex);
          }
        }
      } else {
        // Remove from uploaded URLs
        const urlToRemove = uploadedImageUrls[sourceIndex];
        newUploadedUrls = uploadedImageUrls.filter((_, i) => i !== sourceIndex);
        // Also remove from imagePreviews if the same URL exists there
        if (urlToRemove) {
          newImagePreviews = imagePreviews.filter((url) => url !== urlToRemove);
        }
      }
      
      // Update state
      setSelectedFiles(newSelectedFiles);
      setImagePreviews(newImagePreviews);
      setUploadedImageUrls(newUploadedUrls);
      
      // Rebuild formData.images from filtered arrays
      setFormData((prev) => {
        // Combine remaining previews (blob URLs) and uploaded URLs, deduplicate
        const allRemainingImages = [...newImagePreviews, ...newUploadedUrls];
        const uniqueImages = Array.from(new Set(allRemainingImages));
        
        return {
          ...prev,
          images: uniqueImages,
          image: uniqueImages[0] || prev.image, // Update main image if needed
        };
      });
    } else {
      // Projects - same logic as gallery/news but for projects
      // Calculate filtered arrays first
      let newSelectedFiles: File[] = selectedFiles;
      let newImagePreviews: string[] = imagePreviews;
      let newUploadedUrls: string[] = uploadedImageUrls;
      
      if (isPreview) {
        // Remove from selected files and imagePreviews
        // Only remove if it's actually a blob URL (new file), otherwise it's an existing uploaded URL
        const previewToRemove = imagePreviews[sourceIndex];
        if (previewToRemove?.startsWith('blob:')) {
          URL.revokeObjectURL(previewToRemove);
          // Find the correct index in selectedFiles by counting blob URLs before this one
          let blobIndex = 0;
          for (let i = 0; i < sourceIndex; i++) {
            if (imagePreviews[i]?.startsWith('blob:')) {
              blobIndex++;
            }
          }
          // Remove from selectedFiles using the correct blob index
          newSelectedFiles = selectedFiles.filter((_, i) => i !== blobIndex);
          newImagePreviews = imagePreviews.filter((_, i) => i !== sourceIndex);
        } else {
          // Non-blob URL in imagePreviews means it's an existing uploaded URL
          // Find and remove it from uploadedImageUrls instead
          const urlToRemove = imagePreviews[sourceIndex];
          const uploadedIndex = uploadedImageUrls.indexOf(urlToRemove);
          if (uploadedIndex !== -1) {
            newUploadedUrls = uploadedImageUrls.filter((_, i) => i !== uploadedIndex);
            // Also remove from imagePreviews
            newImagePreviews = imagePreviews.filter((_, i) => i !== sourceIndex);
          }
        }
      } else {
        // Remove from uploaded URLs
        const urlToRemove = uploadedImageUrls[sourceIndex];
        newUploadedUrls = uploadedImageUrls.filter((_, i) => i !== sourceIndex);
        // Also remove from imagePreviews if the same URL exists there
        if (urlToRemove) {
          newImagePreviews = imagePreviews.filter((url) => url !== urlToRemove);
        }
      }
      
      // Update state
      setSelectedFiles(newSelectedFiles);
      setImagePreviews(newImagePreviews);
      setUploadedImageUrls(newUploadedUrls);
      
      // Rebuild formData.images from filtered arrays
      setFormData((prev) => {
        // Combine remaining previews (blob URLs) and uploaded URLs, deduplicate
        const allRemainingImages = [...newImagePreviews, ...newUploadedUrls];
        const uniqueImages = Array.from(new Set(allRemainingImages));
        
        return {
          ...prev,
          images: uniqueImages,
          image: uniqueImages[0] || prev.image, // Update main image if needed
        };
      });
    }
  };

  const handleSubmit = async () => {
    // Note: We don't check uploadingImages here anymore since upload happens during submit

    if (!formData.title.trim() || !formData.description.trim()) {
      setAlertMessage("Title and description are required!");
      setIsAlertDialogOpen(true);
      return;
    }

    if (type === 'news' && !formData.content.trim()) {
      setAlertMessage("Content is required for news items!");
      setIsAlertDialogOpen(true);
      return;
    }

    // Check if images are selected (either uploaded or selected files waiting to be uploaded)
    const hasImages = selectedFiles.length > 0 || uploadedImageUrls.length > 0 || formData.images.length > 0 || formData.image;
    
    if (type === 'gallery' && !hasImages) {
      setAlertMessage("At least one image is required for gallery items! Please upload an image first.");
      setIsAlertDialogOpen(true);
      return;
    }

    if (type === 'news' && !hasImages) {
      setAlertMessage("At least one image is required for news items! Please upload an image first.");
      setIsAlertDialogOpen(true);
      return;
    }

    if (type === 'projects' && !hasImages) {
      setAlertMessage("An image is required for projects! Please upload an image first.");
      setIsAlertDialogOpen(true);
      return;
    }

    setIsSubmitting(true);

    try {
      // First, upload any selected files that haven't been uploaded yet
      let newUploadedUrls: string[] = [];
      if (selectedFiles.length > 0) {
        setUploadingImages(true);
        try {
          // Validate files before upload
          const filesToUpload = selectedFiles.filter(file => 
            file instanceof File && 
            file.size > 0 && 
            file.type.startsWith('image/')
          );
          
          if (filesToUpload.length === 0) {
            throw new Error('No valid image files to upload. Please select image files.');
          }
          
          newUploadedUrls = await handleImageUpload(filesToUpload);
          
          // #region agent log
          fetch('http://127.0.0.1:7243/ingest/5ae3dc11-cd75-4fff-a2a4-798b349edd4c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ContentManager.tsx:565',message:'Image upload response',data:{newUploadedUrls,uploadedImageUrlsBefore:uploadedImageUrls,isEditing:!!editingItem},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
          // #endregion
          
          // Combine with existing uploaded URLs
          const allUploadedUrls = [...uploadedImageUrls, ...newUploadedUrls];
          setUploadedImageUrls(allUploadedUrls);
          
          // Clear selected files since they're now uploaded
          setSelectedFiles([]);
          
          // Clean up preview blob URLs and replace with uploaded URLs
          imagePreviews.forEach((preview) => {
            if (preview.startsWith('blob:')) {
              URL.revokeObjectURL(preview);
            }
          });
          setImagePreviews([]);
        } catch (uploadError: any) {
          setUploadingImages(false);
          throw new Error(`Image upload failed: ${uploadError.message}`);
        } finally {
          setUploadingImages(false);
        }
      }

      const formDataToSend = new FormData();
      
      formDataToSend.append('title', formData.title.trim());
      formDataToSend.append('description', formData.description.trim());
      
      if (type === 'news') {
        formDataToSend.append('content', formData.content.trim());
      }
      
      formDataToSend.append('date', formData.date);
      
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/5ae3dc11-cd75-4fff-a2a4-798b349edd4c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ContentManager.tsx:600',message:'Image arrangement - before combine',data:{uploadedImageUrls,newUploadedUrls,formDataImages:formData.images,formDataImage:formData.image,isEditing:!!editingItem},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion

      // Combine newly uploaded URLs with existing uploaded URLs and formData images
      // FIX: New images should be appended (last), not prepended (first)
      // When editing: keep existing images first, append new ones
      // When creating: new images are the only images, so order is preserved
      const allImageUrls = editingItem 
        ? [...uploadedImageUrls, ...newUploadedUrls]  // Existing first, new last
        : newUploadedUrls.length > 0 
          ? newUploadedUrls  // New items: only new images
          : (formData.images.length > 0 
            ? formData.images 
            : (formData.image ? [formData.image] : []));
      const imagesToSend = allImageUrls.length > 0 
        ? allImageUrls 
        : (formData.images.length > 0 
          ? formData.images 
          : (formData.image ? [formData.image] : []));

      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/5ae3dc11-cd75-4fff-a2a4-798b349edd4c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ContentManager.tsx:615',message:'Image arrangement - after combine',data:{allImageUrls,imagesToSend,isEditing:!!editingItem},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
      if (type === 'news') {
        // News requires images
        if (imagesToSend.length === 0) {
          throw new Error('At least one image is required for news items');
        }
        imagesToSend.forEach(url => {
          formDataToSend.append('images[]', url);
        });
        if (formData.category) {
          formDataToSend.append('location', formData.category);
        }
      } else if (type === 'gallery') {
        // Gallery requires images
        if (imagesToSend.length === 0) {
          throw new Error('At least one image is required for gallery items');
        }
        imagesToSend.forEach(url => {
          formDataToSend.append('images[]', url);
        });
        formDataToSend.append('image', imagesToSend[0] || '');
      } else if (type === 'projects') {
        // Projects requires at least one image
        if (imagesToSend.length === 0 && !formData.image) {
          throw new Error('An image is required for projects');
        }
        const mainImage = imagesToSend[0] || formData.image || '';
        formDataToSend.append('image', mainImage);
        if (imagesToSend.length > 0) {
          imagesToSend.forEach(url => {
            formDataToSend.append('images[]', url);
          });
        }
        formDataToSend.append('status', formData.status);
        if (formData.category) {
          formDataToSend.append('location', formData.category);
        }
      }

      const endpoint = type === 'news' 
        ? '/api/dashboard/news'
        : type === 'gallery'
        ? '/api/dashboard/gallery'
        : '/api/dashboard/projects';

      let result: any;

      if (editingItem) {
        const identifier = type === 'news' 
          ? editingItem.slug 
          : editingItem.id;
        
        if (!identifier) {
          throw new Error('Unable to identify item for update');
        }

        const updateEndpoint = type === 'news'
          ? `/api/dashboard/news/${identifier}`
          : type === 'gallery'
          ? `/api/dashboard/gallery/${identifier}`
          : `/api/dashboard/projects/${identifier}`;

        const res = await fetch(updateEndpoint, {
          method: 'PUT',
          body: formDataToSend,
        });

        const json = await res.json();
        if (!res.ok || json.ok === false) {
          throw new Error(json.message || `Failed to update ${type} item`);
        }

        result = json.data;
        toast({ 
          variant: 'success', 
          title: 'Updated', 
          description: `${title} item updated successfully.` 
        });
      } else {
        const res = await fetch(endpoint, {
          method: 'POST',
          body: formDataToSend,
        });

        const json = await res.json();
        if (!res.ok || json.ok === false) {
          throw new Error(json.message || `Failed to create ${type} item`);
        }

        result = json.data;
        toast({ 
          variant: 'success', 
          title: 'Created', 
          description: `${title} item created successfully.` 
        });
      }

      imagePreviews.forEach((preview) => {
        if (preview.startsWith('blob:')) {
          URL.revokeObjectURL(preview);
        }
      });

      // Reset all image-related state
      setUploadedImageUrls([]);
      setImagePreviews([]);
      setSelectedFiles([]);
      setIsDialogOpen(false);
      await loadData();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: editingItem ? 'Update failed' : 'Create failed',
        description: error.message || `Failed to ${editingItem ? 'update' : 'create'} ${type} item`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteItemId) {
      setIsDeleteDialogOpen(false);
      return;
    }

    setIsDeleting(true);

    try {
      const itemToDelete = items.find((item) => item.id === deleteItemId);
      
      if (!itemToDelete) {
        throw new Error('Item not found');
      }

      const identifier = type === 'news' 
        ? itemToDelete.slug 
        : itemToDelete.id;

      if (!identifier) {
        throw new Error('Unable to identify item for deletion');
      }

      const endpoint = type === 'news'
        ? `/api/dashboard/news/${identifier}`
        : type === 'gallery'
        ? `/api/dashboard/gallery/${identifier}`
        : `/api/dashboard/projects/${identifier}`;

      const res = await fetch(endpoint, {
        method: 'DELETE',
      });

      const json = await res.json();
      if (!res.ok || json.ok === false) {
        throw new Error(json.message || `Failed to delete ${type} item`);
      }

      toast({ 
        variant: 'success', 
        title: 'Deleted', 
        description: `${title} item deleted successfully.` 
      });

      setDeleteItemId(null);
      setIsDeleteDialogOpen(false);
      await loadData();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Delete failed',
        description: error.message || `Failed to delete ${type} item`,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusColor = (status?: StatusType) => {
    if (!status) return 'bg-gray-100 text-gray-800 border-gray-300';
    switch (status) {
      case 'published':
      case 'ongoing':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'draft':
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'archived':
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status?: StatusType) => {
    if (!status) return null;
    switch (status) {
      case 'published':
      case 'ongoing':
        return <CheckCircle className="h-3 w-3" />;
      case 'draft':
      case 'pending':
        return <AlertCircle className="h-3 w-3" />;
      default:
        return null;
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-br from-emerald-50 to-teal-50 border-b">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
                  {title} Management
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Manage your {title.toLowerCase()} content ({filteredItems.length} items)
                </CardDescription>
              </div>
              <Button
                onClick={handleAdd}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New {title.slice(0, -1)}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={`Search ${title.toLowerCase()}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 border-gray-200 focus:border-emerald-500"
                />
              </div>
              <div className="flex gap-2">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[150px] border-gray-200">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {type === "projects" ? (
                      <>
                        <SelectItem value="ongoing">Ongoing</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={(value: "date" | "title") => setSortBy(value)}>
                  <SelectTrigger className="w-[150px] border-gray-200">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isLoading ? (
              <div className="w-full mb-4">
                <Progress value={undefined} className="h-2 bg-gray-200 [&>*]:bg-gradient-to-r [&>*]:from-emerald-500 [&>*]:to-teal-500 [&>*]:animate-shimmer" />
              </div>
            ) : null}

            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader className="bg-gradient-to-r from-gray-50 to-gray-100/50">
                  <TableRow className="hover:bg-transparent border-b-2">
                    <TableHead className="font-semibold text-gray-700">Title</TableHead>
                    <TableHead className="font-semibold text-gray-700">Description</TableHead>
                    <TableHead className="font-semibold text-gray-700">Date</TableHead>
                    <TableHead className="font-semibold text-gray-700">Status</TableHead>
                    {type === "news" && <TableHead className="font-semibold text-gray-700">Author</TableHead>}
                    <TableHead className="text-right font-semibold text-gray-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={type === "news" ? 6 : 5} className="text-center py-16">
                        <div className="flex flex-col items-center gap-4">
                          <p className="text-gray-700 font-medium">No items found</p>
                          <p className="text-sm text-gray-500">
                            {searchTerm || filterStatus !== "all"
                              ? "Try adjusting your search or filter"
                              : `Click "Add New" to create your first ${title.toLowerCase().slice(0, -1)}`}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredItems.map((item) => (
                      <TableRow
                        key={item.id}
                        className="group hover:bg-gradient-to-r hover:from-emerald-50/20 hover:to-teal-50/20 transition-colors duration-200"
                      >
                        <TableCell className="font-semibold">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 flex-shrink-0">
                              <AvatarImage 
                                src={item.image || (item.images && item.images.length > 0 ? item.images[0] : undefined)} 
                                alt={item.title}
                              />
                              <AvatarFallback className="bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-700 font-semibold">
                                {item.title.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-gray-900 group-hover:text-emerald-700 transition-colors">
                              {item.title}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-md truncate">{item.description}</TableCell>
                        <TableCell>
                          {new Date(item.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`${getStatusColor(item.status)}`}>
                            {getStatusIcon(item.status)}
                            {item.status}
                          </Badge>
                        </TableCell>
                        {type === "news" && (
                          <TableCell>{item.author || 'Admin'}</TableCell>
                        )}
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleView(item)}
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
                                  onClick={() => handleEdit(item)}
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
                                  onClick={() => handleDelete(item.id)}
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

              {/* Pagination Controls */}
              {pagination && pagination.pages > 1 && (
                <div className="flex flex-col items-center justify-center gap-4 py-6 border-t mt-4">
                  <div className="flex items-center gap-2">
                    {/* Previous Button */}
                    <Button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      variant="outline"
                      size="sm"
                      className="disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={16} />
                      Previous
                    </Button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                      {(() => {
                        const pages = [];
                        const maxVisiblePages = 5;
                        const totalPages = pagination.pages;
                        
                        if (totalPages <= maxVisiblePages) {
                          for (let i = 1; i <= totalPages; i++) {
                            pages.push(i);
                          }
                        } else {
                          if (currentPage <= 3) {
                            for (let i = 1; i <= 4; i++) {
                              pages.push(i);
                            }
                            pages.push('ellipsis');
                            pages.push(totalPages);
                          } else if (currentPage >= totalPages - 2) {
                            pages.push(1);
                            pages.push('ellipsis');
                            for (let i = totalPages - 3; i <= totalPages; i++) {
                              pages.push(i);
                            }
                          } else {
                            pages.push(1);
                            pages.push('ellipsis');
                            for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                              pages.push(i);
                            }
                            pages.push('ellipsis');
                            pages.push(totalPages);
                          }
                        }
                        
                        return pages.map((page, index) => {
                          if (page === 'ellipsis') {
                            return (
                              <span key={`ellipsis-${index}`} className="px-2 text-gray-500">
                                ...
                              </span>
                            );
                          }
                          return (
                            <Button
                              key={page}
                              onClick={() => setCurrentPage(page as number)}
                              variant={currentPage === page ? "default" : "outline"}
                              size="sm"
                              className={`min-w-[36px] ${
                                currentPage === page
                                  ? "bg-green-600 text-white hover:bg-green-700"
                                  : "hover:bg-green-50"
                              }`}
                            >
                              {page}
                            </Button>
                          );
                        });
                      })()}
                    </div>

                    {/* Next Button */}
                    <Button
                      onClick={() => setCurrentPage(prev => Math.min(pagination.pages, prev + 1))}
                      disabled={currentPage === pagination.pages}
                      variant="outline"
                      size="sm"
                      className="disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                      <ChevronRight size={16} />
                    </Button>
                  </div>

                  {/* Page Info */}
                  <p className="text-sm text-gray-600">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, pagination.total)} of {pagination.total} items
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[600px] bg-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                {editingItem ? "Edit" : "Add New"} {title.slice(0, -1)}
              </DialogTitle>
              <DialogDescription>
                {editingItem ? "Update the details below" : "Fill in the details to create a new item"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-5 py-4 max-h-[60vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-semibold text-gray-700">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter a compelling title"
                    className="border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Date *
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-semibold text-gray-700">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide a detailed description"
                  rows={3}
                  className="border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 resize-none"
                  required
                />
              </div>

              {type === "news" && (
                <div className="space-y-2">
                  <Label htmlFor="content" className="text-sm font-semibold text-gray-700">Content *</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Provide the full content/article text"
                    rows={6}
                    className="border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 resize-none"
                    required
                  />
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="image-upload" className="text-sm font-semibold text-gray-700">
                    {type === "gallery" || type === "news" || type === "projects" ? "Upload Images (Multiple)" : "Upload Image"}
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      multiple={type === "gallery" || type === "news" || type === "projects"}
                      onChange={(e) => {
                        handleImageSelect(e.target.files);
                        // Reset input to allow selecting same file again
                        e.target.value = '';
                      }}
                      disabled={uploadingImages}
                      className="border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 cursor-pointer"
                    />
                    {uploadingImages && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="h-4 w-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                        Uploading...
                      </div>
                    )}
                  </div>
                </div>

                {(imagePreviews.length > 0 || uploadedImageUrls.length > 0) && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {(() => {
                      // Track source array and index for each item
                      type ImageItem = { src: string; sourceIndex: number; isPreview: boolean };
                      const allImageItems: ImageItem[] = [];
                      const maxPreviews = type === "gallery" || type === "news" || type === "projects" ? imagePreviews.length : Math.min(imagePreviews.length, 1);
                      
                      // Add all images from imagePreviews (both blob URLs for new files and regular URLs for existing images)
                      for (let i = 0; i < maxPreviews; i++) {
                        if (imagePreviews[i]) {
                          if (imagePreviews[i].startsWith('blob:')) {
                            // Blob URL = new file being added
                            allImageItems.push({ src: imagePreviews[i], sourceIndex: i, isPreview: true });
                          } else {
                            // Regular URL = existing uploaded image
                            // Find the index in uploadedImageUrls
                            const uploadedIndex = uploadedImageUrls.indexOf(imagePreviews[i]);
                            if (uploadedIndex !== -1) {
                              allImageItems.push({ src: imagePreviews[i], sourceIndex: uploadedIndex, isPreview: false });
                            }
                          }
                        }
                      }
                      
                      // Add any uploaded URLs that aren't already in imagePreviews (shouldn't happen, but safety check)
                      const uploadedToShow = type === "gallery" || type === "news" || type === "projects"
                        ? uploadedImageUrls 
                        : uploadedImageUrls.slice(0, 1);
                      
                      uploadedToShow.forEach((url, idx) => {
                        // Only add if not already shown from imagePreviews
                        const alreadyShown = allImageItems.some(item => item.src === url);
                        if (!alreadyShown) {
                          // Use idx directly when uploadedToShow is the full array (gallery/news/projects)
                          // When it's a slice, calculate the actual index in uploadedImageUrls
                          const actualUploadedIndex = (type === "gallery" || type === "news" || type === "projects")
                            ? idx  // idx is correct when uploadedToShow === uploadedImageUrls
                            : uploadedImageUrls.indexOf(url);  // For slices, find the actual index
                          allImageItems.push({ src: url, sourceIndex: actualUploadedIndex, isPreview: false });
                        }
                      });
                      
                      return allImageItems.map((item, displayIndex) => {
                        return (
                          <div key={`${displayIndex}-${item.src.substring(0, 20)}`} className="relative group">
                            <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-100">
                              <img
                                src={item.src}
                                alt={`Preview ${displayIndex + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                              {uploadingImages && item.isPreview && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                                  <div className="h-8 w-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                </div>
                              )}
                            </div>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => removeImage(item.sourceIndex, item.isPreview)}
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 bg-red-600 hover:bg-red-700"
                              disabled={uploadingImages && item.isPreview}
                            >
                              <Trash2 className="h-4 w-4 text-white" />
                            </Button>
                          </div>
                        );
                      });
                    })()}
                  </div>
                )}
              </div>

              {type === "news" && (
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm font-semibold text-gray-700">Category</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Community, Events, etc."
                    className="border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                  />
                </div>
              )}

              {type === "news" && (
                <div className="space-y-2">
                  <Label htmlFor="author" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Author
                  </Label>
                  <Input
                    id="author"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    placeholder="Author name"
                    className="border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                  />
                </div>
              )}

              {type === "projects" && (
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm font-semibold text-gray-700">Location</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Project location"
                    className="border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-semibold text-gray-700">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => {
                    const defaultStatus = type === "projects" ? "ongoing" : "published";
                    const nextStatus = (value === 'draft' || value === 'published' || value === 'archived' || value === 'ongoing' || value === 'completed' || value === 'pending') 
                      ? value as StatusType
                      : (defaultStatus as StatusType);
                    setFormData({ ...formData, status: nextStatus });
                  }}
                >
                  <SelectTrigger className="border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {type === "projects" ? (
                      <>
                        <SelectItem value="ongoing">Ongoing</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </>
                    )}
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
                    {editingItem ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  editingItem ? "Update" : "Create"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Modal */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-white">
            {viewingItem && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-xl font-semibold">
                    {viewingItem.title}
                  </DialogTitle>
                  <DialogDescription>
                    {viewingItem.description}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  {(viewingItem.images && viewingItem.images.length > 0) || viewingItem.image ? (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <Eye className="h-5 w-5 text-emerald-600" />
                        Images
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(viewingItem.images && viewingItem.images.length > 0
                          ? viewingItem.images
                          : viewingItem.image
                          ? [viewingItem.image]
                          : []
                        ).map((imgUrl, idx) => (
                          <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border-2 border-gray-200">
                            <img
                              src={imgUrl}
                              alt={`${viewingItem.title} - Image ${idx + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder-image.png';
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {type === "news" && viewingItem.content && (
                    <div className="space-y-2 pt-4 border-t border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-800">Content</h3>
                      <p className="text-gray-700 whitespace-pre-wrap">{viewingItem.content}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar className="h-4 w-4 text-emerald-600" />
                        <span className="font-medium">Date:</span>
                        <span>{new Date(viewingItem.date).toLocaleDateString('en-US', { 
                          month: 'long', 
                          day: 'numeric',
                          year: 'numeric'
                        })}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Badge variant="outline" className={`${getStatusColor(viewingItem.status)}`}>
                          {getStatusIcon(viewingItem.status)}
                          {viewingItem.status}
                        </Badge>
                      </div>
                      {type === "news" && viewingItem.author && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <User className="h-4 w-4 text-emerald-600" />
                          <span className="font-medium">Author:</span>
                          <span>{viewingItem.author}</span>
                        </div>
                      )}
                      {viewingItem.category && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <span className="font-medium">{type === "news" ? "Category" : "Location"}:</span>
                          <span>{viewingItem.category}</span>
                        </div>
                      )}
                      {type === "projects" && viewingItem.progress !== undefined && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <span className="font-medium">Progress:</span>
                          <span>{viewingItem.progress}%</span>
                        </div>
                      )}
                    </div>
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
                      handleEdit(viewingItem);
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
              <AlertDialogAction onClick={() => setIsAlertDialogOpen(false)}>OK</AlertDialogAction>
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
                Are you sure you want to delete this item? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => {
                  setDeleteItemId(null);
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
  );
};

export default ContentManager;

