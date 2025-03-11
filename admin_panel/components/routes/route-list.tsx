"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Trash2, MapPin, Eye } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { getRoutes, deleteRoute } from "@/lib/actions"
import type { Route } from "@/lib/ggdgdgdg"

export function RouteList() {
  const [routes, setRoutes] = useState<Route[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [routeToDelete, setRouteToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadRoutes()
  }, [])

  async function loadRoutes() {
    setLoading(true)
    try {
      const data = await getRoutes()
      setRoutes(data)
    } catch (error) {
      console.error("Failed to load routes:", error)
      toast({
        title: "Error loading routes",
        description: "There was a problem loading the route data.",
        variant: "destructive",
      })
      // Set some sample data for demonstration
      setRoutes([
        {
          id: "route1",
          name: "City Express",
          source: "Downtown",
          destination: "Airport",
          busstops: ["Central Station", "Market Square", "Business Park", "Airport Terminal"],
          routefileurl: "https://example.com/route1",
        },
        {
          id: "route2",
          name: "Suburban Line",
          source: "Downtown",
          destination: "Suburbia",
          busstops: ["Central Station", "City Park", "Shopping Mall", "Residential Area"],
          routefileurl: "https://example.com/route2",
        },
        {
          id: "route3",
          name: "University Route",
          source: "Downtown",
          destination: "University",
          busstops: ["Central Station", "Library", "Sports Complex", "University Campus"],
          routefileurl: "https://example.com/route3",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (routeId: string) => {
    setRouteToDelete(routeId)
    setDeleteDialogOpen(true)
  }

  const handleViewClick = (route: Route) => {
    setSelectedRoute(route)
    setViewDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!routeToDelete) return

    setIsDeleting(true)
    try {
      await deleteRoute(routeToDelete)
      // Update the local state by removing the deleted route
      setRoutes(routes.filter((r) => r.id !== routeToDelete))
      toast({
        title: "Route deleted",
        description: "The route has been deleted successfully.",
      })
    } catch (error) {
      console.error("Failed to delete route:", error)
      toast({
        title: "Failed to delete route",
        description: "There was an error deleting the route. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setRouteToDelete(null)
    }
  }

  if (loading) {
    return <div className="flex justify-center p-8">Loading routes...</div>
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>All Routes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Bus Stops</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {routes.map((route) => (
                <TableRow key={route.id}>
                  <TableCell className="font-medium">{route.id}</TableCell>
                  <TableCell>{route.name}</TableCell>
                  <TableCell>{route.source}</TableCell>
                  <TableCell>{route.destination}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{route.busstops.length} stops</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleViewClick(route)}>
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(route.id)}>
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {routes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No routes found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Route Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Route Details: {selectedRoute?.name}</DialogTitle>
            <DialogDescription>View detailed information about this route and its bus stops.</DialogDescription>
          </DialogHeader>
          {selectedRoute && (
            <div className="py-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Route ID</h4>
                  <p className="text-sm">{selectedRoute.id}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Route Name</h4>
                  <p className="text-sm">{selectedRoute.name}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Source</h4>
                  <p className="text-sm">{selectedRoute.source}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Destination</h4>
                  <p className="text-sm">{selectedRoute.destination}</p>
                </div>
                <div>
                    <h4 className="text-sm font-medium mb-1">Route File URL</h4>
                    <p className="text-sm">{selectedRoute.routefileurl}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Bus Stops</h4>
                <div className="border rounded-md p-3 bg-muted/40">
                  <div className="space-y-2">
                    {selectedRoute.busstops.map((stop, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {index + 1}. {stop}
                          {index === 0 && <Badge className="ml-2 bg-blue-500">Start</Badge>}
                          {index === selectedRoute.busstops.length - 1 && (
                            <Badge className="ml-2 bg-green-500">End</Badge>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the route and remove its data from the system.
              Any journeys associated with this route may be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

