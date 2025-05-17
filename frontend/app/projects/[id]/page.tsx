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
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Calendar } from "@/components/ui/calendar"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

// Sample data
const project = {
  id: 1,
  title: "Website Redesign",
  description: "Complete overhaul of company website with modern design system",
  deadline: "2023-12-15",
  progress: 65,
  members: [
    { name: "Alex Johnson", role: "Design Lead", avatar: "/avatars/alex.png" },
    { name: "Sam Lee", role: "Frontend Dev", avatar: "/avatars/sam.png" },
    { name: "Taylor Smith", role: "Project Manager", avatar: "/avatars/taylor.png" },
    { name: "Jordan Chen", role: "UX Researcher", avatar: "" },
  ],
  tasks: [
    { id: 1, title: "Create wireframes", completed: true },
    { id: 2, title: "Design homepage", completed: true },
    { id: 3, title: "Develop component library", completed: false },
    { id: 4, title: "Content migration", completed: false },
  ],
  updates: [
    {
      date: "2023-11-01",
      title: "Project Kickoff",
      description: "Initial meeting with stakeholders to align on requirements"
    },
    {
      date: "2023-11-08",
      title: "Wireframes Approved",
      description: "Client signed off on initial wireframe concepts"
    },
    {
      date: "2023-11-15",
      title: "Design System Started",
      description: "Began developing the component library"
    }
  ],
  reports: [
    { id: 1, title: "Traffic Analysis", date: "2023-10-15" },
    { id: 2, title: "User Feedback", date: "2023-10-22" },
    { id: 3, title: "SEO Audit", date: "2023-10-29" },
  ]
}

export default function ProjectOverviewPage() {
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
              
              {/* Project Overview Card */}
              <Card className="@container/card mx-6 p-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="md:col-span-2">
                    <h1 className="text-2xl font-bold">{project.title}</h1>
                    <p className="text-muted-foreground mt-2">{project.description}</p>
                    
                    <div className="mt-6">
                      <h3 className="font-medium mb-2">Project Progress</h3>
                      <Progress value={project.progress} className="h-2" />
                      <div className="flex justify-between mt-1 text-sm text-muted-foreground">
                        <span>{project.progress}% complete</span>
                        <span>Deadline: {project.deadline}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-l pl-6">
                    <h3 className="font-medium mb-3">Upcoming Deadline</h3>
                    <Calendar
                      mode="single"
                      selected={new Date(project.deadline)}
                      className="rounded-md border"
                    />
                  </div>
                </div>
              </Card>

              {/* Main Content Tabs */}
              <Tabs defaultValue="tasks" className="@container/card mx-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="tasks">Tasks</TabsTrigger>
                  <TabsTrigger value="members">Team Members</TabsTrigger>
                  <TabsTrigger value="timeline">Project Timeline</TabsTrigger>
                </TabsList>
                
                {/* Tasks Tab */}
                <TabsContent value="tasks">
                  <Card className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-semibold">Tasks</h2>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm">Add Task</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Create New Task</DialogTitle>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <Input placeholder="Task title" />
                            <Button type="submit">Create Task</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    
                    <div className="space-y-2">
                      {project.tasks.map(task => (
                        <div key={task.id} className="flex items-center p-3 border rounded-lg">
                          <input 
                            type="checkbox" 
                            checked={task.completed}
                            className="h-4 w-4 rounded mr-3" 
                          />
                          <span className={task.completed ? "line-through text-muted-foreground" : ""}>
                            {task.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </TabsContent>
                
                {/* Members Tab */}
                <TabsContent value="members">
                  <Card className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Team Members</h2>
                    
                    <div className="flex flex-wrap gap-4">
                      {project.members.map((member, index) => (
                        <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                          <Avatar className="h-10 w-10">
                            {member.avatar ? (
                              <AvatarImage src={member.avatar} alt={member.name} />
                            ) : (
                              <AvatarFallback>
                                {member.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <p className="font-medium">{member.name}</p>
                            <p className="text-sm text-muted-foreground">{member.role}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </TabsContent>
                
                {/* Timeline Tab */}
                <TabsContent value="timeline">
                  <Card className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Project Updates</h2>
                    
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-4">
                        {project.updates.map((update, index) => (
                          <div key={index} className="flex gap-4">
                            <div className="flex flex-col items-center">
                              <div className="h-3 w-3 rounded-full bg-primary mt-1" />
                              {index < project.updates.length - 1 && (
                                <div className="w-px h-full bg-border" />
                              )}
                            </div>
                            <div className="pb-6">
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium">{update.title}</h3>
                                <Badge variant="outline">
                                  {update.date}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {update.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Linked Reports Section */}
              <Card className="@container/card mx-6 p-6">
                <h2 className="text-lg font-semibold mb-4">Linked Reports & Analytics</h2>
                
                <div className="grid gap-3 md:grid-cols-3">
                  {project.reports.map(report => (
                    <Card key={report.id} className="p-4 hover:border-primary transition-colors">
                      <h3 className="font-medium">{report.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">Created: {report.date}</p>
                      <Button variant="ghost" size="sm" className="mt-3">View Report</Button>
                    </Card>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}