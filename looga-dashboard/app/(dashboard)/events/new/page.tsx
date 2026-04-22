import TopNav from '@/components/layout/TopNav'
import EventForm from '@/components/events/EventForm'

export default function NewEventPage() {
  return (
    <>
      <TopNav
        title="Créer un événement"
        subtitle="L'événement sera visible sur l'app mobile après publication"
        backHref="/events"
      />
      <div className="p-8 max-w-3xl">
        <EventForm mode="create" />
      </div>
    </>
  )
}
