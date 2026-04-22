import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import TopNav from '@/components/layout/TopNav'
import EventForm from '@/components/events/EventForm'
import type { Event } from '@/types'

type Params = { params: Promise<{ id: string }> }

export default async function EditEventPage({ params }: Params) {
  const { id } = await params
  const supabase = await createClient()

  const { data: event } = await supabase
    .from('events')
    .select('*, ticket_types(*)')
    .eq('id', id)
    .single()

  if (!event) notFound()

  return (
    <>
      <TopNav title="Modifier l'événement" subtitle={event.title} backHref={`/events/${id}`} />
      <div className="p-8 max-w-3xl">
        <EventForm mode="edit" event={event as Event} />
      </div>
    </>
  )
}
