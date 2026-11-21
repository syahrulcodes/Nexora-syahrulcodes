"use client"

import { useState, useMemo } from "react"
import {
  Plus, Target, Edit, Trash2, CheckCircle2, Circle,
  BookOpen, ExternalLink, MoreHorizontal, Flag
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAppStore } from "@/store/useAppStore"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { cn, formatDate } from "@/lib/utils"
import type { Goal, Milestone, LearningItem, GoalStatus } from "@/types"

const GOAL_CATEGORIES = ["Career", "Health", "Finance", "Learning", "Personal", "Relationship", "Other"]
const LEARNING_CATEGORIES = ["Programming", "Design", "Language", "Business", "Science", "Arts", "Other"]

const goalSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  target_date: z.string().optional(),
  progress: z.number().min(0).max(100),
  status: z.enum(["not_started", "in_progress", "completed"]),
})

const learningSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  resource_url: z.string().optional(),
  progress: z.number().min(0).max(100),
  status: z.enum(["not_started", "in_progress", "completed"]),
})

const milestoneSchema = z.object({
  title: z.string().min(1, "Title is required"),
  due_date: z.string().optional(),
})

type GoalFormData = z.infer<typeof goalSchema>
type LearningFormData = z.infer<typeof learningSchema>
type MilestoneFormData = z.infer<typeof milestoneSchema>

const statusConfig = {
  not_started: { label: "Not Started", variant: "secondary" as const, color: "text-[var(--text-muted)]" },
  in_progress: { label: "In Progress", variant: "info" as const, color: "text-[var(--accent-blue)]" },
  completed: { label: "Completed", variant: "success" as const, color: "text-[var(--status-success)]" },
}

