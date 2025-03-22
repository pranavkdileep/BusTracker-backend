"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { createJourney, getBuses, type Bus } from "@/lib/actions";
import { getRoutes, Route } from "@/lib/actions";

const formSchema = z.object({
  name: z.string().min(1, "Journey name is required"),
  busid: z.string().min(1, "Bus is required"),
  routeid: z.string().min(1, "Route is required"),
  departuretime: z.string().min(1, "Departure time is required"),
  estimatedarrival: z.string().min(1, "Estimated arrival time is required"),
  price: z.string().min(1, "Price is required"),
  duration: z.string().min(1, "Duration is required"),
  seatsavailable: z.string().min(1, "Seats available is required"),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateJourneyForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      busid: "",
      routeid: "",
      departuretime: "",
      estimatedarrival: "",
      price: "",
      duration: "",
      seatsavailable: "",
    },
  });

  useEffect(() => {
    async function loadBuses() {
      try {
        const data = await getBuses();
        const routes = await getRoutes();
        setRoutes(routes);
        setBuses(data);
      } catch (error) {
        console.error("Failed to load buses:", error);
        toast({
          title: "Error loading buses",
          description: "There was a problem loading the bus data.",
          variant: "destructive",
        });
        setBuses([]);
      }
    }

    loadBuses();
  }, [toast]);

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    try {
      await createJourney(values);
      console.log("Journey created:", values);
      toast({
        title: "Journey created",
        description: "The journey has been created successfully.",
      });
      form.reset();
    } catch (error) {
      console.error("Failed to create journey:", error);
      toast({
        title: "Failed to create journey",
        description:
          "There was an error creating the journey. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Journey</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Journey Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Morning Express" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="busid"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bus</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
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

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="routeid"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned Routes</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a Route" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {routes.map((rot) => (
                          <SelectItem key={rot.id} value={rot.id}>
                            {rot.name} ({rot.id})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="seatsavailable"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Seats Available</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
                />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="departuretime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Departure Time</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estimatedarrival"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Arrival</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Journey"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
