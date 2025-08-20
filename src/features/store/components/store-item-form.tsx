"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
// ...existing code...
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Package, Monitor, Calendar, Star } from "lucide-react";
import { useCreateStoreItem } from "../api/useCreateStoreItem";

const storeItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  pointsCost: z.number().min(1, "Points cost must be at least 1"),
  category: z.enum(["Physical", "Digital", "Experience", "Perk"]),
  stock: z.number().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
});

type StoreItemFormData = z.infer<typeof storeItemSchema>;

interface StoreItemFormProps {
  workspaceId: string;
  onSuccess?: () => void;
}

const categoryOptions = [
  {
    value: "Physical",
    label: "Physical Item",
    icon: Package,
    description: "Gift cards, merchandise, office supplies",
    examples: "Coffee vouchers, branded mugs, tech gadgets",
  },
  {
    value: "Digital",
    label: "Digital Perk",
    icon: Monitor,
    description: "Software licenses, online courses, subscriptions",
    examples: "Adobe license, Udemy course, Spotify premium",
  },
  {
    value: "Experience",
    label: "Experience",
    icon: Calendar,
    description: "Team events, workshops, conference tickets",
    examples: "Team lunch, coding workshop, conference pass",
  },
  {
    value: "Perk",
    label: "Team Perk",
    icon: Star,
    description: "Work benefits and privileges",
    examples: "Extra day off, premium parking, flexible hours",
  },
];

export const StoreItemForm = ({
  workspaceId,
  onSuccess,
}: StoreItemFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const createStoreItemMutation = useCreateStoreItem({ workspaceId });

  const form = useForm<StoreItemFormData>({
    resolver: zodResolver(storeItemSchema),
    defaultValues: {
      name: "",
      description: "",
      pointsCost: 100,
      category: "Physical",
      stock: undefined,
      imageUrl: "",
    },
  });

  const onSubmit = async (data: StoreItemFormData) => {
    try {
      await createStoreItemMutation.mutateAsync(data);
      form.reset();
      setIsOpen(false);
      setSelectedCategory("");
      onSuccess?.();
    } catch {
      // Error handling is done in the mutation
    }
  };

  const CategorySelector = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {categoryOptions.map((option) => {
        const Icon = option.icon;
        return (
          <Card
            key={option.value}
            className={`cursor-pointer transition-all ${
              selectedCategory === option.value
                ? "ring-2 ring-blue-500 bg-blue-50"
                : "hover:bg-gray-50"
            }`}
            onClick={() => {
              setSelectedCategory(option.value);
              form.setValue(
                "category",
                option.value as StoreItemFormData["category"]
              );
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Icon className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{option.label}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {option.description}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Examples: {option.examples}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Store Item
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Store Item</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Category Selection */}
            <div>
              <label className="text-sm font-medium mb-3 block">
                Select Item Category
              </label>
              <CategorySelector />
            </div>

            {/* Basic Information */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. $50 Coffee Shop Gift Card"
                        {...field}
                      />
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
                        placeholder="Describe what the team member will receive and any terms or conditions..."
                        className="min-h-20"
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
                  name="pointsCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Points Cost</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          placeholder="100"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 0)
                          }
                        />
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
                      <FormLabel>Stock (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder="Unlimited"
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                ? parseInt(e.target.value)
                                : undefined
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://example.com/image.jpg"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  form.formState.isSubmitting ||
                  createStoreItemMutation.isPending
                }
              >
                {form.formState.isSubmitting ||
                createStoreItemMutation.isPending
                  ? "Creating..."
                  : "Create Item"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
