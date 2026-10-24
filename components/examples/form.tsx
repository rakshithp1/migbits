"use client";
// Migbits preview composed with shadcn/ui (MIT); see ../ui/LICENSE.
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
export default function Example() {
  const form = useForm({ defaultValues: { name: "" } });
  const [saved, setSaved] = useState(false);
  return (
    <Form {...form}>
      <form
        className="grid w-full max-w-sm gap-5"
        onSubmit={form.handleSubmit(() => setSaved(true))}
      >
        <FormField
          control={form.control}
          name="name"
          rules={{
            required: "Add a project name.",
            minLength: { value: 2, message: "Use at least two characters." },
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project name</FormLabel>
              <FormControl>
                <Input placeholder="Something worth making" {...field} />
              </FormControl>
              <FormDescription>
                A working local form, with real validation.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Save project</Button>
        <p role="status" className="text-sm text-muted-foreground">
          {saved
            ? "Saved in this preview. No data was sent."
            : "Try submitting an empty field."}
        </p>
      </form>
    </Form>
  );
}
