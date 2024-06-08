import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Product } from "@/lib/types";
import { useModal } from "@/providers/cutom-modal-provider";
import Image from "next/image";
import React from "react";
import { useFormContext } from "react-hook-form";

type ProductSelectProps = {
  products: Product[];
};

const ProductSelectForm = ({ products }: ProductSelectProps) => {
  const { control, getValues, setValue } = useFormContext();
  const { setClose } = useModal();
  return (
    <>
      <ScrollArea className="h-[200px] w-full my-8">
        {products.map((product) => (
          <FormField
            key={product.id}
            control={control}
            name="products"
            render={() => (
              <FormItem
                key={product.id}
                className="flex items-center justify-between"
              >
                <FormLabel className="font-normal text-lg cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 relative flex-none">
                      <Image
                        src={product.images[0].url}
                        fill
                        className="rounded-full object-cover"
                        alt={product.name}
                      />
                    </div>
                    <span>{product.name}</span>
                  </div>
                </FormLabel>
                <FormControl>
                  <Checkbox
                    className="rounded-full w-6 h-6"
                    checked={getValues("products").includes(product.id)}
                    onCheckedChange={(checked) => {
                      const currentProducts = getValues("products");
                      if (checked) {
                        setValue("products", [...currentProducts, product.id]);
                      } else {
                        setValue(
                          "products",
                          currentProducts.filter(
                            (id: string) => id !== product.id
                          )
                        );
                      }
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        ))}
      </ScrollArea>
      <Button onClick={() => setClose()}>Done</Button>
    </>
  );
};

export default ProductSelectForm;
