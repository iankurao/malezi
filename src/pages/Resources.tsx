import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download, FileText, Video, Headphones, Image, Link, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { CreateResourceDialog } from "@/components/resources/CreateResourceDialog";

interface Resource {
  id: string;
  title: string;
  description: string;
  file_url: string | null;
  file_type: string;
  category: string;
  tags: string[];
  created_at: string;
  download_count: number;
  is_featured: boolean;
}

const Resources = () => {
  const { user, profile } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    fetchResources();
  }, []);

  useEffect(() => {
    filterResources();
  }, [resources, searchTerm, selectedCategory]);

  const fetchResources = async () => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResources(data || []);
    } catch (error) {
      console.error('Error fetching resources:', error);
      toast({
        title: "Error",
        description: "Failed to load resources",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterResources = () => {
    let filtered = resources;

    if (searchTerm) {
      filtered = filtered.filter(resource =>
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(resource => resource.category === selectedCategory);
    }

    setFilteredResources(filtered);
  };

  const handleDownload = async (resourceId: string, fileUrl: string | null) => {
    if (!fileUrl) {
      toast({
        title: "No file available",
        description: "This resource doesn't have a downloadable file",
        variant: "destructive",
      });
      return;
    }

    try {
      // Increment download count
      const { error } = await supabase
        .from('resources')
        .update({ download_count: (resources.find(r => r.id === resourceId)?.download_count || 0) + 1 })
        .eq('id', resourceId);

      if (error) throw error;

      // Open file in new tab for download
      window.open(fileUrl, '_blank');
      
      // Update local state
      setResources(prev => prev.map(resource => 
        resource.id === resourceId 
          ? { ...resource, download_count: resource.download_count + 1 }
          : resource
      ));

      toast({
        title: "Download started",
        description: "The resource file is opening in a new tab",
      });
    } catch (error) {
      console.error('Error updating download count:', error);
      toast({
        title: "Error",
        description: "Failed to update download count",
        variant: "destructive",
      });
    }
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return <FileText className="h-5 w-5" />;
      case 'video':
        return <Video className="h-5 w-5" />;
      case 'audio':
        return <Headphones className="h-5 w-5" />;
      case 'image':
        return <Image className="h-5 w-5" />;
      case 'link':
        return <Link className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'parenting':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'education':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'health':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'development':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Resource Library</h1>
          <p className="text-muted-foreground">
            Discover helpful resources for inclusive parenting and education
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Resource
          </Button>
        )}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="parenting">Parenting</SelectItem>
            <SelectItem value="education">Education</SelectItem>
            <SelectItem value="health">Health</SelectItem>
            <SelectItem value="development">Development</SelectItem>
            <SelectItem value="general">General</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((resource) => (
          <Card key={resource.id} className={`relative ${resource.is_featured ? 'ring-2 ring-primary' : ''}`}>
            {resource.is_featured && (
              <Badge className="absolute -top-2 -right-2 bg-primary">Featured</Badge>
            )}
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getFileIcon(resource.file_type)}
                  <CardTitle className="text-lg line-clamp-2">{resource.title}</CardTitle>
                </div>
              </div>
              <CardDescription className="line-clamp-3">
                {resource.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className={getCategoryColor(resource.category)}>
                    {resource.category}
                  </Badge>
                  {resource.tags?.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {resource.tags?.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{resource.tags.length - 2} more
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {resource.download_count} downloads
                  </span>
                  <Button
                    onClick={() => handleDownload(resource.id, resource.file_url)}
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    {resource.file_type === 'link' ? 'Visit' : 'Download'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredResources.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No resources found matching your criteria.</p>
        </div>
      )}

      {/* Create Resource Dialog */}
      <CreateResourceDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onResourceCreated={fetchResources}
      />
    </div>
  );
};

export default Resources;