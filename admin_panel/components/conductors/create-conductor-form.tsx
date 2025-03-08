"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { createConductor, getBuses, type Bus } from "@/lib/actions"

const formSchema = z.object({
  id: z.string().min(1, "ID is required"),
  name: z.string().min(1, "Name is required"),
  busId: z.string().min(1, "Bus assignment is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type FormValues = z.infer<typeof formSchema>

interface CreateConductorFormProps {
  onSuccess?: () => void
}

export function CreateConductorForm({ onSuccess }: CreateConductorFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [buses, setBuses] = useState<Bus[]>([])
  const { toast } = useToast()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: "",
      name: "",
      busId: "",
      password: "",
    },
  })

  useEffect(() => {
    async function loadBuses() {
      try {
        const data = await getBuses()
        setBuses(data)
      } catch (error) {
        console.error("Failed to load buses:", error)
        toast({
          title: "Error loading buses",
          description: "There was a problem loading the bus data.",
          variant: "destructive",
        })
        setBuses([])
      }
    }

    loadBuses()
  }, [toast])

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true)
    try {
      await createConductor(values)
      toast({
        title: "Conductor created",
        description: `Conductor ${values.name} has been created successfully.`,
      })
      form.reset()
      onSuccess?.()
    } catch (error) {
      console.error("Failed to create conductor:", error)
      toast({
        title: "Failed to create conductor",
        description: "There was an error creating the conductor. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Conductor ID</FormLabel>
              <FormControl>
                <Input placeholder="conductor1" {...field} />
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
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="busId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assigned Bus</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a bus" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {buses.map((bus) => (
                    <SelectItem key={bus.id} value={bus.id}>
                      {bus.name} ({bus.id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Conductor"}
        </Button>
      </form>
    </Form>
  )
}

