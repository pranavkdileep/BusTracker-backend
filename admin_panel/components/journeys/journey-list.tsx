"use client"

import { useEffect, useState } from "react"
import { type Journey, getJourneys, deleteJourney, getBuses, type Bus } from "@/lib/actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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

export function JourneyList() {
  const [journeys, setJourneys] = useState<Journey[]>([])
  const [buses, setBuses] = useState<Record<string, Bus>>({})
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [journeyToDelete, setJourneyToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        // Load buses first to get their names
        const busesData = await getBuses()
        const busesMap: Record<string, Bus> = {}
        busesData.forEach((bus) => {
          busesMap[bus.id] = bus
        })
        setBuses(busesMap)

        // Then load journeys
        const journeysData = await getJourneys()
        setJourneys(journeysData)
      } catch (error) {
        console.error("Failed to load data:", error)
        toast({
          title: "Error loading data",
          description: "There was a problem loading the journey data.",
          variant: "destructive",
        })
        setBuses({})
        setJourneys([])
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [toast])

  const formatDateTime = (dateTimeString: string) => {
    try {
      return new Date(dateTimeString).toLocaleString()
    } catch (error) {
      return dateTimeString
    }
  }

  const getBusName = (busId: string) => {
    return buses[busId]?.name || busId
  }

  const handleDeleteClick = (journeyId: string) => {
    setJourneyToDelete(journeyId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!journeyToDelete) return

    setIsDeleting(true)
    try {
      await deleteJourney(journeyToDelete)
      // Update the local state by removing the deleted journey
      setJourneys(journeys.filter((j) => j.id !== journeyToDelete))
      toast({
        title: "Journey deleted",
        description: "The journey has been deleted successfully.",
      })
    } catch (error) {
      console.error("Failed to delete journey:", error)
      toast({
        title: "Failed to delete journey",
        description: "There was an error deleting the journey. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setJourneyToDelete(null)
    }
  }

  if (loading) {
    return <div className="flex justify-center p-8">Loading journeys...</div>
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>All Journeys</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Bus</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Departure</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {journeys.map((journey) => (
                <TableRow key={journey.id}>
                  <TableCell className="font-medium">{journey.id}</TableCell>
                  <TableCell>{journey.name}</TableCell>
                  <TableCell>{getBusName(journey.busId)}</TableCell>
                  <TableCell>
                    {journey.startLocation} → {journey.endLocation}
                  </TableCell>
                  <TableCell>{formatDateTime(journey.departureTime)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(journey.id)}>
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {journeys.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No journeys found
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
              This action cannot be undone. This will permanently delete the journey and remove its data from the
              system.
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

