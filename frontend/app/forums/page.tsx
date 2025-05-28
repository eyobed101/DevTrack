// app/forums/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  MessageSquare, 
  Users, 
  Search, 
  Plus, 
  ChevronRight,
  MessageCircleReply,
  Clock,
  Pin
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { Label } from "@/components/ui/label"

type ForumRole = 'member' | 'moderator' | 'admin'
type ForumVisibility = 'public' | 'private'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

interface Forum {
  id: string
  title: string
  description: string
  owner: User
  createdAt: Date
  updatedAt: Date
  visibility: ForumVisibility
  members: {
    userId: string
    role: ForumRole
    joinedAt: Date
  }[]
  threadCount: number
  postCount: number
  pinned?: boolean
  latestPost?: {
    author: User
    date: Date
  }
}

const mockUsers: User[] = [
  { id: '1', name: 'You', email: 'you@example.com', avatar: '/avatars/you.jpg' },
  { id: '2', name: 'John Doe', email: 'john@example.com', avatar: '/avatars/john.jpg' },
  { id: '3', name: 'Jane Smith', email: 'jane@example.com' },
]

const mockForums: Forum[] = [
  {
    id: 'forum1',
    title: 'Product Development',
    description: 'Discussion about our product roadmap and features',
    owner: mockUsers[0],
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-05-22'),
    visibility: 'private',
    pinned: true,
    members: [
      { userId: '1', role: 'admin', joinedAt: new Date('2024-01-10') },
      { userId: '2', role: 'moderator', joinedAt: new Date('2024-02-15') },
      { userId: '3', role: 'member', joinedAt: new Date('2024-03-20') },
    ],
    threadCount: 24,
    postCount: 156,
    latestPost: {
      author: mockUsers[2],
      date: new Date('2024-05-22')
    }
  },
  {
    id: 'forum2',
    title: 'General Discussion',
    description: 'General topics and announcements',
    owner: mockUsers[1],
    createdAt: new Date('2024-02-05'),
    updatedAt: new Date('2024-05-20'),
    visibility: 'public',
    members: [
      { userId: '1', role: 'member', joinedAt: new Date('2024-02-10') },
      { userId: '2', role: 'admin', joinedAt: new Date('2024-02-05') },
    ],
    threadCount: 42,
    postCount: 287,
    latestPost: {
      author: mockUsers[1],
      date: new Date('2024-05-20')
    }
  }
]

export default function ForumsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [forums, setForums] = useState<Forum[]>([])
  const [currentUser] = useState<User>(mockUsers[0])
  const [newForumOpen, setNewForumOpen] = useState(false)
  const [newForum, setNewForum] = useState({
    title: '',
    description: '',
    visibility: 'private' as ForumVisibility
  })

  useEffect(() => {
    // Filter forums where current user is a member
    const filtered = mockForums.filter(forum =>
      forum.members.some(m => m.userId === currentUser.id)
    )
    setForums(filtered)
  }, [currentUser.id])

  const filteredForums = forums.filter(forum =>
    forum.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    forum.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const createNewForum = () => {
    if (!newForum.title.trim()) return

    const createdForum: Forum = {
      id: `forum-${Date.now()}`,
      title: newForum.title,
      description: newForum.description,
      owner: currentUser,
      createdAt: new Date(),
      updatedAt: new Date(),
      visibility: newForum.visibility,
      pinned: false,
      members: [
        { userId: currentUser.id, role: 'admin', joinedAt: new Date() }
      ],
      threadCount: 0,
      postCount: 0
    }

    setForums([createdForum, ...forums])
    setNewForum({ title: '', description: '', visibility: 'private' })
    setNewForumOpen(false)
  }

  const getUserRole = (forum: Forum) => {
    const member = forum.members.find(m => m.userId === currentUser.id)
    return member ? member.role : null
  }

  const isOwner = (forum: Forum) => {
    return forum.owner.id === currentUser.id
  }

  const canModerate = (forum: Forum) => {
    const role = getUserRole(forum)
    return role === 'moderator' || role === 'admin'
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
            <h1 className="text-2xl font-bold">Discussion Forums</h1>
            <div className="flex gap-3">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search forums..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button onClick={() => setNewForumOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Forum
              </Button>
            </div>
          </div>

          {/* New Forum Dialog */}
          {newForumOpen && (
            <Card>
              <CardHeader>
                <CardTitle>Create New Forum</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={newForum.title}
                    onChange={(e) => setNewForum({...newForum, title: e.target.value})}
                    placeholder="Forum title"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input
                    value={newForum.description}
                    onChange={(e) => setNewForum({...newForum, description: e.target.value})}
                    placeholder="Brief description of the forum"
                  />
                </div>
                <div>
                  <Label>Visibility</Label>
                  <div className="flex gap-4 mt-2">
                    <Button
                      variant={newForum.visibility === 'public' ? 'default' : 'outline'}
                      onClick={() => setNewForum({...newForum, visibility: 'public'})}
                    >
                      Public (Visible to all)
                    </Button>
                    <Button
                      variant={newForum.visibility === 'private' ? 'default' : 'outline'}
                      onClick={() => setNewForum({...newForum, visibility: 'private'})}
                    >
                      Private (Members only)
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setNewForumOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createNewForum}>
                  Create Forum
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* Pinned Forums */}
          {filteredForums.filter(f => f.pinned).length > 0 && (
            <div className="space-y-2">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Pin className="h-4 w-4" />
                Pinned Forums
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredForums.filter(f => f.pinned).map(forum => (
                  <ForumCard 
                    key={forum.id} 
                    forum={forum} 
                    currentUser={currentUser} 
                    router={router} 
                  />
                ))}
              </div>
            </div>
          )}

          {/* All Forums */}
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">
              {filteredForums.filter(f => !f.pinned).length} Forums
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredForums.filter(f => !f.pinned).map(forum => (
                <ForumCard 
                  key={forum.id} 
                  forum={forum} 
                  currentUser={currentUser} 
                  router={router} 
                />
              ))}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

function ForumCard({ forum, currentUser, router }: { 
  forum: Forum, 
  currentUser: User, 
  router: any 
}) {
  const getUserRole = (forum: Forum) => {
    const member = forum.members.find(m => m.userId === currentUser.id)
    return member ? member.role : null
  }

  const isOwner = (forum: Forum) => {
    return forum.owner.id === currentUser.id
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-6 w-6 text-primary" />
            <CardTitle className="text-lg">{forum.title}</CardTitle>
          </div>
          {isOwner(forum) && (
            <Badge variant="outline" className="text-primary">
              Owner
            </Badge>
          )}
        </div>
        <CardDescription className="pt-1">
          {forum.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="py-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{forum.members.length} members</span>
          </div>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <span>{forum.threadCount} threads</span>
          </div>
        </div>
        {forum.latestPost && (
          <div className="flex items-center justify-between text-sm mt-2">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                {forum.latestPost.author.avatar && <AvatarImage src={forum.latestPost.author.avatar} />}
                <AvatarFallback>
                  {forum.latestPost.author.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <span>Latest by {forum.latestPost.author.name}</span>
            </div>
            <span className="text-muted-foreground">
              {new Date(forum.latestPost.date).toLocaleDateString()}
            </span>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between pt-3">
        <Badge variant={forum.visibility === 'public' ? 'default' : 'secondary'}>
          {forum.visibility === 'public' ? 'Public' : 'Private'}
        </Badge>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/forums/${forum.id}`)}
        >
          View Forum
        </Button>
      </CardFooter>
    </Card>
  )
}