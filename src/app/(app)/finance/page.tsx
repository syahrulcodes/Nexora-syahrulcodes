"use client"

import { useState, useMemo } from "react"
import {
  Plus, Search, TrendingUp, TrendingDown, Wallet, Edit,
  Trash2, Filter, MoreHorizontal, ArrowUpRight, ArrowDownLeft
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useAppStore } from "@/store/useAppStore"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { formatCurrency, cn } from "@/lib/utils"
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, PieChart, Pie, Cell, Legend, LineChart, Line
} from "recharts"
import type { Transaction } from "@/types"

const CATEGORIES_INCOME = ["Salary", "Freelance", "Investment", "Business", "Gift", "Other Income"]
const CATEGORIES_EXPENSE = ["Food & Drink", "Transportation", "Shopping", "Bills", "Entertainment", "Health", "Education", "Housing", "Other"]

const transactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.number().min(1, "Amount must be greater than 0"),
  category: z.string().min(1, "Category is required"),
  description: z.string().min(1, "Description is required"),
  date: z.string().min(1, "Date is required"),
  payment_method: z.string().optional(),
})

type TransactionForm = z.infer<typeof transactionSchema>

const CHART_COLORS = ["#A8B8AE", "#A9BAC8", "#D4C8B8", "#8FB8B0", "#7FAF8A", "#C8A97A"]

