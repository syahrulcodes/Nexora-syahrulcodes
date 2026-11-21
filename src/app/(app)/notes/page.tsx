"use client"

import { useState, useMemo } from "react"
import {
  Plus, Search, Pin, PinOff, Trash2, Edit, Tag,
  FileText, Calendar, MoreHorizontal
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAppStore } from "@/store/useAppStore"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { cn, formatDate } from "@/lib/utils"
import type { Note } from "@/types"

const NOTE_CATEGORIES = ["Personal", "Work", "Study", "Ideas", "Travel", "Health", "Finance", "Other"]

const noteSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  category: z.string().optional(),
  tags: z.string().optional(),
})
type NoteForm = z.infer<typeof noteSchema>

export default function NotesPage() {
  const { notes, addNote, updateNote, deleteNote } = useAppStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [viewNote, setViewNote] = useState<Note | null>(null)

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<NoteForm>({
    resolver: zodResolver(noteSchema),
  })

  const filteredNotes = useMemo(() => {
    return notes
      .filter((n) => {
        const matchSearch = !searchQuery ||
          n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.content.toLowerCase().includes(searchQuery.toLowerCase())
        const matchCat = filterCategory === "all" || n.category === filterCategory
        return matchSearch && matchCat
      })
      .sort((a, b) => {
        if (a.is_pinned && !b.is_pinned) return -1
        if (!a.is_pinned && b.is_pinned) return 1
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      })
  }, [notes, searchQuery, filterCategory])

  const pinnedNotes = filteredNotes.filter((n) => n.is_pinned)
  const unpinnedNotes = filteredNotes.filter((n) => !n.is_pinned)

  const openCreate = () => {
    setEditingNote(null)
    reset()
    setDialogOpen(true)
  }

  const openEdit = (note: Note) => {
    setEditingNote(note)
    setValue("title", note.title)
    setValue("content", note.content)
    setValue("category", note.category || "")
    setValue("tags", note.tags?.join(", ") || "")
    setDialogOpen(true)
  }

  const onSubmit = (data: NoteForm) => {
    const tags = data.tags ? data.tags.split(",").map((t) => t.trim()).filter(Boolean) : []
    if (editingNote) {
      updateNote(editingNote.id, {
        ...data,
        tags,
        category: data.category || null,
        updated_at: new Date().toISOString(),
      })
      toast.success("Note saved")
    } else {
      addNote({
        id: crypto.randomUUID(),
        user_id: "",
        title: data.title,
        content: data.content,
        category: data.category || null,
        tags,
        is_pinned: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      toast.success("Note created!")
    }
    setDialogOpen(false)
    reset()
  }

  const handleDelete = (id: string) => {
    deleteNote(id)
    setDeleteConfirm(null)
    if (viewNote?.id === id) setViewNote(null)
    toast.success("Note deleted")
  }

  const handlePin = (note: Note) => {
    updateNote(note.id, { is_pinned: !note.is_pinned, updated_at: new Date().toISOString() })
    toast.success(note.is_pinned ? "Note unpinned" : "Note pinned!")
  }

  const NoteCard = ({ note }: { note: Note }) => (
    <Card
      className="group cursor-pointer hover:border-[var(--accent-sage)]/30 hover:shadow-sm transition-all"
      onClick={() => setViewNote(note)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] line-clamp-1 flex-1">
            {note.title}
          </h3>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon-sm" className="h-6 w-6" onClick={() => handlePin(note)}>
              {note.is_pinned ? <PinOff className="h-3 w-3" /> : <Pin className="h-3 w-3" />}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" className="h-6 w-6">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => openEdit(note)}>
                  <Edit className="h-4 w-4" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handlePin(note)}>
                  <Pin className="h-4 w-4" /> {note.is_pinned ? "Unpin" : "Pin"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setDeleteConfirm(note.id)} className="text-[var(--status-error)]">
                  <Trash2 className="h-4 w-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <p className="text-xs text-[var(--text-muted)] line-clamp-3 mb-3 leading-relaxed">
          {note.content}
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          {note.is_pinned && (
            <Badge variant="default" className="text-[10px] gap-1">
              <Pin className="h-2.5 w-2.5" /> Pinned
            </Badge>
          )}
          {note.category && (
            <Badge variant="secondary" className="text-[10px]">{note.category}</Badge>
          )}
          {note.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="outline" className="text-[10px]">{tag}</Badge>
          ))}
          <span className="ml-auto text-[10px] text-[var(--text-muted)]">
            {formatDate(note.updated_at)}
          </span>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">My Notes</h1>
          <p className="text-sm text-[var(--text-muted)]">{notes.length} notes · {pinnedNotes.length} pinned</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> New Note
        </Button>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
          <Input placeholder="Search notes..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {NOTE_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Notes Grid */}
      {notes.length === 0 ? (
        <div className="py-20 text-center">
          <FileText className="h-12 w-12 text-[var(--text-muted)] mx-auto mb-4" />
          <p className="text-[var(--text-secondary)] font-medium">No notes yet</p>
          <p className="text-sm text-[var(--text-muted)] mt-1">Start capturing your thoughts and ideas</p>
          <Button onClick={openCreate} className="mt-4">
            <Plus className="h-4 w-4" /> Create First Note
          </Button>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-[var(--text-secondary)]">No notes match your search</p>
        </div>
      ) : (
        <>
          {pinnedNotes.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Pin className="h-3 w-3" /> Pinned
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {pinnedNotes.map((note) => <NoteCard key={note.id} note={note} />)}
              </div>
            </div>
          )}
          {unpinnedNotes.length > 0 && (
            <div>
              {pinnedNotes.length > 0 && (
                <h2 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">
                  All Notes
                </h2>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {unpinnedNotes.map((note) => <NoteCard key={note.id} note={note} />)}
              </div>
            </div>
          )}
        </>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingNote ? "Edit Note" : "New Note"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input {...register("title")} placeholder="Note title..." />
              {errors.title && <p className="text-xs text-[var(--status-error)]">{errors.title.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Content *</Label>
              <Textarea {...register("content")} placeholder="Write your note here..." rows={8} />
              {errors.content && <p className="text-xs text-[var(--status-error)]">{errors.content.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select defaultValue={editingNote?.category || ""} onValueChange={(v) => setValue("category", v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    {NOTE_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Tags (comma-separated)</Label>
                <Input {...register("tags")} placeholder="e.g. ideas, review..." />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit">{editingNote ? "Save Changes" : "Create Note"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Note Dialog */}
      <Dialog open={!!viewNote} onOpenChange={() => setViewNote(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg">{viewNote?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              {viewNote?.category && <Badge variant="secondary">{viewNote.category}</Badge>}
              {viewNote?.tags.map((tag) => <Badge key={tag} variant="outline">{tag}</Badge>)}
            </div>
            <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap leading-relaxed">
              {viewNote?.content}
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              Last updated: {viewNote && formatDate(viewNote.updated_at)}
            </p>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => { setViewNote(null); if (viewNote) openEdit(viewNote) }}>
              <Edit className="h-4 w-4" /> Edit
            </Button>
            <Button variant="destructive" onClick={() => { if (viewNote) setDeleteConfirm(viewNote.id); setViewNote(null) }}>
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete Note</DialogTitle></DialogHeader>
          <p className="text-sm text-[var(--text-secondary)]">This will permanently delete this note.</p>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
