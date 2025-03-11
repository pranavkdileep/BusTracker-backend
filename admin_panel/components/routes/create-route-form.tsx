"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { createRoute } from "@/lib/actions"
import { MapPin, Plus, X } from "lucide-react"

const formSchema = z.object({
  id: z.string().min(1, "ID is required"),
  name: z.string().min(1, "Name is required"),
  source: z.string().min(1, "Source is required"),
  destination: z.string().min(1, "Destination is required"),
  routefileurl: z.string().min(1, "Route file url is required"),
  busstops: z
    .array(
      z.object({
        name: z.string().min(1, "Bus stop name is required"),
      }),
    )
    .min(2, "At least 2 bus stops are required"),
})

type FormValues = z.infer<typeof formSchema>

interface CreateRouteFormProps {
  onSuccess?: () => void
}

export function CreateRouteForm({ onSuccess }: CreateRouteFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: "",
      name: "",
      source: "",
      destination: "",
      busstops: [{ name: "" }, { name: "" }],
      routefileurl: "",
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "busstops",
  })

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true)
    try {
      // Transform the data to match the Route type
      const routeData = {
        id: values.id,
        name: values.name,
        source: values.source,
        destination: values.destination,
        busstops: values.busstops.map((stop) => stop.name),
        routefileurl: values.routefileurl,
      }

      await createRoute(routeData)
      toast({
        title: "Route created",
        description: `Route ${values.name} has been created successfully.`,
      })
      form.reset()
      onSuccess?.()
    } catch (error) {
      console.error("Failed to create route:", error)
      toast({
        title: "Failed to create route",
        description: "There was an error creating the route. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Route ID</FormLabel>
                <FormControl>
                  <Input placeholder="route1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Route Name</FormLabel>
                <FormControl>
                  <Input placeholder="City Express" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="source"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Source</FormLabel>
                <FormControl>
                  <Input placeholder="Downtown" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="destination"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Destination</FormLabel>
                <FormControl>
                  <Input placeholder="Airport" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="routefileurl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rout Lang Lot File Url</FormLabel>
                <FormControl>
                  <Input placeholder="https://s3.aws.in/sgsgd/route123.json" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <FormLabel className="text-base">Bus Stops</FormLabel>
            <Button type="button" variant="outline" size="sm" onClick={() => append({ name: "" })}>
              <Plus className="h-4 w-4 mr-1" />
              Add Stop
            </Button>
          </div>

          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground w-6">{index + 1}.</span>
                <FormField
                  control={form.control}
                  name={`busstops.${index}.name`}
                  render={({ field }) => (
                    <FormItem className="flex-1 mb-0">
                      <FormControl>
                        <Input placeholder={`Bus Stop ${index + 1}`} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {fields.length > 2 && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)} className="h-8 w-8 p-0">
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remove</span>
                  </Button>
                )}
              </div>
            ))}
          </div>
          {form.formState.errors.busstops?.root && (
            <p className="text-sm font-medium text-destructive mt-2">{form.formState.errors.busstops.root.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Route"}
        </Button>
      </form>
    </Form>
  )
}

