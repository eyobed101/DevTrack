"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  Folder,
  File,
  Users,
  Download,
  Upload,
  Edit,
  Trash2,
  MoreVertical,
  Plus,
  Lock,
  Check
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"

type Permission = 'read' | 'write' | 'admin'
type ResourceType = 'file' | 'folder'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

interface Resource {
  id: string
  name: string
  type: ResourceType
  owner: User
  createdAt: Date
  updatedAt: Date
  size?: number // Only for files
  permissions: {
    userId: string
    permission: Permission
  }[]
  parentId?: string // For nested resources
}

const mockUsers: User[] = [
  { id: '1', name: 'You', email: 'you@example.com', avatar: '/avatars/you.jpg' },
  { id: '2', name: 'John Doe', email: 'john@example.com', avatar: '/avatars/john.jpg' },
  { id: '3', name: 'Jane Smith', email: 'jane@example.com' },
  { id: '4', name: 'Team Member', email: 'member@example.com', avatar: '/avatars/member.jpg' },
]

const mockResources: Resource[] = [
  {
    id: '1',
    name: 'Project Documentation',
    type: 'folder',
    owner: mockUsers[0],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-05-20'),
    permissions: [
      { userId: '1', permission: 'admin' },
      { userId: '2', permission: 'write' },
      { userId: '3', permission: 'read' },
    ]
  },
  {
    id: 'file1',
    name: 'Technical Spec.pdf',
    type: 'file',
    owner: mockUsers[0],
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-05-18'),
    size: 2456789,
    parentId: 'repo1',
    permissions: [
      { userId: '1', permission: 'admin' },
      { userId: '2', permission: 'write' },
    ]
  },
  {
    id: '2',
    name: 'Marketing Assets',
    type: 'folder',
    owner: mockUsers[1],
    createdAt: new Date('2024-03-05'),
    updatedAt: new Date('2024-05-15'),
    permissions: [
      { userId: '1', permission: 'write' },
      { userId: '2', permission: 'admin' },
      { userId: '4', permission: 'read' },
    ]
  },
  {
    id: 'file2',
    name: 'Brand Guidelines.docx',
    type: 'file',
    owner: mockUsers[1],
    createdAt: new Date('2024-04-22'),
    updatedAt: new Date('2024-05-10'),
    size: 1876543,
    parentId: 'repo2',
    permissions: [
      { userId: '1', permission: 'write' },
      { userId: '2', permission: 'admin' },
    ]
  },
]

export default function DocumentSharingPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [resources, setResources] = useState<Resource[]>([])
  const [newRepoName, setNewRepoName] = useState('')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [currentUser] = useState<User>(mockUsers[0])

  useEffect(() => {
    // Filter resources where current user has any permission
    const filtered = mockResources.filter(resource =>
      resource.permissions.some(p => p.userId === currentUser.id)
    )
    setResources(filtered)
  }, [currentUser.id])

  const filteredResources = resources.filter(resource =>
    resource.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const createNewRepository = () => {
    if (!newRepoName.trim()) return

    const newRepo: Resource = {
      id: `repo-${Date.now()}`,
      name: newRepoName,
      type: 'folder',
      owner: currentUser,
      createdAt: new Date(),
      updatedAt: new Date(),
      permissions: [
        { userId: currentUser.id, permission: 'admin' },
        ...selectedUsers.map(userId => ({ userId, permission: 'read' as Permission }))
      ]
    }

    setResources([...resources, newRepo])
    setNewRepoName('')
    setSelectedUsers([])
  }

  const getUserPermission = (resource: Resource) => {
    const permission = resource.permissions.find(p => p.userId === currentUser.id)
    return permission ? permission.permission : null
  }

  const canEdit = (resource: Resource) => {
    const permission = getUserPermission(resource)
    return permission === 'write' || permission === 'admin'
  }

  const isOwner = (resource: Resource) => {
    return resource.owner.id === currentUser.id
  }

  const handleViewDetails = (resource: Resource) => {
    // Redirect to the details page based on resource type
    if (resource.type === 'folder') {
      router.push(`/documents/${resource.id}`)
    } else {
      router.push(`/documents/file/${resource.id}`)
    }
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
        <div className="container mx-auto p-4 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h1 className="text-2xl font-bold">Shared Documents</h1>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Repository
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Repository</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="repo-name">Repository Name</Label>
                    <Input
                      id="repo-name"
                      value={newRepoName}
                      onChange={(e) => setNewRepoName(e.target.value)}
                      placeholder="Enter repository name"
                    />
                  </div>
                  <div>
                    <Label>Add Members</Label>
                    <div className="space-y-2 mt-2">
                      {mockUsers.filter(u => u.id !== currentUser.id).map(user => (
                        <div key={user.id} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              {user.avatar && <AvatarImage src={user.avatar} />}
                              <AvatarFallback>
                                {user.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                          <Switch
                            checked={selectedUsers.includes(user.id)}
                            onCheckedChange={(checked) => {
                              setSelectedUsers(
                                checked
                                  ? [...selectedUsers, user.id]
                                  : selectedUsers.filter(id => id !== user.id)
                              )
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button onClick={createNewRepository} className="w-full">
                    Create Repository
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredResources.map(resource => (
              <Card
                key={resource.id}
                className={isOwner(resource) ? "border-primary" : ""}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      {resource.type === 'folder' ? (
                        <Folder className="h-6 w-6 text-primary" />
                      ) : (
                        <File className="h-6 w-6 text-muted-foreground" />
                      )}
                      <CardTitle className="text-lg">{resource.name}</CardTitle>
                    </div>
                    {isOwner(resource) && (
                      <Badge variant="outline" className="text-primary">
                        Owner
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="pt-1">
                    {resource.type === 'file' ?
                      `${(resource.size! / 1024 / 1024).toFixed(2)} MB` :
                      `${resource.permissions.length} members`
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        {resource.owner.avatar && <AvatarImage src={resource.owner.avatar} />}
                        <AvatarFallback>
                          {resource.owner.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span>{resource.owner.name}</span>
                    </div>
                    <span className="text-muted-foreground">
                      {new Date(resource.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(resource)}
                  >
                    View Details
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    {canEdit(resource) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Upload className="mr-2 h-4 w-4" />
                            Upload New Version
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Rename
                          </DropdownMenuItem>
                          {isOwner(resource) && (
                            <>
                              <DropdownMenuItem>
                                <Users className="mr-2 h-4 w-4" />
                                Manage Access
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                <Lock className="mr-2 h-4 w-4" />
                                Remove Access
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}