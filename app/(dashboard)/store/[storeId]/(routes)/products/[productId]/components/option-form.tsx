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
import { optionSchema } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import "easymde/dist/easymde.min.css";
import { Plus, Trash } from "lucide-react";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

type OptionSchema = z.infer<typeof optionSchema>;

type OptionFormProps = {
  onAdd: (data: OptionSchema) => void;
  initialData?: OptionSchema | null;
  index: number;
  remove: (index: number) => void;
};

const OptionForm = ({ onAdd, initialData, index, remove }: OptionFormProps) => {
  const form = useForm({
    resolver: zodResolver(optionSchema),
    defaultValues: initialData || {
      name: "",
      values: [{ value: "" }],
    },
  });

  const { control } = form;

  const {
    fields,
    append,
    remove: removeValue,
  } = useFieldArray({
    control,
    name: "values",
  });

  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    } else {
      form.reset({ name: "", values: [] });
    }
  }, [initialData, form]);

  const onSubmit = async (data: z.infer<typeof optionSchema>) => {
    onAdd(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Option Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="mt-6">
          {fields.map((field, index) => (
            <div key={field.id} className="flex space-x-2 items-center">
              <FormField
                control={form.control}
                name={`values.${index}.value`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl className="mt-2">
                      <Input placeholder="Value" {...field} required />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={() => removeValue(index)}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="link"
            size="sm"
            className="mt-2"
            onClick={() => append({ value: "" })}
          >
            <Plus className="h-4 w-4" />
            &nbsp; Add option value
          </Button>
        </div>
        <div className="flex justify-between">
          <Button
            type="submit"
            variant="link"
            className="text-red-600 text-base"
            onClick={() => remove(index)}
          >
            Delete Option
          </Button>
          <Button type="submit">Ok</Button>
        </div>
      </form>
    </Form>
  );
};

export default OptionForm;
