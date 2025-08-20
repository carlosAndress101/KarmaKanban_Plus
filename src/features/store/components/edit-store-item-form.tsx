"use client";

// ...existing code...
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useUpdateStoreItem } from "../api/useUpdateStoreItem";
import { StoreItem } from "../types";

const editStoreItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  pointsCost: z.coerce.number().min(1, "Points cost must be at least 1"),
  category: z.enum(["Physical", "Digital", "Experience", "Perk"]),
  stock: z.coerce.number().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
});

type EditStoreItemFormData = z.infer<typeof editStoreItemSchema>;

interface EditStoreItemFormProps {
  workspaceId: string;
  item: StoreItem;
  isOpen: boolean;
  onClose: () => void;
}

export const EditStoreItemForm = ({
  workspaceId,
  item,
  isOpen,
  onClose,
}: EditStoreItemFormProps) => {
  const updateStoreItemMutation = useUpdateStoreItem({ workspaceId });

  const form = useForm<EditStoreItemFormData>({
    resolver: zodResolver(editStoreItemSchema),
    defaultValues: {
      name: item.name,
      description: item.description,
      pointsCost: item.pointsCost,
      category: item.category,
      stock: item.stock || undefined,
      imageUrl: item.imageUrl || "",
    },
  });

  const onSubmit = async (data: EditStoreItemFormData) => {
    updateStoreItemMutation.mutate(
      {
        storeItemId: item.id,
        data: {
          ...data,
          stock: data.stock ?? undefined,
          imageUrl: data.imageUrl ?? undefined,
        },
      },
      {
        onSuccess: () => {
          onClose();
          form.reset();
        },
      }
    );
  };

  const handleClose = () => {
    onClose();
    form.reset({
      name: item.name,
      description: item.description,
      pointsCost: item.pointsCost,
      category: item.category,
      stock: item.stock || undefined,
      imageUrl: item.imageUrl || "",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Store Item</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter item name..." {...field} />
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
                    <Textarea placeholder="Describe the item..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="pointsCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Points Cost</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="50" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock (optional)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="10" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Physical">Physical</SelectItem>
                      <SelectItem value="Digital">Digital</SelectItem>
                      <SelectItem value="Experience">Experience</SelectItem>
                      <SelectItem value="Perk">Perk</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL (optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/image.jpg"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateStoreItemMutation.isPending}
              >
                {updateStoreItemMutation.isPending
                  ? "Updating..."
                  : "Update Item"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
