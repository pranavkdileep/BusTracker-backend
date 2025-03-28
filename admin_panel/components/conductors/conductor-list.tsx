"use client"

import { useEffect, useState } from "react"
import { type Conductor, getConductors, deleteConductor } from "@/lib/actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CreateConductorForm } from "./create-conductor-form"

export function ConductorList({ loadTrigger }: { loadTrigger: boolean }) {
  const [conductors, setConductors] = useState<Conductor[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [conductorToDelete, setConductorToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [conductorEdit, setConductorEdit] = useState<Conductor | null>(null)

  useEffect(() => {
    loadConductors()
  }, [loadTrigger])

  async function loadConductors() {
    setLoading(true)
    try {
      const data = await getConductors()
      setConductors(data)
    } catch (error) {
      console.error("Failed to load conductors:", error)
      toast({
        title: "Error loading conductors",
        description: "There was a problem loading the conductor data.",
        variant: "destructive",
      })
      setConductors([])
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (conductorId: string) => {
    setConductorToDelete(conductorId)
    setDeleteDialogOpen(true)
  }
  const handleClieckEdit = (conductor:Conductor) => {
    setConductorEdit(conductor)
    setOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!conductorToDelete) return

    setIsDeleting(true)
    try {
      await deleteConductor(conductorToDelete)
      // Update the local state by removing the deleted conductor
      setConductors(conductors.filter((c) => c.id !== conductorToDelete))
      toast({
        title: "Conductor deleted",
        description: "The conductor has been deleted successfully.",
      })
    } catch (error) {
      console.error("Failed to delete conductor:", error)
      toast({
        title: "Failed to delete conductor",
        description: "There was an error deleting the conductor. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setConductorToDelete(null)
    }
  }

  if (loading) {
    return <div className="flex justify-center p-8">Loading conductors...</div>
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Conductor</DialogTitle>
        </DialogHeader>
        <CreateConductorForm onSuccess={() => {
          setOpen(false)
          loadConductors()
        }} defaultValues={conductorEdit? conductorEdit : undefined} />
      </DialogContent>
    </Dialog>
      <Card>
        <CardHeader>
          <CardTitle>All Conductors</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Assigned Bus</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conductors.map((conductor) => (
                <TableRow key={conductor.id}>
                  <TableCell className="font-medium">{conductor.id}</TableCell>
                  <TableCell>{conductor.name}</TableCell>
                  <TableCell>{conductor.busid}</TableCell>
                  <TableCell className="text-right">
                    <div className="space-x-2">
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(conductor.id)}>
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                    <Button variant={"secondary"} size="sm" onClick={() => handleClieckEdit(conductor)}>
                      <Pencil className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {conductors.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    No conductors found
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
              This action cannot be undone. This will permanently delete the conductor and remove their data from the
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

