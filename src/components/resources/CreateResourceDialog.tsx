import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Upload, X } from "lucide-react";

const resourceSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  file_type: z.enum(['pdf', 'video', 'audio', 'image', 'link']),
  category: z.enum(['parenting', 'education', 'health', 'development', 'general']),
  tags: z.array(z.string()).default([]),
  is_featured: z.boolean().default(false),
  file_url: z.string().optional(),
});

type ResourceFormData = z.infer<typeof resourceSchema>;

interface CreateResourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResourceCreated: () => void;
}

export const CreateResourceDialog = ({ open, onOpenChange, onResourceCreated }: CreateResourceDialogProps) => {
  const [uploading, setUploading] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const form = useForm<ResourceFormData>({
    resolver: zodResolver(resourceSchema),
    defaultValues: {
      title: "",
      description: "",
      file_type: "pdf",
      category: "general",
      tags: [],
      is_featured: false,
      file_url: "",
    },
  });

  const watchedFileType = form.watch("file_type");
  const watchedTags = form.watch("tags");

  const handleFileUpload = async (file: File) => {
    if (!file) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('resources')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('resources')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const addTag = () => {
    if (tagInput.trim() && !watchedTags.includes(tagInput.trim())) {
      form.setValue("tags", [...watchedTags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    form.setValue("tags", watchedTags.filter(tag => tag !== tagToRemove));
  };

  const onSubmit = async (data: ResourceFormData) => {
    setUploading(true);
    try {
      let fileUrl = data.file_url;

      // Upload file if one was selected and it's not a link type
      if (uploadedFile && data.file_type !== 'link') {
        fileUrl = await handleFileUpload(uploadedFile);
      }

      const { error } = await supabase
        .from('resources')
        .insert({
          title: data.title,
          description: data.description,
          file_type: data.file_type,
          category: data.category,
          tags: data.tags,
          is_featured: data.is_featured,
          file_url: fileUrl,
          created_by: (await supabase.auth.getUser()).data.user?.id || '',
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Resource created successfully",
      });

      onResourceCreated();
      onOpenChange(false);
      form.reset();
      setUploadedFile(null);
    } catch (error) {
      console.error('Error creating resource:', error);
      toast({
        title: "Error",
        description: "Failed to create resource",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Resource</DialogTitle>
          <DialogDescription>
            Add a new resource to the E-Aware Parenting library
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter resource title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter resource description"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="file_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>File Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select file type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pdf">PDF Document</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="audio">Audio</SelectItem>
                        <SelectItem value="image">Image</SelectItem>
                        <SelectItem value="link">External Link</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="parenting">Parenting</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="health">Health</SelectItem>
                        <SelectItem value="development">Development</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* File Upload or URL Input */}
            {watchedFileType === 'link' ? (
              <FormField
                control={form.control}
                name="file_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>External URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/resource"
                        type="url"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter the URL for the external resource
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <div className="space-y-2">
                <FormLabel>Upload File</FormLabel>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                  <input
                    type="file"
                    onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="file-upload"
                    accept={
                      watchedFileType === 'pdf' ? '.pdf' :
                      watchedFileType === 'video' ? 'video/*' :
                      watchedFileType === 'audio' ? 'audio/*' :
                      watchedFileType === 'image' ? 'image/*' : '*'
                    }
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center text-center">
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {uploadedFile ? uploadedFile.name : `Click to upload ${watchedFileType.toUpperCase()} file`}
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Tags Input */}
            <div className="space-y-2">
              <FormLabel>Tags</FormLabel>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a tag and press Enter"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <Button type="button" onClick={addTag} variant="outline">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {watchedTags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            <FormField
              control={form.control}
              name="is_featured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Featured Resource</FormLabel>
                    <FormDescription>
                      Mark this resource as featured to highlight it
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={uploading}>
                {uploading ? "Creating..." : "Create Resource"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};