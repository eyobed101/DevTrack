"use client"

import React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Plus, MoreVertical, Clock, MessageSquare, Flag, Calendar, User, Check, X, Trash2, ListChecks, Tag, Send } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { format } from "date-fns"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"

// Enums matching your schema
enum TaskStatus {
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  DONE = "DONE",
  BLOCKED = "BLOCKED"
}

enum TaskPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL"
}

enum TaskLabelColor {
  BLUE = "BLUE",
  GREEN = "GREEN",
  RED = "RED",
  YELLOW = "YELLOW",
  PURPLE = "PURPLE",
  GRAY = "GRAY"
}

// Types matching your entities
type User = {
  id: string
  name: string
  email: string
  avatar?: string
}

type Project = {
  id: string
  name: string
}

type Label = {
  id: string
  name: string
  color: TaskLabelColor
  project: Project
}

type Subtask = {
  id: string
  title: string
  isCompleted: boolean
  createdAt: Date
}

type Comment = {
  id: string
  content: string
  author: User
  createdAt: Date
}

type TimeTracking = {
  id: string
  duration: number
  startedAt: Date
  endedAt: Date | null
}

type Task = {
  id: string
  title: string
  description: string | null
  project: Project
  assignee: User | null
  reporter: User
  status: TaskStatus
  priority: TaskPriority
  dueDate: Date | null
  estimatedHours: number | null
  actualHours: number | null
  subtasks: Subtask[]
  comments: Comment[]
  labels: Label[]
  timeEntries: TimeTracking[]
  createdAt: Date
  updatedAt: Date
}

// Mock data based on your schema
const mockUsers: User[] = [
  {
    id: "1",
    name: "Alex Johnson",
    email: "alex@example.com",
    avatar: "/avatars/01.png"
  },
  {
    id: "2",
    name: "Sam Lee",
    email: "sam@example.com",
    avatar: "/avatars/02.png"
  },
  {
    id: "3",
    name: "Jordan Smith",
    email: "jordan@example.com",
    avatar: "/avatars/03.png"
  }
]

const mockProjects: Project[] = [
  { id: "1", name: "Website Redesign" },
  { id: "2", name: "Mobile App" },
  { id: "3", name: "API Development" }
]

const mockLabels: Label[] = [
  { id: "1", name: "Backend", color: TaskLabelColor.BLUE, project: mockProjects[0] },
  { id: "2", name: "Security", color: TaskLabelColor.RED, project: mockProjects[0] },
  { id: "3", name: "Frontend", color: TaskLabelColor.GREEN, project: mockProjects[0] },
  { id: "4", name: "Bug", color: TaskLabelColor.RED, project: mockProjects[1] },
  { id: "5", name: "Feature", color: TaskLabelColor.BLUE, project: mockProjects[1] }
]

const mockTasks: Task[] = [
  {
    id: "1",
    title: "Implement user authentication",
    description: "Set up JWT authentication for the API",
    project: mockProjects[0],
    assignee: mockUsers[0],
    reporter: mockUsers[1],
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.HIGH,
    dueDate: new Date("2023-12-15"),
    estimatedHours: 8,
    actualHours: 5.5,
    subtasks: [
      { id: "1-1", title: "Design auth flow", isCompleted: true, createdAt: new Date("2023-11-01") },
      { id: "1-2", title: "Implement login endpoint", isCompleted: true, createdAt: new Date("2023-11-05") },
      { id: "1-3", title: "Setup JWT tokens", isCompleted: false, createdAt: new Date("2023-11-10") },
    ],
    comments: [
      {
        id: "1",
        content: "Make sure to include refresh token functionality",
        author: mockUsers[1],
        createdAt: new Date("2023-11-02")
      }
    ],
    labels: [mockLabels[0], mockLabels[1]],
    timeEntries: [
      {
        id: "1",
        duration: 2.5,
        startedAt: new Date("2023-11-10T09:00:00"),
        endedAt: new Date("2023-11-10T11:30:00")
      },
      {
        id: "2",
        duration: 3,
        startedAt: new Date("2023-11-11T10:00:00"),
        endedAt: new Date("2023-11-11T13:00:00")
      }
    ],
    createdAt: new Date("2023-11-01"),
    updatedAt: new Date("2023-11-11")
  },
  {
    id: "2",
    title: "Design landing page",
    description: "Create new landing page design with updated branding",
    project: mockProjects[0],
    assignee: mockUsers[2],
    reporter: mockUsers[0],
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    dueDate: new Date("2023-12-20"),
    estimatedHours: 12,
    actualHours: null,
    subtasks: [
      { id: "2-1", title: "Create wireframes", isCompleted: false, createdAt: new Date("2023-11-15") },
      { id: "2-2", title: "Design mobile version", isCompleted: false, createdAt: new Date("2023-11-15") },
    ],
    comments: [],
    labels: [mockLabels[2]],
    timeEntries: [],
    createdAt: new Date("2023-11-15"),
    updatedAt: new Date("2023-11-15")
  }
]

