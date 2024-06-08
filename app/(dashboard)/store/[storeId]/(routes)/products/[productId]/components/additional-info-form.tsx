import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AdditionalInfoSchema } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import "easymde/dist/easymde.min.css";
import { useForm } from "react-hook-form";
import SimpleMDE from "react-simplemde-editor";
import { z } from "zod";

type AdditionalInfoFormProps = {
  onAdd: (data: z.infer<typeof AdditionalInfoSchema>) => void;
  initialData?: any;
  index: number;
  remove: (index: number) => void;
};

const AdditionalInfoForm = ({
  onAdd,
  initialData,
  index,
  remove,
}: AdditionalInfoFormProps) => {
  const form = useForm({
    resolver: zodResolver(AdditionalInfoSchema),
    defaultValues: initialData || { title: "", description: "" },
  });

  const onSubmit = async (data: z.infer<typeof AdditionalInfoSchema>) => {
    onAdd(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Info section title</FormLabel>
              <FormControl>
                <Input {...field} />
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
                <SimpleMDE {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-between">
          <Button
            type="submit"
            variant="link"
            className="text-red-600 text-base"
            onClick={() => remove(index)}
          >
            Delete Info Section
          </Button>
          <Button type="submit">Ok</Button>
        </div>
      </form>
    </Form>
  );
};

export default AdditionalInfoForm;