export default function GoalsPage() {
  const { goals, addGoal, updateGoal, deleteGoal, milestones, addMilestone, updateMilestone, deleteMilestone, learningItems, addLearningItem, updateLearningItem, deleteLearningItem } = useAppStore()
  const [goalDialogOpen, setGoalDialogOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [deleteGoalConfirm, setDeleteGoalConfirm] = useState<string | null>(null)
  const [milestoneDialogOpen, setMilestoneDialogOpen] = useState(false)
  const [milestoneGoalId, setMilestoneGoalId] = useState<string | null>(null)
  const [learningDialogOpen, setLearningDialogOpen] = useState(false)
  const [editingLearning, setEditingLearning] = useState<LearningItem | null>(null)

  const goalForm = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema) as any,
    defaultValues: { status: "not_started", progress: 0 },
  })

  const learningForm = useForm<LearningFormData>({
    resolver: zodResolver(learningSchema) as any,
    defaultValues: { status: "not_started", progress: 0 },
  })

  const milestoneForm = useForm<MilestoneFormData>({ resolver: zodResolver(milestoneSchema) })

  const totalGoals = goals.length
  const completedGoals = goals.filter((g) => g.status === "completed").length
  const inProgressGoals = goals.filter((g) => g.status === "in_progress").length

  const openCreateGoal = () => {
    setEditingGoal(null)
    goalForm.reset({ status: "not_started", progress: 0 })
    setGoalDialogOpen(true)
  }

  const openEditGoal = (goal: Goal) => {
    setEditingGoal(goal)
    goalForm.setValue("title", goal.title)
    goalForm.setValue("description", goal.description || "")
    goalForm.setValue("category", goal.category)
    goalForm.setValue("target_date", goal.target_date || "")
    goalForm.setValue("progress", goal.progress)
    goalForm.setValue("status", goal.status)
    setGoalDialogOpen(true)
  }

  const onGoalSubmit = (data: GoalFormData) => {
    if (editingGoal) {
      updateGoal(editingGoal.id, { ...data, description: data.description || null, target_date: data.target_date || null, updated_at: new Date().toISOString() })
      toast.success("Goal updated")
    } else {
      addGoal({
        id: crypto.randomUUID(), user_id: "",
        title: data.title, description: data.description || null, category: data.category,
        target_date: data.target_date || null, progress: data.progress, status: data.status,
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      })
      toast.success("Goal created!")
    }
    setGoalDialogOpen(false)
    goalForm.reset()
  }

  const onLearningSubmit = (data: LearningFormData) => {
    if (editingLearning) {
      updateLearningItem(editingLearning.id, { ...data, description: data.description || null, resource_url: data.resource_url || null, updated_at: new Date().toISOString() })
      toast.success("Learning item updated")
    } else {
      addLearningItem({
        id: crypto.randomUUID(), user_id: "",
        title: data.title, description: data.description || null, category: data.category,
        resource_url: data.resource_url || null, progress: data.progress, status: data.status,
        notes: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      })
      toast.success("Learning item added!")
    }
    setLearningDialogOpen(false)
    learningForm.reset()
  }

  const onMilestoneSubmit = (data: MilestoneFormData) => {
    if (!milestoneGoalId) return
    addMilestone({
      id: crypto.randomUUID(), goal_id: milestoneGoalId, user_id: "",
      title: data.title, is_completed: false, due_date: data.due_date || null,
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    })
    toast.success("Milestone added!")
    milestoneForm.reset()
    setMilestoneDialogOpen(false)
  }

  const toggleMilestone = (milestone: Milestone) => {
    updateMilestone(milestone.id, { is_completed: !milestone.is_completed, updated_at: new Date().toISOString() })
    toast.success(milestone.is_completed ? "Milestone reopened" : "Milestone completed! ✓")
  }

  const updateProgress = (id: string, type: "goal" | "learning", newProgress: number) => {
    if (type === "goal") {
      updateGoal(id, { progress: newProgress, status: newProgress === 100 ? "completed" : newProgress > 0 ? "in_progress" : "not_started", updated_at: new Date().toISOString() })
    } else {
      updateLearningItem(id, { progress: newProgress, status: newProgress === 100 ? "completed" : newProgress > 0 ? "in_progress" : "not_started", updated_at: new Date().toISOString() })
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Goals & Learning</h1>
          <p className="text-sm text-[var(--text-muted)]">{completedGoals}/{totalGoals} goals completed</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Goals", value: totalGoals, color: "text-[var(--accent-sage)]" },
          { label: "In Progress", value: inProgressGoals, color: "text-[var(--accent-blue)]" },
          { label: "Completed", value: completedGoals, color: "text-[var(--status-success)]" },
          { label: "Learning Items", value: learningItems.length, color: "text-[var(--accent-beige)]" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 text-center">
              <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="goals">
        <TabsList>
          <TabsTrigger value="goals">Goals ({totalGoals})</TabsTrigger>
          <TabsTrigger value="learning">Learning ({learningItems.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="goals" className="space-y-4 mt-4">
          <div className="flex justify-end">
            <Button onClick={openCreateGoal}>
              <Plus className="h-4 w-4" /> New Goal
            </Button>
          </div>
          {goals.length === 0 ? (
            <div className="py-20 text-center">
              <Target className="h-12 w-12 text-[var(--text-muted)] mx-auto mb-4" />
              <p className="text-[var(--text-secondary)] font-medium">No goals yet</p>
              <p className="text-sm text-[var(--text-muted)] mt-1">Set ambitious goals and track your progress</p>
              <Button onClick={openCreateGoal} className="mt-4"><Plus className="h-4 w-4" /> Create First Goal</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {goals.map((goal) => {
                const goalMilestones = milestones.filter((m) => m.goal_id === goal.id)
                const completedMs = goalMilestones.filter((m) => m.is_completed).length
                const cfg = statusConfig[goal.status]
                return (
                  <Card key={goal.id} className="group">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-semibold text-[var(--text-primary)]">{goal.title}</h3>
                            <Badge variant={cfg.variant} className="text-[10px]">{cfg.label}</Badge>
                          </div>
                          {goal.description && (
                            <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-2">{goal.description}</p>
                          )}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm" className="opacity-0 group-hover:opacity-100 h-7 w-7">
                              <MoreHorizontal className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditGoal(goal)}><Edit className="h-4 w-4" /> Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setMilestoneGoalId(goal.id); milestoneForm.reset(); setMilestoneDialogOpen(true) }}>
                              <Flag className="h-4 w-4" /> Add Milestone
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setDeleteGoalConfirm(goal.id)} className="text-[var(--status-error)]">
                              <Trash2 className="h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="text-[10px]">{goal.category}</Badge>
                        {goal.target_date && (
                          <span className="text-xs text-[var(--text-muted)]">Target: {formatDate(goal.target_date)}</span>
                        )}
                      </div>

                      {/* Progress */}
                      <div className="space-y-1.5 mb-3">
                        <div className="flex justify-between text-xs text-[var(--text-muted)]">
                          <span>Progress</span>
                          <span>{goal.progress}%</span>
                        </div>
                        <Progress value={goal.progress} className="h-1.5" />
                        <input
                          type="range"
                          min={0}
                          max={100}
                          step={5}
                          value={goal.progress}
                          onChange={(e) => updateProgress(goal.id, "goal", parseInt(e.target.value))}
                          className="w-full h-1 accent-[var(--accent-sage)] cursor-pointer"
                        />
                      </div>

                      {/* Milestones */}
                      {goalMilestones.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-[var(--text-muted)]">
                            Milestones ({completedMs}/{goalMilestones.length})
                          </p>
                          {goalMilestones.map((ms) => (
                            <div
                              key={ms.id}
                              className="flex items-center gap-2 cursor-pointer group/ms"
                              onClick={() => toggleMilestone(ms)}
                            >
                              {ms.is_completed
                                ? <CheckCircle2 className="h-4 w-4 text-[var(--status-success)] shrink-0" />
                                : <Circle className="h-4 w-4 text-[var(--border)] shrink-0 group-hover/ms:text-[var(--accent-sage)]" />
                              }
                              <span className={cn(
                                "text-xs flex-1",
                                ms.is_completed ? "line-through text-[var(--text-muted)]" : "text-[var(--text-secondary)]"
                              )}>
                                {ms.title}
                              </span>
                              <button
                                onClick={(e) => { e.stopPropagation(); deleteMilestone(ms.id) }}
                                className="opacity-0 group-hover/ms:opacity-100 text-[var(--text-muted)] hover:text-[var(--status-error)]"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="learning" className="space-y-4 mt-4">
          <div className="flex justify-end">
            <Button onClick={() => { setEditingLearning(null); learningForm.reset({ status: "not_started", progress: 0 }); setLearningDialogOpen(true) }}>
              <Plus className="h-4 w-4" /> Add Learning Item
            </Button>
          </div>
          {learningItems.length === 0 ? (
            <div className="py-20 text-center">
              <BookOpen className="h-12 w-12 text-[var(--text-muted)] mx-auto mb-4" />
              <p className="text-[var(--text-secondary)] font-medium">No learning items yet</p>
              <p className="text-sm text-[var(--text-muted)] mt-1">Track your learning journey</p>
              <Button onClick={() => { setEditingLearning(null); learningForm.reset({ status: "not_started", progress: 0 }); setLearningDialogOpen(true) }} className="mt-4">
                <Plus className="h-4 w-4" /> Add First Item
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {learningItems.map((item) => {
                const cfg = statusConfig[item.status]
                return (
                  <Card key={item.id} className="group">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-semibold text-[var(--text-primary)]">{item.title}</h3>
                            <Badge variant={cfg.variant} className="text-[10px]">{cfg.label}</Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-[10px]">{item.category}</Badge>
                            {item.resource_url && (
                              <a href={item.resource_url} target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--accent-sage)] hover:underline flex items-center gap-0.5">
                                <ExternalLink className="h-3 w-3" /> Resource
                              </a>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon-sm" className="h-7 w-7" onClick={() => {
                            setEditingLearning(item)
                            learningForm.setValue("title", item.title)
                            learningForm.setValue("description", item.description || "")
                            learningForm.setValue("category", item.category)
                            learningForm.setValue("resource_url", item.resource_url || "")
                            learningForm.setValue("progress", item.progress)
                            learningForm.setValue("status", item.status)
                            setLearningDialogOpen(true)
                          }}>
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon-sm" className="h-7 w-7" onClick={() => { deleteLearningItem(item.id); toast.success("Deleted") }}>
                            <Trash2 className="h-3.5 w-3.5 text-[var(--status-error)]" />
                          </Button>
                        </div>
                      </div>
                      {item.description && <p className="text-xs text-[var(--text-muted)] mb-3">{item.description}</p>}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs text-[var(--text-muted)]">
                          <span>Progress</span><span>{item.progress}%</span>
                        </div>
                        <Progress value={item.progress} className="h-1.5" />
                        <input
                          type="range" min={0} max={100} step={5} value={item.progress}
                          onChange={(e) => updateProgress(item.id, "learning", parseInt(e.target.value))}
                          className="w-full h-1 accent-[var(--accent-sage)] cursor-pointer"
                        />
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Goal Dialog */}
      <Dialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingGoal ? "Edit Goal" : "New Goal"}</DialogTitle></DialogHeader>
          <form onSubmit={goalForm.handleSubmit(onGoalSubmit as any)} className="space-y-4">
            <div className="space-y-1.5"><Label>Title *</Label><Input {...goalForm.register("title")} placeholder="Goal title..." /></div>
            <div className="space-y-1.5"><Label>Description</Label><Textarea {...goalForm.register("description")} rows={2} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Category *</Label>
                <Select defaultValue={editingGoal?.category || ""} onValueChange={(v) => goalForm.setValue("category", v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>{GOAL_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Target Date</Label><Input type="date" {...goalForm.register("target_date")} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select defaultValue="not_started" onValueChange={(v) => goalForm.setValue("status", v as GoalStatus)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not_started">Not Started</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Progress: {goalForm.watch("progress")}%</Label>
                <input type="range" min={0} max={100} step={5} {...goalForm.register("progress", { valueAsNumber: true })} className="w-full accent-[var(--accent-sage)]" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setGoalDialogOpen(false)}>Cancel</Button>
              <Button type="submit">{editingGoal ? "Save" : "Create Goal"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Learning Dialog */}
      <Dialog open={learningDialogOpen} onOpenChange={setLearningDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingLearning ? "Edit Learning Item" : "Add Learning Item"}</DialogTitle></DialogHeader>
          <form onSubmit={learningForm.handleSubmit(onLearningSubmit as any)} className="space-y-4">
            <div className="space-y-1.5"><Label>Title *</Label><Input {...learningForm.register("title")} placeholder="e.g. Next.js Mastery Course" /></div>
            <div className="space-y-1.5"><Label>Description</Label><Textarea {...learningForm.register("description")} rows={2} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Category *</Label>
                <Select defaultValue={editingLearning?.category || ""} onValueChange={(v) => learningForm.setValue("category", v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>{LEARNING_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select defaultValue="not_started" onValueChange={(v) => learningForm.setValue("status", v as "not_started" | "in_progress" | "completed")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not_started">Not Started</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5"><Label>Resource URL</Label><Input {...learningForm.register("resource_url")} placeholder="https://..." /></div>
            <div className="space-y-1.5">
              <Label>Progress: {learningForm.watch("progress")}%</Label>
              <input type="range" min={0} max={100} step={5} {...learningForm.register("progress", { valueAsNumber: true })} className="w-full accent-[var(--accent-sage)]" />
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setLearningDialogOpen(false)}>Cancel</Button>
              <Button type="submit">{editingLearning ? "Save" : "Add Item"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Milestone Dialog */}
      <Dialog open={milestoneDialogOpen} onOpenChange={setMilestoneDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Add Milestone</DialogTitle></DialogHeader>
          <form onSubmit={milestoneForm.handleSubmit(onMilestoneSubmit)} className="space-y-4">
            <div className="space-y-1.5"><Label>Title *</Label><Input {...milestoneForm.register("title")} placeholder="Milestone title..." /></div>
            <div className="space-y-1.5"><Label>Due Date</Label><Input type="date" {...milestoneForm.register("due_date")} /></div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setMilestoneDialogOpen(false)}>Cancel</Button>
              <Button type="submit">Add Milestone</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteGoalConfirm} onOpenChange={() => setDeleteGoalConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete Goal</DialogTitle></DialogHeader>
          <p className="text-sm text-[var(--text-secondary)]">This will delete the goal and all its milestones.</p>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDeleteGoalConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => { if (deleteGoalConfirm) { deleteGoal(deleteGoalConfirm); setDeleteGoalConfirm(null); toast.success("Goal deleted") } }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Missing X import
function X({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}
