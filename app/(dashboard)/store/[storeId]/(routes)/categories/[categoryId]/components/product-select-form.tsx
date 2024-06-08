import { Button, buttonVariants } from "@/components/ui/button";
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
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useFormContext } from "react-hook-form";

type ProductSelectProps = {
  products: Product[];
  storeId: string;
};

const ProductSelectForm = ({ products, storeId }: ProductSelectProps) => {
  const { control, getValues, setValue } = useFormContext();
  const { setClose } = useModal();
  const router = useRouter();

  const handleProduct = () => {
    setClose();
    router.push(`/store/${storeId}/products/new`);
  };

  const handleCheckedChange = (
    productId: string,
    checked: string | boolean
  ) => {
    const currentProducts = getValues("products");
    if (checked) {
      setValue("products", [...currentProducts, productId]);
    } else {
      setValue(
        "products",
        currentProducts.filter((id: string) => id !== productId)
      );
    }
  };

  return (
    <>
      {products.length > 0 ? (
        <ScrollArea className="h-[200px] w-full my-8">
          {products.map((product) => (
            <FormField
              key={product.id}
              control={control}
              name="products"
              render={() => (
                <FormItem
                  key={product.id}
                  className="flex items-center justify-between mb-4"
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
                      onCheckedChange={(checked) =>
                        handleCheckedChange(product.id, checked)
                      }
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          ))}
        </ScrollArea>
      ) : (
        <div className="flex flex-col items-center justify-center space-y-3 h-[200px]">
          <h2 className="text-xl font-medium">
            No product available, create product
          </h2>
          <Button variant="outline" onClick={handleProduct}>
            Create Product
          </Button>
        </div>
      )}
      <Button onClick={() => setClose()}>Done</Button>
    </>
  );
};

export default ProductSelectForm;
