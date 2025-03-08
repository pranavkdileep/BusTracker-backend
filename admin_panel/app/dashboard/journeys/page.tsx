import { CreateJourneyForm } from "@/components/journeys/create-journey-form"
import { JourneyList } from "@/components/journeys/journey-list"

export default function JourneysPage() {
  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-3xl font-bold">Journeys</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <CreateJourneyForm />
        <JourneyList />
      </div>
    </div>
  )
}

