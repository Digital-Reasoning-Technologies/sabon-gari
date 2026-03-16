"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
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
  Newspaper,
  Images,
  FolderKanban,
  Plus,
  Pencil,
  Trash2,
  Activity,
  TrendingUp,
  Sparkles,
  Eye,
  Search,
  Filter,
  Calendar,
  User,
  CheckCircle,
  AlertCircle,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

type ContentType = "dashboard" | "news" | "gallery" | "projects";

type StatusType = "draft" | "published" | "archived" | "ongoing" | "completed" | "pending";

interface ContentItem {
  id: string;
  slug?: string; // For News items
  title: string;
  description: string;
  content?: string; // For News items
  date: string;
  createdAt?: string; // For sorting by creation date
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

type OverviewData = {
  stats: {
    newsTotal: number;
    galleryTotal: number;
    projectsTotal: number;
  };
  recentHighlights: Array<{
    type: ContentType | 'gallery' | 'news' | 'projects';
    id: string;
    title: string;
    description: string;
    date: string | null;
    status: string | null;
  }>;
};

interface DashboardPageContentProps {
  activeTab: ContentType;
  tabConfig: Array<{
    id: string;
    label: string;
    icon: React.ComponentType<any>;
    color?: string;
  }>;
}

const DashboardPageContent = ({
  activeTab,
  tabConfig,
}: DashboardPageContentProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [alertMessage, setAlertMessage] = useState<string>("");

  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [viewingItem, setViewingItem] = useState<ContentItem | null>(null);
  const [isVisible, setIsVisible] = useState(false);
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

  const [newsItems, setNewsItems] = useState<ContentItem[]>([]);
  const [galleryItems, setGalleryItems] = useState<ContentItem[]>([]);
  const [projectItems, setProjectItems] = useState<ContentItem[]>([]);

  useEffect(() => {
    setIsVisible(false);
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, [activeTab]);

  // Reset to page 1 when tab changes
  useEffect(() => {
    setCurrentPage(1);
    setPagination(null);
    setLastLoadedPagination(null);
  }, [activeTab]);

  // Reset to page 1 when search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [loadedTabs, setLoadedTabs] = useState<Record<ContentType, boolean>>({
    dashboard: false,
    news: false,
    gallery: false,
    projects: false,
  });
  const [lastLoadedPagination, setLastLoadedPagination] = useState<{
    tab: ContentType;
    page: number;
    limit: number;
  } | null>(null);
  const [loadingTab, setLoadingTab] = useState<ContentType | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!loadError) return;
    toast({
      variant: 'destructive',
      title: 'Request failed',
      description: loadError,
    });
  }, [loadError, toast]);

  const normalizeStatus = useCallback((value: unknown): StatusType | undefined => {
    const v = typeof value === 'string' ? value : '';
    switch (v) {
      case 'draft':
      case 'published':
      case 'archived':
      case 'ongoing':
      case 'completed':
      case 'pending':
        return v as StatusType;
      default:
        return undefined;
    }
  }, []);

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

  // API Helper Functions
  const createItem = useCallback(async (data: any): Promise<any> => {
    const endpoint = activeTab === 'news' 
      ? '/api/dashboard/news'
      : activeTab === 'gallery'
      ? '/api/dashboard/gallery'
      : '/api/dashboard/projects';
    
    // Convert data to FormData (API endpoints expect FormData, not JSON)
    const formDataToSend = new FormData();
    formDataToSend.append('title', data.title || '');
    formDataToSend.append('description', data.description || '');
    formDataToSend.append('date', data.date || '');
    
    if (activeTab === 'news') {
      formDataToSend.append('content', data.content || '');
      if (data.images && Array.isArray(data.images)) {
        data.images.forEach((url: string) => {
          formDataToSend.append('images[]', url);
        });
      }
      if (data.location) {
        formDataToSend.append('location', data.location);
      }
    } else if (activeTab === 'gallery') {
      if (data.images && Array.isArray(data.images)) {
        data.images.forEach((url: string) => {
          formDataToSend.append('images[]', url);
        });
      }
      if (data.image) {
        formDataToSend.append('image', data.image);
      }
    } else if (activeTab === 'projects') {
      if (data.image) {
        formDataToSend.append('image', data.image);
      }
      if (data.images && Array.isArray(data.images)) {
        data.images.forEach((url: string) => {
          formDataToSend.append('images[]', url);
        });
      }
      if (data.status) {
        formDataToSend.append('status', data.status);
      }
      if (data.location) {
        formDataToSend.append('location', data.location);
      }
    }
    
    const res = await fetch(endpoint, {
      method: 'POST',
      body: formDataToSend,
    });
    
    const json = await res.json();
    
    // Check for authentication errors (401)
    if (res.status === 401 || (json.ok === false && ((json as any).code === 'INVALID_TOKEN' || (json as any).code === 'NO_TOKEN'))) {
      const { logoutUser } = await import('@/lib/auth-utils');
      await logoutUser();
      throw new Error('Session expired. Please login again.');
    }
    
    if (!res.ok || json.ok === false) {
      throw new Error(json.message || `Failed to create ${activeTab} item`);
    }
    
    return json.data;
  }, [activeTab]);

  const updateItem = useCallback(async (idOrSlug: string, data: any): Promise<any> => {
    let endpoint: string;
    
    if (activeTab === 'news') {
      endpoint = `/api/dashboard/news/${idOrSlug}`;
    } else if (activeTab === 'gallery') {
      endpoint = `/api/dashboard/gallery/${idOrSlug}`;
    } else {
      endpoint = `/api/dashboard/projects/${idOrSlug}`;
    }
    
    // Convert data to FormData (API endpoints expect FormData, not JSON)
    const formDataToSend = new FormData();
    formDataToSend.append('title', data.title || '');
    formDataToSend.append('description', data.description || '');
    formDataToSend.append('date', data.date || '');
    
    if (activeTab === 'news') {
      formDataToSend.append('content', data.content || '');
      if (data.images && Array.isArray(data.images)) {
        data.images.forEach((url: string) => {
          formDataToSend.append('images[]', url);
        });
      }
      if (data.location) {
        formDataToSend.append('location', data.location);
      }
    } else if (activeTab === 'gallery') {
      if (data.images && Array.isArray(data.images)) {
        data.images.forEach((url: string) => {
          formDataToSend.append('images[]', url);
        });
      }
      if (data.image) {
        formDataToSend.append('image', data.image);
      }
    } else if (activeTab === 'projects') {
      if (data.image) {
        formDataToSend.append('image', data.image);
      }
      if (data.images && Array.isArray(data.images)) {
        data.images.forEach((url: string) => {
          formDataToSend.append('images[]', url);
        });
      }
      if (data.status) {
        formDataToSend.append('status', data.status);
      }
      if (data.location) {
        formDataToSend.append('location', data.location);
      }
    }
    
    const res = await fetch(endpoint, {
      method: 'PUT',
      body: formDataToSend,
    });
    
    const json = await res.json();
    
    // Check for authentication errors (401)
    if (res.status === 401 || (json.ok === false && ((json as any).code === 'INVALID_TOKEN' || (json as any).code === 'NO_TOKEN'))) {
      const { logoutUser } = await import('@/lib/auth-utils');
      await logoutUser();
      throw new Error('Session expired. Please login again.');
    }
    
    if (!res.ok || json.ok === false) {
      throw new Error(json.message || `Failed to update ${activeTab} item`);
    }
    
    return json.data;
  }, [activeTab]);

  const deleteItem = useCallback(async (idOrSlug: string): Promise<void> => {
    let endpoint: string;
    
    if (activeTab === 'news') {
      endpoint = `/api/dashboard/news/${idOrSlug}`;
    } else if (activeTab === 'gallery') {
      endpoint = `/api/dashboard/gallery/${idOrSlug}`;
    } else {
      endpoint = `/api/dashboard/projects/${idOrSlug}`;
    }
    
    const res = await fetch(endpoint, {
      method: 'DELETE',
    });
    
    const json = await res.json();
    
    // Check for authentication errors (401)
    if (res.status === 401 || (json.ok === false && ((json as any).code === 'INVALID_TOKEN' || (json as any).code === 'NO_TOKEN'))) {
      const { logoutUser } = await import('@/lib/auth-utils');
      await logoutUser();
      throw new Error('Session expired. Please login again.');
    }
    
    if (!res.ok || json.ok === false) {
      throw new Error(json.message || `Failed to delete ${activeTab} item`);
    }
  }, [activeTab]);

  const refreshData = useCallback(async () => {
    // Reset loaded state to force reload
    setLoadedTabs((prev) => ({ ...prev, [activeTab]: false }));
    
    // Trigger reload
    try {
      setLoadError(null);
      setLoadingTab(activeTab);

      if (activeTab === 'dashboard') {
        const json = await fetchJson<OverviewData>('/api/dashboard/overview');
        setOverview(json.data ?? null);
        setLoadedTabs((prev) => ({ ...prev, dashboard: true }));
        setLastLoadedPagination({ tab: 'dashboard', page: currentPage, limit: itemsPerPage });
        return;
      }

      if (activeTab === 'news') {
        const json = await fetchJson<any[]>(`/api/dashboard/news?page=${currentPage}&limit=${itemsPerPage}`);
        if (json.pagination) {
          setPagination(json.pagination);
        }
        const mapped: ContentItem[] = (json.data ?? []).map((n: any) => ({
          id: n._id?.toString?.() ?? String(n._id),
          slug: n.slug,
          title: n.title,
          description: n.description,
          content: n.content,
          date: n.date ?? new Date().toISOString().slice(0, 10),
          createdAt: n.createdAt,
          image: Array.isArray(n.images) ? n.images[0] : n.image,
          images: Array.isArray(n.images) ? n.images : (n.image ? [n.image] : []),
          status: 'published',
          views: 0,
          author: 'Admin',
          category: n.location,
        }));
        setNewsItems(mapped);
        setLoadedTabs((prev) => ({ ...prev, news: true }));
        setLastLoadedPagination({ tab: 'news', page: currentPage, limit: itemsPerPage });
        return;
      }

      if (activeTab === 'gallery') {
        const json = await fetchJson<any[]>(`/api/dashboard/gallery?page=${currentPage}&limit=${itemsPerPage}`);
        if (json.pagination) {
          setPagination(json.pagination);
        }
        const mapped: ContentItem[] = (json.data ?? []).map((g: any) => ({
          id: g._id?.toString?.() ?? String(g._id),
          title: g.title,
          description: g.description,
          date: g.date ?? new Date().toISOString().slice(0, 10),
          createdAt: g.createdAt,
          image: g.image ?? (Array.isArray(g.images) ? g.images[0] : undefined),
          images: Array.isArray(g.images) ? g.images : (g.image ? [g.image] : []),
          status: 'published',
          views: 0,
          category: 'Gallery',
        }));
        setGalleryItems(mapped);
        setLoadedTabs((prev) => ({ ...prev, gallery: true }));
        setLastLoadedPagination({ tab: 'gallery', page: currentPage, limit: itemsPerPage });
        return;
      }

      if (activeTab === 'projects') {
        const json = await fetchJson<any[]>(`/api/dashboard/projects?page=${currentPage}&limit=${itemsPerPage}`);
        if (json.pagination) {
          setPagination(json.pagination);
        }
        const mapped: ContentItem[] = (json.data ?? []).map((p: any) => ({
          id: p._id?.toString?.() ?? String(p._id),
          title: p.title,
          description: p.description,
          date: p.date ?? new Date().toISOString().slice(0, 10),
          createdAt: p.createdAt,
          image: p.image,
          images: p.images || [],
          status: p.status ?? 'pending',
          progress: 0,
        }));
        setProjectItems(mapped);
        setLoadedTabs((prev) => ({ ...prev, projects: true }));
        setLastLoadedPagination({ tab: 'projects', page: currentPage, limit: itemsPerPage });
        return;
      }
    } catch (e: any) {
      setLoadError(e?.message ?? 'Failed to load data');
    } finally {
      setLoadingTab(null);
    }
  }, [activeTab, fetchJson, currentPage, itemsPerPage]);

  useEffect(() => {
    let cancelled = false;

    async function loadTab() {
      // Only skip loading if tab is loaded AND pagination hasn't changed
      const paginationChanged = !lastLoadedPagination || 
        lastLoadedPagination.tab !== activeTab ||
        lastLoadedPagination.page !== currentPage ||
        lastLoadedPagination.limit !== itemsPerPage;
      
      if (loadedTabs[activeTab] && !paginationChanged) return;

      try {
        setLoadError(null);
        setLoadingTab(activeTab);

        if (activeTab === 'dashboard') {
          const json = await fetchJson<OverviewData>('/api/dashboard/overview');
          if (cancelled) return;
          setOverview(json.data ?? null);
          setLoadedTabs((prev) => ({ ...prev, dashboard: true }));
          setLastLoadedPagination({ tab: 'dashboard', page: currentPage, limit: itemsPerPage });
          return;
        }

        if (activeTab === 'news') {
          const json = await fetchJson<any[]>(`/api/dashboard/news?page=${currentPage}&limit=${itemsPerPage}`);
          if (cancelled) return;
          if (json.pagination) {
            setPagination(json.pagination);
          }
          const mapped: ContentItem[] = (json.data ?? []).map((n: any) => ({
            id: n._id?.toString?.() ?? String(n._id),
            slug: n.slug,
            title: n.title,
            description: n.description,
            content: n.content,
            date: n.date ?? new Date().toISOString().slice(0, 10),
            createdAt: n.createdAt,
            image: Array.isArray(n.images) ? n.images[0] : n.image,
            images: Array.isArray(n.images) ? n.images : (n.image ? [n.image] : []),
            status: 'published',
            views: 0,
            author: 'Admin',
            category: n.location,
          }));
          setNewsItems(mapped);
          setLoadedTabs((prev) => ({ ...prev, news: true }));
          setLastLoadedPagination({ tab: 'news', page: currentPage, limit: itemsPerPage });
          return;
        }

        if (activeTab === 'gallery') {
          const json = await fetchJson<any[]>(`/api/dashboard/gallery?page=${currentPage}&limit=${itemsPerPage}`);
          if (cancelled) return;
          if (json.pagination) {
            setPagination(json.pagination);
          }
          const mapped: ContentItem[] = (json.data ?? []).map((g: any) => ({
            id: g._id?.toString?.() ?? String(g._id),
            title: g.title,
            description: g.description,
            date: g.date ?? new Date().toISOString().slice(0, 10),
            createdAt: g.createdAt,
            image: g.image ?? (Array.isArray(g.images) ? g.images[0] : undefined),
            images: Array.isArray(g.images) ? g.images : (g.image ? [g.image] : []),
            status: 'published',
            views: 0,
            category: 'Gallery',
          }));
          setGalleryItems(mapped);
          setLoadedTabs((prev) => ({ ...prev, gallery: true }));
          setLastLoadedPagination({ tab: 'gallery', page: currentPage, limit: itemsPerPage });
          return;
        }

        if (activeTab === 'projects') {
          const json = await fetchJson<any[]>(`/api/dashboard/projects?page=${currentPage}&limit=${itemsPerPage}`);
          if (cancelled) return;
          if (json.pagination) {
            setPagination(json.pagination);
          }
          const mapped: ContentItem[] = (json.data ?? []).map((p: any) => ({
            id: p._id?.toString?.() ?? String(p._id),
            title: p.title,
            description: p.description,
            date: p.date ?? new Date().toISOString().slice(0, 10),
            createdAt: p.createdAt,
            image: p.image,
            images: p.images || [],
            status: p.status ?? 'pending',
            progress: 0,
          }));
          setProjectItems(mapped);
          setLoadedTabs((prev) => ({ ...prev, projects: true }));
          setLastLoadedPagination({ tab: 'projects', page: currentPage, limit: itemsPerPage });
          return;
        }
      } catch (e: any) {
        if (cancelled) return;
        setLoadError(e?.message ?? 'Failed to load data');
      } finally {
        if (cancelled) return;
        setLoadingTab(null);
      }
    }

    loadTab();

    return () => {
      cancelled = true;
    };
  }, [activeTab, fetchJson, loadedTabs, currentPage, itemsPerPage, lastLoadedPagination]);

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
    status: "published",
    category: "",
    author: "",
  });

  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]); // Store selected files for later upload
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const getCurrentItems = useCallback(() => {
    switch (activeTab) {
      case "news":
        return newsItems;
      case "gallery":
        return galleryItems;
      case "projects":
        return projectItems;
      default:
        return [];
    }
  }, [activeTab, newsItems, galleryItems, projectItems]);

  const setCurrentItems = useCallback((items: ContentItem[]) => {
    switch (activeTab) {
      case "news":
        setNewsItems(items);
        break;
      case "gallery":
        setGalleryItems(items);
        break;
      case "projects":
        setProjectItems(items);
        break;
    }
  }, [activeTab]);

  const filteredItems = useMemo(() => {
    const items = getCurrentItems();

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
          // Prioritize createdAt if available (newest first), otherwise use date field
          const aTime = a.createdAt 
            ? new Date(a.createdAt).getTime() 
            : new Date(a.date).getTime();
          const bTime = b.createdAt 
            ? new Date(b.createdAt).getTime() 
            : new Date(b.date).getTime();
          return bTime - aTime; // Newest first
        }
        return a.title.localeCompare(b.title);
      });
  }, [getCurrentItems, searchTerm, filterStatus, sortBy]);

  const handleAdd = () => {
    setEditingItem(null);
    const defaultStatus = activeTab === "projects" ? "ongoing" : "published";
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
    const defaultStatus = activeTab === "projects" ? "ongoing" : "published";
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
    setSelectedFiles([]); // Clear selected files when editing
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteItemId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteItemId) {
      setIsDeleteDialogOpen(false);
      return;
    }

    setIsDeleting(true);

    try {
      // Find the item to get the correct identifier
      const currentItems = getCurrentItems();
      const itemToDelete = currentItems.find((item) => item.id === deleteItemId);
      
      if (!itemToDelete) {
        throw new Error('Item not found');
      }

      // Use slug for News, id for Gallery/Projects
      const identifier = activeTab === 'news' 
        ? itemToDelete.slug 
        : itemToDelete.id;

      if (!identifier) {
        throw new Error('Unable to identify item for deletion');
      }

      await deleteItem(identifier);
      
      toast({ 
        variant: 'success', 
        title: 'Deleted', 
        description: `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} item deleted successfully.` 
      });

      setDeleteItemId(null);
      setIsDeleteDialogOpen(false);

      // Refresh data from server
      await refreshData();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Delete failed',
        description: error.message || `Failed to delete ${activeTab} item`,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleView = (item: ContentItem) => {
    setViewingItem(item);
    setIsViewModalOpen(true);
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
    const folder = activeTab === 'gallery' ? 'kudan/gallery' : activeTab === 'news' ? 'kudan/news' : 'kudan/projects';
    
    // Add all files to formData with correct field name
    validFiles.forEach((file) => {
      formData.append('file', file, file.name);
    });
    formData.append('folder', folder);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header - browser will set it automatically with boundary
    });

    const result = await response.json();

    // Check for authentication errors (401)
    if (response.status === 401 || (result.ok === false && ((result as any).code === 'INVALID_TOKEN' || (result as any).code === 'NO_TOKEN'))) {
      const { logoutUser } = await import('@/lib/auth-utils');
      await logoutUser();
      throw new Error('Session expired. Please login again.');
    }

    if (!result.ok) {
      throw new Error(result.message || 'Upload failed');
    }

    // Handle single or multiple uploads - parse response correctly
    let urls: string[] = [];
    if (result.data?.url) {
      // Single file response
      urls = [result.data.url];
    } else if (result.data?.items && Array.isArray(result.data.items)) {
      // Multiple files response
      urls = result.data.items.map((item: any) => item.url);
    } else if (result.data?.urls && Array.isArray(result.data.urls)) {
      // Fallback for urls array
      urls = result.data.urls;
    }

    if (urls.length === 0) {
      throw new Error('No image URLs returned from server');
    }

    return urls;
  };

  const removeImage = (sourceIndex: number, isPreview: boolean) => {
    if (activeTab === 'gallery' || activeTab === 'news') {
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
    // Validation
    if (!formData.title.trim() || !formData.description.trim()) {
      setAlertMessage("Title and description are required!");
      setIsAlertDialogOpen(true);
      return;
    }

    // News requires content field
    if (activeTab === 'news' && !formData.content.trim()) {
      setAlertMessage("Content is required for news items!");
      setIsAlertDialogOpen(true);
      return;
    }

    // Check if images are selected (either uploaded or selected files waiting to be uploaded)
    const hasImages = selectedFiles.length > 0 || uploadedImageUrls.length > 0 || formData.images.length > 0 || formData.image;

    // Gallery and Projects require at least one image
    if (activeTab === 'gallery' && !hasImages) {
      setAlertMessage("At least one image is required for gallery items! Please select an image first.");
      setIsAlertDialogOpen(true);
      return;
    }

    if (activeTab === 'news' && !hasImages) {
      setAlertMessage("At least one image is required for news items! Please select an image first.");
      setIsAlertDialogOpen(true);
      return;
    }

    if (activeTab === 'projects' && !hasImages) {
      setAlertMessage("An image is required for projects! Please select an image first.");
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
          fetch('http://127.0.0.1:7243/ingest/5ae3dc11-cd75-4fff-a2a4-798b349edd4c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DashboardPageContent.tsx:1048',message:'Image upload response',data:{newUploadedUrls,uploadedImageUrlsBefore:uploadedImageUrls,isEditing:!!editingItem},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
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

      // Map form data to API format
      let apiData: any;

      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/5ae3dc11-cd75-4fff-a2a4-798b349edd4c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DashboardPageContent.tsx:1075',message:'Image arrangement - before combine',data:{uploadedImageUrls,newUploadedUrls,formDataImages:formData.images,formDataImage:formData.image,isEditing:!!editingItem},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
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
      fetch('http://127.0.0.1:7243/ingest/5ae3dc11-cd75-4fff-a2a4-798b349edd4c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DashboardPageContent.tsx:1090',message:'Image arrangement - after combine',data:{allImageUrls,imagesToSend,isEditing:!!editingItem},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion

      if (activeTab === 'news') {
        apiData = {
          title: formData.title.trim(),
          description: formData.description.trim(),
          content: formData.content.trim(),
          images: imagesToSend,
          date: formData.date,
          location: formData.category || undefined,
          time: undefined, // Can be added later if needed
        };
      } else if (activeTab === 'gallery') {
        apiData = {
          title: formData.title.trim(),
          description: formData.description.trim(),
          images: imagesToSend,
          image: imagesToSend[0] || '',
          date: formData.date || undefined,
        };
      } else {
        // Projects
        apiData = {
          title: formData.title.trim(),
          description: formData.description.trim(),
          image: imagesToSend[0] || formData.image || '',
          images: imagesToSend,
          status: formData.status,
          location: formData.category || undefined,
          date: formData.date || undefined,
        };
      }

      let result: any;

      if (editingItem) {
        // Update existing item
        const identifier = activeTab === 'news' 
          ? editingItem.slug 
          : editingItem.id;
        
        if (!identifier) {
          throw new Error('Unable to identify item for update');
        }

        result = await updateItem(identifier, apiData);
        toast({ 
          variant: 'success', 
          title: 'Updated', 
          description: `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} item updated successfully.` 
        });
      } else {
        // Create new item
        result = await createItem(apiData);
        toast({ 
          variant: 'success', 
          title: 'Created', 
          description: `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} item created successfully.` 
        });
      }

      // Clean up preview URLs
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

      // Refresh data from server
      await refreshData();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: editingItem ? 'Update failed' : 'Create failed',
        description: error.message || `Failed to ${editingItem ? 'update' : 'create'} ${activeTab} item`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  const statsCards = [
    {
      title: "Total News",
      value: overview?.stats.newsTotal ?? newsItems.length,
      change: overview?.stats
        ? `${overview.stats.newsTotal} total`
        : `${newsItems.filter(n => n.status === 'published').length} published`,
      icon: Newspaper,
      gradient: "from-emerald-500 to-teal-600",
      bgGradient: "from-emerald-50 to-teal-50",
      trend: "+12%",
    },
    {
      title: "Total Gallery",
      value: overview?.stats.galleryTotal ?? galleryItems.length,
      change: overview?.stats
        ? `${overview.stats.galleryTotal} total`
        : `${galleryItems.reduce((acc, item) => acc + (item.views || 0), 0).toLocaleString()} total views`,
      icon: Images,
      gradient: "from-blue-500 to-cyan-600",
      bgGradient: "from-blue-50 to-cyan-50",
      trend: "+8%",
    },
    {
      title: "Total Projects",
      value: overview?.stats.projectsTotal ?? projectItems.filter(p => p.status === 'ongoing').length,
      change: overview?.stats
        ? `${overview.stats.projectsTotal} total projects`
        : `${projectItems.length} total projects`,
      icon: Activity,
      gradient: "from-violet-500 to-purple-600",
      bgGradient: "from-violet-50 to-purple-50",
      trend: "+3",
    }
    ];

  const getStatusColor = (status?: StatusType) => {
    switch (status) {
      case "published":
      case "ongoing":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "draft":
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "archived":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status?: StatusType) => {
    switch (status) {
      case "published":
      case "ongoing":
      case "completed":
        return <CheckCircle className="h-3 w-3 mr-1" />;
      case "draft":
      case "pending":
        return <AlertCircle className="h-3 w-3 mr-1" />;
      default:
        return null;
    }
  };

  return (
    <TooltipProvider>
      <div className={`transition-all duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        {loadingTab === activeTab ? (
          <div className="w-full mb-4">
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <div 
                className="absolute h-full w-1/3 bg-green-600 animate-shimmer"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(22, 163, 74, 0.8), transparent)',
                }}
              />
            </div>
          </div>
        ) : null}
        {loadError ? (
          <div className="text-sm text-red-600">{loadError}</div>
        ) : null}
        {activeTab === "dashboard" ? (
          <div className="space-y-8">
            {/* Enhanced Stats Grid with Animation */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {statsCards.map((stat, index) => (
                <Card
                  key={stat.title}
                  className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group animate-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-30`}></div>
                  <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-semibold text-gray-700">
                      {stat.title}
                    </CardTitle>
                    <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                      <stat.icon className="h-5 w-5 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent className="relative">
                    <div className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      {stat.value}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-gray-600 flex items-center gap-1">
                        {stat.change}
                      </p>
                      <Badge variant="secondary" className="text-xs bg-emerald-50 text-emerald-700">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {stat.trend}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Actions Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-0 shadow-lg animate-in" style={{ animationDelay: '400ms' }}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-emerald-600" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full justify-start" 
                    variant="outline" 
                    onClick={() => router.push('/admin/news')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add News Content
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline" 
                    onClick={() => router.push('/admin/gallery')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add new image
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline" 
                    onClick={() => router.push('/admin/projects')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add new project
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Highlights */}
              <Card className="md:col-span-2 border-0 shadow-lg animate-in" style={{ animationDelay: '500ms' }}>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Activity className="h-5 w-5 text-emerald-600" />
                    Recent Highlights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(overview?.recentHighlights?.length
                      ? overview.recentHighlights.map((item) => ({
                          id: item.id,
                          title: item.title,
                          description: item.description,
                          date: item.date ?? new Date().toISOString().slice(0, 10),
                          status: normalizeStatus(item.status) ?? 'published',
                        }))
                      : [...newsItems, ...galleryItems, ...projectItems]
                          .sort((a, b) => {
                            // Prioritize createdAt if available (newest first), otherwise use date field
                            const aTime = a.createdAt 
                              ? new Date(a.createdAt).getTime() 
                              : new Date(a.date).getTime();
                            const bTime = b.createdAt 
                              ? new Date(b.createdAt).getTime() 
                              : new Date(b.date).getTime();
                            return bTime - aTime; // Newest first
                          })
                          .slice(0, 3)
                    ).map((item) => (
                        <div key={item.id} className="flex items-center p-3 rounded-lg bg-gradient-to-r from-gray-50 to-white hover:from-emerald-50/50 hover:to-teal-50/50 transition-all duration-300 border border-gray-100">
                          <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm">
                            {item.title.charAt(0)}
                          </div>
                          <div className="ml-3 flex-1">
                            <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                            <p className="text-xs text-gray-600 truncate">{item.description}</p>
                          </div>
                          <Badge variant="outline" className="ml-2">
                            {item.status}
                          </Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Enhanced Header with Search and Filters */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-br from-emerald-50 to-teal-50 border-b">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
                      {tabConfig.find((t) => t.id === activeTab)?.label} Management
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      Manage your {activeTab} content ({filteredItems.length} items)
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handleAdd}
                      className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add New
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
                      placeholder="Search items..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 border-gray-200 focus:border-emerald-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-[150px] border-gray-200">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        {activeTab === "projects" ? (
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
                        <SelectItem value="date">Newest First</SelectItem>
                        <SelectItem value="title">Alphabetical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Content Table */}
                <div className="rounded-lg border border-gray-200 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-gradient-to-r from-gray-50 to-gray-100/50">
                      <TableRow className="hover:bg-transparent border-b-2">
                        <TableHead className="font-semibold text-gray-700">Title</TableHead>
                        <TableHead className="font-semibold text-gray-700">Description</TableHead>
                        <TableHead className="font-semibold text-gray-700">Date</TableHead>
                        <TableHead className="font-semibold text-gray-700">Status</TableHead>
                        {activeTab === "news" && <TableHead className="font-semibold text-gray-700">Views</TableHead>}
                        {activeTab === "news" && <TableHead className="font-semibold text-gray-700">Author</TableHead>}
                        <TableHead className="text-right font-semibold text-gray-700">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredItems.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={activeTab === "news" ? 7 : 5}
                            className="text-center py-16"
                          >
                            <div className="flex flex-col items-center gap-4">
                              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                <FolderKanban className="h-10 w-10 text-gray-400" />
                              </div>
                              <div>
                                <p className="text-gray-700 font-medium">No items found</p>
                                <p className="text-sm text-gray-500 mt-1">
                                  {searchTerm || filterStatus !== "all" 
                                    ? "Try adjusting your search or filter" 
                                    : 'Click "Add New" to create your first item'}
                                </p>
                              </div>
                              {(searchTerm || filterStatus !== "all") && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSearchTerm("");
                                    setFilterStatus("all");
                                  }}
                                >
                                  Clear filters
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredItems.map((item, index) => (
                          <TableRow 
                            key={item.id} 
                            className="group hover:bg-gradient-to-r hover:from-emerald-50/20 hover:to-teal-50/20 transition-colors duration-200"
                          >
                            <TableCell className="font-semibold">
                              <Tooltip>
                                <TooltipTrigger asChild>
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
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="max-w-xs">{item.description}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TableCell>
                            <TableCell className="max-w-xs">
                              <div className="line-clamp-2 text-gray-600">{item.description}</div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2 text-gray-600">
                                <Calendar className="h-4 w-4" />
                                <span>{new Date(item.date).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric',
                                  year: 'numeric'
                                })}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant="outline" 
                                className={`flex items-center w-fit ${getStatusColor(item.status)}`}
                              >
                                {getStatusIcon(item.status)}
                                {item.status}
                              </Badge>
                            </TableCell>
                            {activeTab === "news" && (
                              <>
                                <TableCell>
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <Eye className="h-4 w-4" />
                                    <span>{item.views?.toLocaleString() || 0}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <User className="h-4 w-4" />
                                    <span>{item.author || "Unknown"}</span>
                                  </div>
                                </TableCell>
                              </>
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
          </div>
        )}

        {/* Enhanced Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[600px] bg-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                {editingItem ? "Edit" : "Add New"} {activeTab.slice(0, 1).toUpperCase() + activeTab.slice(1)}
              </DialogTitle>
              <DialogDescription>
                {editingItem ? "Update the details below" : "Fill in the details to create a new item"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-5 py-4 max-h-[60vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    Title *
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
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
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
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
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Provide a detailed description"
                  rows={3}
                  className="border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 resize-none"
                  required
                />
              </div>

              {activeTab === "news" && (
                <div className="space-y-2">
                  <Label htmlFor="content" className="text-sm font-semibold text-gray-700">Content *</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    placeholder="Provide the full content/article text"
                    rows={6}
                    className="border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 resize-none"
                    required
                  />
                </div>
              )}

              {/* Image Upload Section */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="image-upload" className="text-sm font-semibold text-gray-700">
                    {activeTab === "gallery" || activeTab === "news" || activeTab === "projects" ? "Upload Images (Multiple)" : "Upload Image"}
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      multiple={activeTab === "gallery" || activeTab === "news" || activeTab === "projects"}
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

                {/* Image Previews */}
                {(imagePreviews.length > 0 || uploadedImageUrls.length > 0) && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {(() => {
                      // Show previews first (blob URLs), then uploaded URLs
                      // Track source array and index for each item to correctly map removal
                      type ImageItem = { src: string; sourceIndex: number; isPreview: boolean };
                      const allImages: ImageItem[] = [];
                      const maxPreviews = activeTab === "gallery" || activeTab === "news" || activeTab === "projects" ? imagePreviews.length : Math.min(imagePreviews.length, 1);
                      
                      // Add preview images (blob URLs) - these are new files, map to imagePreviews and selectedFiles indices
                      for (let i = 0; i < maxPreviews; i++) {
                        if (imagePreviews[i] && imagePreviews[i].startsWith('blob:')) {
                          allImages.push({ src: imagePreviews[i], sourceIndex: i, isPreview: true });
                        }
                      }
                      
                      // Add uploaded URLs - only show those that aren't already shown as previews
                      const uploadedToShow = activeTab === "gallery" || activeTab === "news" || activeTab === "projects"
                        ? uploadedImageUrls 
                        : uploadedImageUrls.slice(0, 1);
                      
                      uploadedToShow.forEach((url, idx) => {
                        // Check if this URL is already shown as a blob preview (new file being added)
                        // If it's a non-blob URL in imagePreviews, it's an existing uploaded URL, so show it from uploadedImageUrls
                        const isBlobPreview = imagePreviews.some((preview, i) => 
                          i < maxPreviews && preview === url && preview.startsWith('blob:')
                        );
                        if (!isBlobPreview) {
                          // Use idx directly when uploadedToShow is the full array (gallery/news/projects)
                          // When it's a slice, calculate the actual index in uploadedImageUrls
                          const actualUploadedIndex = (activeTab === "gallery" || activeTab === "news" || activeTab === "projects")
                            ? idx  // idx is correct when uploadedToShow === uploadedImageUrls
                            : uploadedImageUrls.indexOf(url);  // For slices, find the actual index
                          if (actualUploadedIndex !== -1) {
                            allImages.push({ src: url, sourceIndex: actualUploadedIndex, isPreview: false });
                          }
                        }
                      });
                      
                      return allImages.map((item, displayIndex) => {
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
                              onClick={() => {
                                removeImage(item.sourceIndex, item.isPreview);
                              }}
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

              {activeTab !== "projects" && (
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm font-semibold text-gray-700">Category</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    placeholder="e.g., Community, Events, etc."
                    className="border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                  />
                </div>
              )}

              {activeTab === "projects" && (
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-sm font-semibold text-gray-700">Location</Label>
                  <Input
                    id="location"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    placeholder="Project location"
                    className="border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                  />
                </div>
              )}

              {activeTab === "news" && (
                <div className="space-y-2">
                  <Label htmlFor="author" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Author
                  </Label>
                  <Input
                    id="author"
                    value={formData.author}
                    onChange={(e) =>
                      setFormData({ ...formData, author: e.target.value })
                    }
                    placeholder="Author name"
                    className="border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-semibold text-gray-700">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => {
                    const defaultStatus = activeTab === "projects" ? "ongoing" : "published";
                    const nextStatus = normalizeStatus(value) ?? (defaultStatus as StatusType);
                    setFormData({ ...formData, status: nextStatus });
                  }}
                >
                  <SelectTrigger className="border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeTab === "projects" ? (
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
                  {/* Images Section */}
                  {(viewingItem.images && viewingItem.images.length > 0) || viewingItem.image ? (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <Images className="h-5 w-5 text-emerald-600" />
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

                  {/* Details Section */}
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
                        <Badge 
                          variant="outline" 
                          className={`${getStatusColor(viewingItem.status)}`}
                        >
                          {getStatusIcon(viewingItem.status)}
                          {viewingItem.status}
                        </Badge>
                      </div>
                      {activeTab === "news" && viewingItem.author && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <User className="h-4 w-4 text-emerald-600" />
                          <span className="font-medium">Author:</span>
                          <span>{viewingItem.author}</span>
                        </div>
                      )}
                      {activeTab === "news" && viewingItem.views !== undefined && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <Eye className="h-4 w-4 text-emerald-600" />
                          <span className="font-medium">Views:</span>
                          <span>{viewingItem.views.toLocaleString()}</span>
                        </div>
                      )}
                      {viewingItem.category && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <span className="font-medium">Category:</span>
                          <span>{viewingItem.category}</span>
                        </div>
                      )}
                      {activeTab === "projects" && viewingItem.progress !== undefined && (
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

export default DashboardPageContent;