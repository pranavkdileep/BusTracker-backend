"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CreateConductorForm } from "./create-conductor-form"

export function CreateConductorButton() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add New Conductor</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Conductor</DialogTitle>
        </DialogHeader>
        <CreateConductorForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}

