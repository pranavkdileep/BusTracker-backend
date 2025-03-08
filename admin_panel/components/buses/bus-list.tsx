"use client"

import { useEffect, useState } from "react"
import { type Bus, getBuses, deleteBus } from "@/lib/actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
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
import { useToast } from "@/components/ui/use-toast"

export function BusList({ loadTrigger }: { loadTrigger: boolean }) {
  const [buses, setBuses] = useState<Bus[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [busToDelete, setBusToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadBuses()
  }, [loadTrigger])

  async function loadBuses() {
    setLoading(true)
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
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (state: string) => {
    switch (state.toLowerCase()) {
      case "moving":
        return "bg-green-500"
      case "idle":
        return "bg-yellow-500"
      case "maintenance":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const handleDeleteClick = (busId: string) => {
    setBusToDelete(busId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!busToDelete) return

    setIsDeleting(true)
    try {
      await deleteBus(busToDelete)
      // Update the local state by removing the deleted bus
      setBuses(buses.filter((b) => b.id !== busToDelete))
      toast({
        title: "Bus deleted",
        description: "The bus has been deleted successfully.",
      })
    } catch (error) {
      console.error("Failed to delete bus:", error)
      toast({
        title: "Failed to delete bus",
        description: "There was an error deleting the bus. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setBusToDelete(null)
    }
  }

  if (loading) {
    return <div className="flex justify-center p-8">Loading buses...</div>
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>All Buses</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Current Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Speed (km/h)</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {buses.map((bus) => (
                <TableRow key={bus.id}>
                  <TableCell className="font-medium">{bus.id}</TableCell>
                  <TableCell>{bus.name}</TableCell>
                  <TableCell>{bus.currentLocation ? bus.currentLocation : "Null"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${getStatusColor(bus.state)}`} />
                      <Badge variant="outline">{bus.state}</Badge>
                    </div>
                  </TableCell>
                  <TableCell>{bus.speed}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(bus.id)}>
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {buses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No buses found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the bus and remove its data from the system.
              Any conductors assigned to this bus may need to be reassigned.
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