export default function FinancePage() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useAppStore()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTx, setEditingTx] = useState<Transaction | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterCategory, setFilterCategory] = useState("all")
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"))

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<TransactionForm>({
    resolver: zodResolver(transactionSchema),
    defaultValues: { type: "expense", date: format(new Date(), "yyyy-MM-dd") },
  })
  const watchType = watch("type")

  const monthDate = new Date(selectedMonth + "-01")
  const monthStart = startOfMonth(monthDate)
  const monthEnd = endOfMonth(monthDate)

  const monthlyTransactions = useMemo(() =>
    transactions.filter((t) => {
      const d = new Date(t.date)
      return d >= monthStart && d <= monthEnd
    }), [transactions, selectedMonth])

  const monthlyIncome = monthlyTransactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0)
  const monthlyExpenses = monthlyTransactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0)
  const balance = monthlyIncome - monthlyExpenses

  const filteredTx = useMemo(() =>
    monthlyTransactions.filter((t) => {
      const matchSearch = !searchQuery || t.description.toLowerCase().includes(searchQuery.toLowerCase()) || t.category.toLowerCase().includes(searchQuery.toLowerCase())
      const matchType = filterType === "all" || t.type === filterType
      const matchCat = filterCategory === "all" || t.category === filterCategory
      return matchSearch && matchType && matchCat
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [monthlyTransactions, searchQuery, filterType, filterCategory]
  )

  // 6-month trend
  const trendData = Array.from({ length: 6 }, (_, i) => {
    const m = subMonths(new Date(), 5 - i)
    const ms = startOfMonth(m)
    const me = endOfMonth(m)
    const txs = transactions.filter((t) => new Date(t.date) >= ms && new Date(t.date) <= me)
    return {
      month: format(m, "MMM"),
      income: txs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0),
      expenses: txs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0),
    }
  })

  // Category distribution
  const expenseByCategory = useMemo(() => {
    const map: Record<string, number> = {}
    monthlyTransactions.filter((t) => t.type === "expense").forEach((t) => {
      map[t.category] = (map[t.category] || 0) + t.amount
    })
    return Object.entries(map).map(([name, value]) => ({ name, value }))
  }, [monthlyTransactions])

  const allCategories = [...new Set(transactions.map((t) => t.category))]

  const openCreate = (type: "income" | "expense" = "expense") => {
    setEditingTx(null)
    reset({ type, date: format(new Date(), "yyyy-MM-dd") })
    setDialogOpen(true)
  }

  const openEdit = (tx: Transaction) => {
    setEditingTx(tx)
    setValue("type", tx.type)
    setValue("amount", tx.amount)
    setValue("category", tx.category)
    setValue("description", tx.description)
    setValue("date", tx.date)
    setValue("payment_method", tx.payment_method || "")
    setDialogOpen(true)
  }

  const onSubmit = (data: TransactionForm) => {
    if (editingTx) {
      updateTransaction(editingTx.id, { ...data, updated_at: new Date().toISOString() })
      toast.success("Transaction updated")
    } else {
      addTransaction({
        id: crypto.randomUUID(),
        user_id: "",
        ...data,
        payment_method: data.payment_method || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      toast.success("Transaction recorded!")
    }
    setDialogOpen(false)
    reset()
  }

  const handleDelete = (id: string) => {
    deleteTransaction(id)
    setDeleteConfirm(null)
    toast.success("Transaction deleted")
  }

  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const d = subMonths(new Date(), i)
    return { value: format(d, "yyyy-MM"), label: format(d, "MMMM yyyy") }
  })

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Finance</h1>
          <p className="text-sm text-[var(--text-muted)]">Track income, expenses, and financial trends</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => openCreate("income")}>
            <ArrowUpRight className="h-4 w-4 text-[var(--status-success)]" /> Add Income
          </Button>
          <Button onClick={() => openCreate("expense")}>
            <ArrowDownLeft className="h-4 w-4" /> Add Expense
          </Button>
        </div>
      </div>

      {/* Month Selector */}
      <div className="flex items-center gap-3">
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {monthOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-[var(--text-muted)]">{monthlyTransactions.length} transactions</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[var(--text-muted)]">Total Income</p>
                <p className="text-xl font-bold text-[var(--status-success)] mt-1">{formatCurrency(monthlyIncome)}</p>
              </div>
              <div className="p-2 rounded-lg bg-[var(--status-success)]/10">
                <TrendingUp className="h-5 w-5 text-[var(--status-success)]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[var(--text-muted)]">Total Expenses</p>
                <p className="text-xl font-bold text-[var(--status-error)] mt-1">{formatCurrency(monthlyExpenses)}</p>
              </div>
              <div className="p-2 rounded-lg bg-[var(--status-error)]/10">
                <TrendingDown className="h-5 w-5 text-[var(--status-error)]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[var(--text-muted)]">Net Balance</p>
                <p className={cn(
                  "text-xl font-bold mt-1",
                  balance >= 0 ? "text-[var(--status-success)]" : "text-[var(--status-error)]"
                )}>
                  {formatCurrency(balance)}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-[var(--accent-sage)]/10">
                <Wallet className="h-5 w-5 text-[var(--accent-sage)]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">6-Month Trend</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {transactions.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-sm text-[var(--text-muted)]">
                No data to display
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={trendData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                  <Tooltip
                    contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px", color: "var(--text-primary)" }}
                    formatter={(value: unknown) => [formatCurrency(value as number), ""]}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }} />
                  <Bar dataKey="income" fill="var(--status-success)" radius={[3, 3, 0, 0]} name="Income" />
                  <Bar dataKey="expenses" fill="var(--status-error)" radius={[3, 3, 0, 0]} name="Expenses" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Expense by Category</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {expenseByCategory.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-sm text-[var(--text-muted)]">
                No expense data this month
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={expenseByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                    paddingAngle={3}
                  >
                    {expenseByCategory.map((_, index) => (
                      <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px", color: "var(--text-primary)" }}
                    formatter={(value: unknown) => [formatCurrency(value as number), ""]}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
              <Input placeholder="Search transactions..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-32"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {allCategories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="pt-0 p-0">
          {filteredTx.length === 0 ? (
            <div className="py-16 text-center">
              <Wallet className="h-10 w-10 text-[var(--text-muted)] mx-auto mb-3" />
              <p className="text-[var(--text-secondary)] font-medium">No transactions found</p>
              <p className="text-sm text-[var(--text-muted)] mt-1">Start recording your financial activity</p>
              <Button onClick={() => openCreate()} size="sm" className="mt-4">
                <Plus className="h-4 w-4" /> Add Transaction
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {filteredTx.map((tx) => (
                <div key={tx.id} className="flex items-center gap-3 px-6 py-3.5 hover:bg-[var(--bg-elevated)] transition-colors group">
                  <div className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center shrink-0",
                    tx.type === "income" ? "bg-[var(--status-success)]/15" : "bg-[var(--status-error)]/15"
                  )}>
                    {tx.type === "income"
                      ? <ArrowUpRight className="h-4 w-4 text-[var(--status-success)]" />
                      : <ArrowDownLeft className="h-4 w-4 text-[var(--status-error)]" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">{tx.description}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-[var(--text-muted)]">{tx.category}</span>
                      <span className="text-xs text-[var(--text-muted)]">·</span>
                      <span className="text-xs text-[var(--text-muted)]">{format(new Date(tx.date), "d MMM yyyy")}</span>
                      {tx.payment_method && (
                        <>
                          <span className="text-xs text-[var(--text-muted)]">·</span>
                          <span className="text-xs text-[var(--text-muted)]">{tx.payment_method}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <span className={cn(
                    "text-sm font-semibold shrink-0",
                    tx.type === "income" ? "text-[var(--status-success)]" : "text-[var(--status-error)]"
                  )}>
                    {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount)}
                  </span>
                  <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity shrink-0">
                    <Button variant="ghost" size="icon-sm" onClick={() => openEdit(tx)}>
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => setDeleteConfirm(tx.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-[var(--status-error)]" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTx ? "Edit Transaction" : "Record Transaction"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <div className="flex gap-2">
                {(["income", "expense"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setValue("type", t)}
                    className={cn(
                      "flex-1 py-2 rounded-lg text-sm font-medium border transition-all capitalize",
                      watchType === t
                        ? t === "income"
                          ? "border-[var(--status-success)] bg-[var(--status-success)]/15 text-[var(--status-success)]"
                          : "border-[var(--status-error)] bg-[var(--status-error)]/15 text-[var(--status-error)]"
                        : "border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Amount (IDR) *</Label>
              <Input
                type="number"
                placeholder="0"
                {...register("amount", { valueAsNumber: true })}
              />
              {errors.amount && <p className="text-xs text-[var(--status-error)]">{errors.amount.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Description *</Label>
              <Input {...register("description")} placeholder="What was this for?" />
              {errors.description && <p className="text-xs text-[var(--status-error)]">{errors.description.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Category *</Label>
                <Select onValueChange={(v) => setValue("category", v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    {(watchType === "income" ? CATEGORIES_INCOME : CATEGORIES_EXPENSE).map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-xs text-[var(--status-error)]">{errors.category.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Date *</Label>
                <Input type="date" {...register("date")} />
                {errors.date && <p className="text-xs text-[var(--status-error)]">{errors.date.message}</p>}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Payment Method</Label>
              <Select onValueChange={(v) => setValue("payment_method", v)}>
                <SelectTrigger><SelectValue placeholder="Optional..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Debit Card">Debit Card</SelectItem>
                  <SelectItem value="Credit Card">Credit Card</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="E-Wallet">E-Wallet</SelectItem>
                  <SelectItem value="QRIS">QRIS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit">{editingTx ? "Save Changes" : "Record Transaction"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete Transaction</DialogTitle></DialogHeader>
          <p className="text-sm text-[var(--text-secondary)]">This will permanently delete this transaction.</p>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