export default function TasksPage() {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>(mockTasks)
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [isSubtaskDialogOpen, setIsSubtaskDialogOpen] = useState(false)
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false)
  const [isLabelDialogOpen, setIsLabelDialogOpen] = useState(false)
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [currentTask, setCurrentTask] = useState<Task | null>(null)
  const [filter, setFilter] = useState<"all" | "assigned" | "reported">("all")
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("")
  const [newCommentContent, setNewCommentContent] = useState("")
  const [selectedLabels, setSelectedLabels] = useState<Label[]>([])
  const [selectedAssignee, setSelectedAssignee] = useState<User | null>(null)

  // Mock current user
  const currentUser: User = mockUsers[0]

  const filteredTasks = tasks.filter(task => {
    if (filter === "assigned") return task.assignee?.id === currentUser.id
    if (filter === "reported") return task.reporter.id === currentUser.id
    return true
  })

  const isTaskOwner = (task: Task) => task.reporter.id === currentUser.id

  const handleStatusChange = (taskId: string, status: TaskStatus) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, status } : task
    ))
  }

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)

    const newTask: Task = {
      id: currentTask?.id || `task-${Math.random().toString(36).substr(2, 9)}`,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      project: mockProjects.find(p => p.id === formData.get('project')) || mockProjects[0],
      assignee: null, // Will be set separately
      reporter: currentUser,
      status: TaskStatus.TODO,
      priority: formData.get('priority') as TaskPriority,
      dueDate: formData.get('dueDate') ? new Date(formData.get('dueDate') as string) : null,
      estimatedHours: formData.get('estimatedHours') ? parseFloat(formData.get('estimatedHours') as string) : null,
      actualHours: null,
      subtasks: [],
      comments: [],
      labels: [],
      timeEntries: [],
      createdAt: currentTask?.createdAt || new Date(),
      updatedAt: new Date()
    }

    if (currentTask) {
      // Preserve existing relationships when updating
      newTask.assignee = currentTask.assignee
      newTask.subtasks = currentTask.subtasks
      newTask.comments = currentTask.comments
      newTask.labels = currentTask.labels
      newTask.timeEntries = currentTask.timeEntries
      
      setTasks(tasks.map(t => t.id === currentTask.id ? newTask : t))
      toast.success("Task updated successfully")
    } else {
      setTasks([...tasks, newTask])
      toast.success("Task created successfully")
    }
    setIsTaskDialogOpen(false)
    setCurrentTask(null)
  }

  const handleDeleteTask = (taskId: string) => {
    if (!tasks.some(t => t.id === taskId && isTaskOwner(t))) {
      toast.error("Only task creators can delete tasks")
      return
    }
    setTasks(tasks.filter(t => t.id !== taskId))
    toast.success("Task deleted successfully")
  }

  const handleAddSubtask = (taskId: string) => {
    if (!newSubtaskTitle.trim()) {
      toast.error("Subtask title cannot be empty")
      return
    }

    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const newSubtask: Subtask = {
          id: `subtask-${Math.random().toString(36).substr(2, 9)}`,
          title: newSubtaskTitle,
          isCompleted: false,
          createdAt: new Date()
        }
        return {
          ...task,
          subtasks: [...task.subtasks, newSubtask]
        }
      }
      return task
    }))

    setNewSubtaskTitle("")
    setIsSubtaskDialogOpen(false)
    toast.success("Subtask added successfully")
  }

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          subtasks: task.subtasks.map(subtask =>
            subtask.id === subtaskId ? { ...subtask, isCompleted: !subtask.isCompleted } : subtask
          )
        }
      }
      return task
    }))
  }

  const handleAddComment = (taskId: string) => {
    if (!newCommentContent.trim()) {
      toast.error("Comment cannot be empty")
      return
    }

    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const newComment: Comment = {
          id: `comment-${Math.random().toString(36).substr(2, 9)}`,
          content: newCommentContent,
          author: currentUser,
          createdAt: new Date()
        }
        return {
          ...task,
          comments: [...task.comments, newComment]
        }
      }
      return task
    }))

    setNewCommentContent("")
    setIsCommentDialogOpen(false)
    toast.success("Comment added successfully")
  }

  const handleAssignTask = (taskId: string) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          assignee: selectedAssignee,
          updatedAt: new Date()
        }
      }
      return task
    }))

    setSelectedAssignee(null)
    setIsAssignDialogOpen(false)
    toast.success("Task assigned successfully")
  }

  const handleUpdateLabels = (taskId: string) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          labels: selectedLabels,
          updatedAt: new Date()
        }
      }
      return task
    }))

    setSelectedLabels([])
    setIsLabelDialogOpen(false)
    toast.success("Labels updated successfully")
  }

  const getPriorityBadge = (priority: TaskPriority) => {
    const variants = {
      [TaskPriority.LOW]: { label: "Low", variant: "outline", icon: <Flag className="h-3 w-3 mr-1 text-blue-500" /> },
      [TaskPriority.MEDIUM]: { label: "Medium", variant: "secondary", icon: <Flag className="h-3 w-3 mr-1 text-green-500" /> },
      [TaskPriority.HIGH]: { label: "High", variant: "destructive", icon: <Flag className="h-3 w-3 mr-1 text-orange-500" /> },
      [TaskPriority.CRITICAL]: { label: "Critical", variant: "destructive", icon: <Flag className="h-3 w-3 mr-1 text-red-500" /> }
    }

    const { label, variant, icon } = variants[priority]
    return (
      <Badge variant={variant as any} className="capitalize">
        {icon}
        {label}
      </Badge>
    )
  }

  const getStatusBadge = (status: TaskStatus) => {
    const variants = {
      [TaskStatus.TODO]: { label: "To Do", variant: "outline", icon: <Clock className="h-3 w-3 mr-1" /> },
      [TaskStatus.IN_PROGRESS]: { label: "In Progress", variant: "secondary", icon: <Clock className="h-3 w-3 mr-1" /> },
      [TaskStatus.DONE]: { label: "Done", variant: "default", icon: <Check className="h-3 w-3 mr-1" /> },
      [TaskStatus.BLOCKED]: { label: "Blocked", variant: "destructive", icon: <X className="h-3 w-3 mr-1" /> }
    }

    const { label, variant, icon } = variants[status]
    return (
      <Badge variant={variant as any} className="capitalize">
        {icon}
        {label}
      </Badge>
    )
  }

  const getLabelColor = (color: TaskLabelColor) => {
    const colors = {
      [TaskLabelColor.BLUE]: "bg-blue-100 text-blue-800 border-blue-200",
      [TaskLabelColor.GREEN]: "bg-green-100 text-green-800 border-green-200",
      [TaskLabelColor.RED]: "bg-red-100 text-red-800 border-red-200",
      [TaskLabelColor.YELLOW]: "bg-yellow-100 text-yellow-800 border-yellow-200",
      [TaskLabelColor.PURPLE]: "bg-purple-100 text-purple-800 border-purple-200",
      [TaskLabelColor.GRAY]: "bg-gray-100 text-gray-800 border-gray-200"
    }
    return colors[color]
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {/* Tasks Header */}
              <div className="flex justify-between items-center">
                <div className="flex gap-2 mx-6 mb-4">
                  <Button variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>
                    All Tasks
                  </Button>
                  <Button variant={filter === "assigned" ? "default" : "outline"} onClick={() => setFilter("assigned")}>
                    My Assigned Tasks
                  </Button>
                  <Button variant={filter === "reported" ? "default" : "outline"} onClick={() => setFilter("reported")}>
                    Tasks I Created
                  </Button>
                </div>
                
                <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setCurrentTask(null)} className="mr-6">
                      <Plus className="mr-2 h-4 w-4" /> New Task
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>{currentTask ? "Edit Task" : "Create New Task"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleTaskSubmit} className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right">
                          Title
                        </Label>
                        <Input
                          id="title"
                          name="title"
                          defaultValue={currentTask?.title || ""}
                          className="col-span-3"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">
                          Description
                        </Label>
                        <Textarea
                          id="description"
                          name="description"
                          defaultValue={currentTask?.description || ""}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="project" className="text-right">
                          Project
                        </Label>
                        <Select
                          name="project"
                          defaultValue={currentTask?.project.id || mockProjects[0].id}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select project" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockProjects.map(project => (
                              <SelectItem key={project.id} value={project.id}>
                                {project.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="priority" className="text-right">
                          Priority
                        </Label>
                        <Select
                          name="priority"
                          defaultValue={currentTask?.priority || TaskPriority.MEDIUM}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.values(TaskPriority).map(priority => (
                              <SelectItem key={priority} value={priority}>
                                {priority.charAt(0) + priority.slice(1).toLowerCase()}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="dueDate" className="text-right">
                          Due Date
                        </Label>
                        <Input
                          id="dueDate"
                          name="dueDate"
                          type="date"
                          defaultValue={currentTask?.dueDate?.toISOString().split('T')[0] || ""}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="estimatedHours" className="text-right">
                          Est. Hours
                        </Label>
                        <Input
                          id="estimatedHours"
                          name="estimatedHours"
                          type="number"
                          step="0.5"
                          defaultValue={currentTask?.estimatedHours || ""}
                          className="col-span-3"
                        />
                      </div>
                      <DialogFooter>
                        <Button type="submit">
                          {currentTask ? "Update Task" : "Create Task"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Tasks Table */}
              <Card className="@container/card mx-6 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Assignee</TableHead>
                      <TableHead>Created By</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTasks.map(task => (
                      <React.Fragment key={task.id}>
                        <TableRow>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Checkbox
                                checked={task.status === TaskStatus.DONE}
                                onCheckedChange={(checked) =>
                                  handleStatusChange(task.id, checked ? TaskStatus.DONE : TaskStatus.TODO)
                                }
                              />
                              <span className={task.status === TaskStatus.DONE ? "line-through text-muted-foreground" : ""}>
                                {task.title}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{task.project.name}</TableCell>
                          <TableCell>
                            <Select
                              value={task.status}
                              onValueChange={(value) => handleStatusChange(task.id, value as TaskStatus)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue placeholder="Status" />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.values(TaskStatus).map(status => (
                                  <SelectItem key={status} value={status}>
                                    {status.split('_').map(s => s.charAt(0) + s.slice(1).toLowerCase()).join(' ')}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                          <TableCell>
                            {task.assignee ? (
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  {task.assignee.avatar ? (
                                    <AvatarImage src={task.assignee.avatar} />
                                  ) : (
                                    <AvatarFallback>
                                      {task.assignee.name.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                  )}
                                </Avatar>
                                <span>{task.assignee.name}</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">Unassigned</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                {task.reporter.avatar ? (
                                  <AvatarImage src={task.reporter.avatar} />
                                ) : (
                                  <AvatarFallback>
                                    {task.reporter.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                              <span>{task.reporter.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {task.dueDate ? (
                              <div className="flex items-center gap-2">
                                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                <span>{format(task.dueDate, "MMM dd, yyyy")}</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">No due date</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => {
                                  setCurrentTask(task)
                                  setIsTaskDialogOpen(true)
                                }}>
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => router.push(`/tasks/${task.id}`)}>
                                  View Details
                                </DropdownMenuItem>
                                
                                {/* Subtask Management */}
                                <DropdownMenuItem onClick={() => {
                                  setCurrentTask(task)
                                  setIsSubtaskDialogOpen(true)
                                }}>
                                  <ListChecks className="mr-2 h-4 w-4" />
                                  Add Subtask
                                </DropdownMenuItem>
                                
                                {/* Comment Management */}
                                <DropdownMenuItem onClick={() => {
                                  setCurrentTask(task)
                                  setIsCommentDialogOpen(true)
                                }}>
                                  <MessageSquare className="mr-2 h-4 w-4" />
                                  Add Comment
                                </DropdownMenuItem>
                                
                                {/* Label Management */}
                                <DropdownMenuItem onClick={() => {
                                  setCurrentTask(task)
                                  setSelectedLabels([...task.labels])
                                  setIsLabelDialogOpen(true)
                                }}>
                                  <Tag className="mr-2 h-4 w-4" />
                                  Manage Labels
                                </DropdownMenuItem>
                                
                                {/* Assign Task */}
                                <DropdownMenuItem onClick={() => {
                                  setCurrentTask(task)
                                  setSelectedAssignee(task.assignee)
                                  setIsAssignDialogOpen(true)
                                }}>
                                  <User className="mr-2 h-4 w-4" />
                                  Assign Task
                                </DropdownMenuItem>
                                
                                <DropdownMenuSeparator />
                                
                                {/* Delete Task (only for owners) */}
                                <DropdownMenuItem
                                  className="text-red-600 focus:text-red-600"
                                  disabled={!isTaskOwner(task)}
                                  onClick={() => handleDeleteTask(task.id)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete Task
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell colSpan={8} className="p-0">
                            <Accordion type="single" collapsible>
                              <AccordionItem value={task.id}>
                                <AccordionTrigger className="px-4 text-sm">
                                  <div className="flex items-center gap-4">
                                    <span>Details</span>
                                    <div className="flex gap-2">
                                      {task.labels.map(label => (
                                        <Badge
                                          key={label.id}
                                          variant="outline"
                                          className={`${getLabelColor(label.color)}`}
                                        >
                                          {label.name}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="grid gap-6 p-4 md:grid-cols-2">
                                    <div>
                                      <h3 className="font-medium mb-2">Description</h3>
                                      <p className="text-muted-foreground">
                                        {task.description || "No description provided"}
                                      </p>

                                      <h3 className="font-medium mt-6 mb-2">Subtasks</h3>
                                      <div className="space-y-2">
                                        {task.subtasks.length > 0 ? (
                                          task.subtasks.map(subtask => (
                                            <div key={subtask.id} className="flex items-center gap-3 p-2 border rounded">
                                              <Checkbox
                                                checked={subtask.isCompleted}
                                                onCheckedChange={() => handleToggleSubtask(task.id, subtask.id)}
                                              />
                                              <span className={subtask.isCompleted ? "line-through text-muted-foreground" : ""}>
                                                {subtask.title}
                                              </span>
                                            </div>
                                          ))
                                        ) : (
                                          <p className="text-muted-foreground text-sm">No subtasks</p>
                                        )}
                                      </div>
                                    </div>
                                    <div className="border-l pl-6">
                                      <h3 className="font-medium mb-2">Activity</h3>
                                      <div className="space-y-4">
                                        {task.comments.length > 0 ? (
                                          task.comments.map(comment => (
                                            <div key={comment.id} className="flex gap-3">
                                              <Avatar className="h-8 w-8">
                                                {comment.author.avatar ? (
                                                  <AvatarImage src={comment.author.avatar} />
                                                ) : (
                                                  <AvatarFallback>
                                                    {comment.author.name.split(' ').map(n => n[0]).join('')}
                                                  </AvatarFallback>
                                                )}
                                              </Avatar>
                                              <div>
                                                <div className="flex items-center gap-2">
                                                  <span className="font-medium">{comment.author.name}</span>
                                                  <span className="text-xs text-muted-foreground">
                                                    {format(comment.createdAt, "MMM dd, yyyy")}
                                                  </span>
                                                </div>
                                                <p className="text-sm mt-1">{comment.content}</p>
                                              </div>
                                            </div>
                                          ))
                                        ) : (
                                          <p className="text-muted-foreground text-sm">No comments</p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </div>
          </div>
        </div>

        {/* Subtask Dialog */}
        <Dialog open={isSubtaskDialogOpen} onOpenChange={setIsSubtaskDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Subtask to {currentTask?.title}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="subtask-title">Subtask Title</Label>
                <Input
                  id="subtask-title"
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  placeholder="Enter subtask title"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                onClick={() => currentTask && handleAddSubtask(currentTask.id)}
              >
                Add Subtask
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Comment Dialog */}
        <Dialog open={isCommentDialogOpen} onOpenChange={setIsCommentDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Comment to {currentTask?.title}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="comment-content">Comment</Label>
                <Textarea
                  id="comment-content"
                  value={newCommentContent}
                  onChange={(e) => setNewCommentContent(e.target.value)}
                  placeholder="Enter your comment"
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                onClick={() => currentTask && handleAddComment(currentTask.id)}
              >
                <Send className="mr-2 h-4 w-4" />
                Post Comment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Label Management Dialog */}
        <Dialog open={isLabelDialogOpen} onOpenChange={setIsLabelDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Manage Labels for {currentTask?.title}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Available Labels</Label>
                <div className="flex flex-wrap gap-2">
                  {mockLabels
                    .filter(label => label.project.id === currentTask?.project.id)
                    .map(label => (
                      <Badge
                        key={label.id}
                        variant={selectedLabels.some(l => l.id === label.id) ? "default" : "outline"}
                        className={`${getLabelColor(label.color)} cursor-pointer`}
                        onClick={() => {
                          if (selectedLabels.some(l => l.id === label.id)) {
                            setSelectedLabels(selectedLabels.filter(l => l.id !== label.id))
                          } else {
                            setSelectedLabels([...selectedLabels, label])
                          }
                        }}
                      >
                        {label.name}
                      </Badge>
                    ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                onClick={() => currentTask && handleUpdateLabels(currentTask.id)}
              >
                Update Labels
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Assign Task Dialog */}
        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign {currentTask?.title}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Select Assignee</Label>
                <Select
                  value={selectedAssignee?.id || ""}
                  onValueChange={(value) => {
                    const user = mockUsers.find(u => u.id === value)
                    setSelectedAssignee(user || null)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Unassigned</SelectItem>
                    {mockUsers.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            {user.avatar ? (
                              <AvatarImage src={user.avatar} />
                            ) : (
                              <AvatarFallback>
                                {user.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <span>{user.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                onClick={() => currentTask && handleAssignTask(currentTask.id)}
              >
                Assign Task
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  )
}

// Helper function to format duration in hours and minutes
function formatDuration(hours: number): string {
  const totalMinutes = Math.round(hours * 60)
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return `${h}h ${m}m`
}