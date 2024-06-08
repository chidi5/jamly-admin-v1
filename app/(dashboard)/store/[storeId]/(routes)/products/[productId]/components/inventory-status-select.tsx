import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React from "react";
import { useFormContext } from "react-hook-form";

export const inventoryStatusOptions = [
  { value: "IN_STOCK", label: "In Stock" },
  { value: "OUT_OF_STOCK", label: "Out of Stock" },
];

const InventoryStatusSelect = () => {
  const { control } = useFormContext();
  return (
    <FormField
      control={control}
      name="stock.inventoryStatus"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Stock</FormLabel>
          <Select
            onValueChange={field.onChange}
            value={field.value}
            defaultValue={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue
                  defaultValue={field.value}
                  placeholder="Select a status"
                />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {inventoryStatusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default InventoryStatusSelect;
