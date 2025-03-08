"use client"
import { BusList } from "@/components/buses/bus-list"
import { CreateBusButton } from "@/components/buses/create-bus-button"
import { useState } from "react"

export default function BusesPage() {
  const [loadBus,setLoadBus] = useState(false)
  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Buses</h1>
        <CreateBusButton onSubmitSuccess = {()=>{setLoadBus(!loadBus)}} />
      </div>
      <BusList loadTrigger = {loadBus} />
    </div>
  )
}

