import { RouteList } from "@/components/routes/route-list"
import { CreateRouteButton } from "@/components/routes/create-route-button"

export default function RoutesPage() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Routes</h1>
        <CreateRouteButton />
      </div>
      <RouteList />
    </div>
  )
}

