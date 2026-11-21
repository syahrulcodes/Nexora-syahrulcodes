"use client"

import { useState, useMemo, useEffect } from "react"
import {
  Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon,
  Clock, Edit, Trash2, X
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAppStore } from "@/store/useAppStore"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, addMonths, subMonths, isSameMonth, isToday, isSameDay
} from "date-fns"
import type { CalendarEvent } from "@/types"

const EVENT_CATEGORIES = ["Work", "Personal", "Health", "Finance", "Social", "Study", "Other"]
const EVENT_COLORS = ["#A8B8AE", "#A9BAC8", "#D4C8B8", "#8FB8B0", "#7FAF8A", "#C8A97A", "#C8847A"]

const eventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  start_time: z.string().min(1, "Start time is required"),
  end_time: z.string().min(1, "End time is required"),
  category: z.string().min(1, "Category is required"),
  color: z.string().min(1),
})
type EventForm = z.infer<typeof eventSchema>

export const dynamic = "force-dynamic"

export default function CalendarPage() {
  const { events, addEvent, updateEvent, deleteEvent } = useAppStore()
  const [currentDate, setCurrentDate] = useState<Date | null>(null)
  const [view, setView] = useState<"month" | "week">("month")

  useEffect(() => {
    setCurrentDate(new Date())
  }, [])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [viewingEvent, setViewingEvent] = useState<CalendarEvent | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<EventForm>({
    resolver: zodResolver(eventSchema) as any,
    defaultValues: { color: "#A8B8AE" },
  })
  const watchColor = watch("color")

  const safeDate = currentDate || new Date("2024-01-01")
  const monthStart = startOfMonth(safeDate)
  const monthEnd = endOfMonth(safeDate)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

  const calDays = useMemo(() => {
    const days = []
    let day = calStart
    while (day <= calEnd) {
      days.push(day)
      day = addDays(day, 1)
    }
    return days
  }, [calStart, calEnd])

  const getEventsForDay = (day: Date) => {
    return events.filter((e) => isSameDay(new Date(e.start_time), day))
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
  }

  const openCreate = (date?: Date) => {
    setEditingEvent(null)
    const dateStr = format(date || new Date(), "yyyy-MM-dd")
    reset({
      color: "#A8B8AE",
      start_time: `${dateStr}T09:00`,
      end_time: `${dateStr}T10:00`,
    })
    setDialogOpen(true)
  }

  const openEdit = (event: CalendarEvent) => {
    setEditingEvent(event)
    setValue("title", event.title)
    setValue("description", event.description || "")
    setValue("start_time", event.start_time.slice(0, 16))
    setValue("end_time", event.end_time.slice(0, 16))
    setValue("category", event.category)
    setValue("color", event.color)
    setViewingEvent(null)
    setDialogOpen(true)
  }

  const onSubmit = (data: EventForm) => {
    if (editingEvent) {
      updateEvent(editingEvent.id, {
        ...data,
        description: data.description || null,
        updated_at: new Date().toISOString(),
      })
      toast.success("Event updated")
    } else {
      addEvent({
        id: crypto.randomUUID(),
        user_id: "",
        title: data.title,
        description: data.description || null,
        start_time: data.start_time,
        end_time: data.end_time,
        category: data.category,
        color: data.color,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      toast.success("Event created!")
    }
    setDialogOpen(false)
    reset()
  }

  const handleDelete = (id: string) => {
    deleteEvent(id)
    setDeleteConfirm(null)
    setViewingEvent(null)
    toast.success("Event deleted")
  }

  // Upcoming events
  const upcomingEvents = events
    .filter((e) => new Date(e.start_time) >= new Date())
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
    .slice(0, 5)

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Calendar</h1>
          <p className="text-sm text-[var(--text-muted)]">{events.length} events scheduled</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border border-[var(--border)] rounded-md overflow-hidden">
            <button
              onClick={() => setView("month")}
              className={cn("px-3 py-1.5 text-sm transition-colors", view === "month" ? "bg-[var(--accent-sage)]/15 text-[var(--accent-sage)]" : "text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]")}
            >Month</button>
            <button
              onClick={() => setView("week")}
              className={cn("px-3 py-1.5 text-sm transition-colors", view === "week" ? "bg-[var(--accent-sage)]/15 text-[var(--accent-sage)]" : "text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]")}
            >Week</button>
          </div>
          <Button onClick={() => openCreate()}>
            <Plus className="h-4 w-4" /> Add Event
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-4">
              {/* Nav */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-[var(--text-primary)]">
                  {format(safeDate, "MMMM yyyy")}
                </h2>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon-sm" onClick={() => setCurrentDate(subMonths(safeDate, 1))}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setCurrentDate(new Date())} className="text-xs">
                    Today
                  </Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => setCurrentDate(addMonths(safeDate, 1))}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 mb-1">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                  <div key={d} className="text-center py-1 text-xs font-medium text-[var(--text-muted)]">{d}</div>
                ))}
              </div>

              {/* Days */}
              <div className="grid grid-cols-7 gap-px bg-[var(--border)] rounded-lg overflow-hidden">
                {calDays.map((day) => {
                  const dayEvents = getEventsForDay(day)
                  const isCurrentMonth = isSameMonth(day, safeDate)
                  const isTodayDate = isToday(day)
                  return (
                    <div
                      key={day.toISOString()}
                      className={cn(
                        "bg-[var(--bg-card)] min-h-20 p-1.5 cursor-pointer hover:bg-[var(--bg-elevated)] transition-colors",
                        !isCurrentMonth && "opacity-40",
                        isTodayDate && "bg-[var(--accent-sage)]/5"
                      )}
                      onClick={() => openCreate(day)}
                    >
                      <div className={cn(
                        "w-6 h-6 flex items-center justify-center rounded-full text-xs mb-1 mx-auto",
                        isTodayDate
                          ? "bg-[var(--accent-sage)] text-white font-semibold"
                          : "text-[var(--text-secondary)]"
                      )}>
                        {format(day, "d")}
                      </div>
                      <div className="space-y-0.5">
                        {dayEvents.slice(0, 2).map((event) => (
                          <div
                            key={event.id}
                            onClick={(e) => { e.stopPropagation(); setViewingEvent(event) }}
                            className="text-[10px] px-1 py-0.5 rounded truncate font-medium cursor-pointer hover:opacity-80 transition-opacity"
                            style={{ background: event.color + "30", color: event.color }}
                          >
                            {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-[9px] text-[var(--text-muted)] px-1">
                            +{dayEvents.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Upcoming Events</h3>
              {upcomingEvents.length === 0 ? (
                <div className="py-6 text-center">
                  <CalendarIcon className="h-7 w-7 text-[var(--text-muted)] mx-auto mb-2" />
                  <p className="text-xs text-[var(--text-muted)]">No upcoming events</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {upcomingEvents.map((event) => (
                    <div
                      key={event.id}
                      className="p-2.5 rounded-lg cursor-pointer hover:bg-[var(--bg-elevated)] transition-colors"
                      onClick={() => setViewingEvent(event)}
                    >
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: event.color }} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[var(--text-primary)] truncate">{event.title}</p>
                          <p className="text-xs text-[var(--text-muted)] flex items-center gap-1 mt-0.5">
                            <Clock className="h-3 w-3" />
                            {format(new Date(event.start_time), "d MMM · HH:mm")}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Button variant="secondary" size="sm" className="w-full mt-3 text-xs" onClick={() => openCreate()}>
                <Plus className="h-3.5 w-3.5" /> Schedule Event
              </Button>
            </CardContent>
          </Card>

          {/* Categories Legend */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Categories</h3>
              <div className="space-y-1.5">
                {EVENT_CATEGORIES.map((cat, i) => (
                  <div key={cat} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: EVENT_COLORS[i % EVENT_COLORS.length] }} />
                    <span className="text-xs text-[var(--text-muted)]">{cat}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingEvent ? "Edit Event" : "New Event"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input {...register("title")} placeholder="Event title..." />
              {errors.title && <p className="text-xs text-[var(--status-error)]">{errors.title.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea {...register("description")} placeholder="Optional..." rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Start *</Label>
                <Input type="datetime-local" {...register("start_time")} />
                {errors.start_time && <p className="text-xs text-[var(--status-error)]">{errors.start_time.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>End *</Label>
                <Input type="datetime-local" {...register("end_time")} />
                {errors.end_time && <p className="text-xs text-[var(--status-error)]">{errors.end_time.message}</p>}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Category *</Label>
              <Select defaultValue={editingEvent?.category || ""} onValueChange={(v) => setValue("category", v)}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  {EVENT_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-xs text-[var(--status-error)]">{errors.category.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Color</Label>
              <div className="flex gap-2">
                {EVENT_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setValue("color", color)}
                    className={cn("w-7 h-7 rounded-full border-2 transition-all", watchColor === color ? "border-white scale-110" : "border-transparent")}
                    style={{ background: color }}
                  />
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit">{editingEvent ? "Save Changes" : "Create Event"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Event Dialog */}
      <Dialog open={!!viewingEvent} onOpenChange={() => setViewingEvent(null)}>
        <DialogContent className="max-w-md">
          {viewingEvent && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: viewingEvent.color }} />
                  {viewingEvent.title}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                  <Clock className="h-4 w-4" />
                  <span>
                    {format(new Date(viewingEvent.start_time), "d MMM yyyy · HH:mm")} –{" "}
                    {format(new Date(viewingEvent.end_time), "HH:mm")}
                  </span>
                </div>
                <Badge variant="secondary">{viewingEvent.category}</Badge>
                {viewingEvent.description && (
                  <p className="text-sm text-[var(--text-secondary)]">{viewingEvent.description}</p>
                )}
              </div>
              <DialogFooter>
                <Button variant="secondary" onClick={() => { openEdit(viewingEvent) }}>
                  <Edit className="h-4 w-4" /> Edit
                </Button>
                <Button variant="destructive" onClick={() => setDeleteConfirm(viewingEvent.id)}>
                  <Trash2 className="h-4 w-4" /> Delete
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete Event</DialogTitle></DialogHeader>
          <p className="text-sm text-[var(--text-secondary)]">This will permanently delete this event.</p>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
