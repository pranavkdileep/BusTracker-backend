"use client"

import { ConductorList } from "@/components/conductors/conductor-list"
import { CreateConductorButton } from "@/components/conductors/create-conductor-button"
import { useState } from "react"

export default function ConductorsPage() {
  const [loadTrigger, setLoadTrigger] = useState(false)
  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Conductors</h1>
        <CreateConductorButton onSubmitSuccess={()=>setLoadTrigger(!loadTrigger)}/>
      </div>
      <ConductorList loadTrigger = {loadTrigger} />
    </div>
  )
}

