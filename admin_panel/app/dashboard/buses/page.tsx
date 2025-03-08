import { BusList } from "@/components/buses/bus-list"
import { CreateBusButton } from "@/components/buses/create-bus-button"

export default function BusesPage() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Buses</h1>
        <CreateBusButton />
      </div>
      <BusList />
    </div>
  )
}

