"use client"

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
import { Plus, MoreVertical, Mail, Trash2, Shield, User } from "lucide-react"
import { toast } from "sonner"

// Types matching your TypeORM entities
type User = {
  id: string
  name: string
  email: string
  avatar?: string
}

type Team = {
  id: string
  name: string
  description: string
  owner: User
  members: TeamMember[]
  invites: TeamInvite[]
  createdAt: Date
  updatedAt: Date
}

type TeamMember = {
  id: string
  user: User
  role: TeamRole
  joinedAt: Date
}

type TeamInvite = {
  id: string
  email: string
  role: TeamRole
  expiresAt: Date
  createdAt: Date
}

enum TeamRole {
  OWNER = "OWNER",
  ADMIN = "ADMIN",
  MEMBER = "MEMBER"
}

// Mock data based on your schema
const mockTeams: Team[] = [
  {
    id: "1",
    name: "Design Team",
    description: "Responsible for all design projects",
    owner: {
      id: "1",
      name: "Alex Johnson",
      email: "alex@example.com",
      avatar: "/avatars/01.png"
    },
    members: [
      {
        id: "1",
        user: {
          id: "1",
          name: "Alex Johnson",
          email: "alex@example.com",
          avatar: "/avatars/01.png"
        },
        role: TeamRole.OWNER,
        joinedAt: new Date("2023-01-15")
      },
      {
        id: "2",
        user: {
          id: "2",
          name: "Sam Lee",
          email: "sam@example.com",
          avatar: "/avatars/02.png"
        },
        role: TeamRole.ADMIN,
        joinedAt: new Date("2023-02-20")
      },
      {
        id: "3",
        user: {
          id: "3",
          name: "Taylor Smith",
          email: "taylor@example.com"
        },
        role: TeamRole.MEMBER,
        joinedAt: new Date("2023-03-10")
      }
    ],
    invites: [
      {
        id: "1",
        email: "new@example.com",
        role: TeamRole.MEMBER,
        expiresAt: new Date("2023-12-31"),
        createdAt: new Date()
      }
    ],
    createdAt: new Date("2023-01-10"),
    updatedAt: new Date()
  },
  // ... other teams
]

export default function TeamsPage() {
  const router = useRouter()
  const [currentTeam, setCurrentTeam] = useState<Team>(mockTeams[0])
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<TeamRole>(TeamRole.MEMBER)

  const handleInviteMember = (e: React.FormEvent) => {
    e.preventDefault()
    
    // In a real app, you would call an API endpoint here
    const newInvite: TeamInvite = {
      id: `invite-${Math.random().toString(36).substr(2, 9)}`,
      email,
      role,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      createdAt: new Date()
    }

    setCurrentTeam({
      ...currentTeam,
      invites: [...currentTeam.invites, newInvite]
    })

    toast.success(`Invite sent to ${email}`)
    setEmail("")
    setIsInviteDialogOpen(false)
  }

  const handleRoleChange = (memberId: string, newRole: TeamRole) => {
    if (currentTeam.members.some(m => m.role === TeamRole.OWNER && m.id === memberId)) {
      toast.error("Cannot change owner role")
      return
    }

    setCurrentTeam({
      ...currentTeam,
      members: currentTeam.members.map(member => 
        member.id === memberId ? { ...member, role: newRole } : member
      )
    })
    toast.success("Role updated successfully")
  }

  const handleRemoveMember = (memberId: string) => {
    if (currentTeam.members.some(m => m.role === TeamRole.OWNER && m.id === memberId)) {
      toast.error("Cannot remove team owner")
      return
    }

    setCurrentTeam({
      ...currentTeam,
      members: currentTeam.members.filter(member => member.id !== memberId)
    })
    toast.success("Member removed")
  }

  const handleRevokeInvite = (inviteId: string) => {
    setCurrentTeam({
      ...currentTeam,
      invites: currentTeam.invites.filter(invite => invite.id !== inviteId)
    })
    toast.success("Invite revoked")
  }

  const getRoleBadge = (role: TeamRole) => {
    const variants = {
      [TeamRole.OWNER]: { label: "Owner", variant: "default", icon: <Shield className="h-3 w-3 mr-1" /> },
      [TeamRole.ADMIN]: { label: "Admin", variant: "secondary", icon: <Shield className="h-3 w-3 mr-1" /> },
      [TeamRole.MEMBER]: { label: "Member", variant: "outline", icon: <User className="h-3 w-3 mr-1" /> }
    }
    
    const { label, variant, icon } = variants[role]
    return (
      <Badge variant={variant as any} className="capitalize">
        {icon}
        {label}
      </Badge>
    )
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
              {/* Team Header */}
              <div className="flex justify-between items-center mx-6">
                <h1 className="text-2xl font-bold">Team Management</h1>
                <div className="flex gap-2">
                  <Select
                    value={currentTeam.id}
                    onValueChange={(value) => setCurrentTeam(mockTeams.find(t => t.id === value)!)}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select team" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockTeams.map(team => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Invite Member
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Invite to {currentTeam.name}</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleInviteMember} className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="email" className="text-right">
                            Email
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="col-span-3"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="role" className="text-right">
                            Role
                          </Label>
                          <Select 
                            value={role} 
                            onValueChange={(value) => setRole(value as TeamRole)}
                          >
                            <SelectTrigger className="col-span-3">
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={TeamRole.ADMIN}>Admin</SelectItem>
                              <SelectItem value={TeamRole.MEMBER}>Member</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button type="submit" className="mt-4">
                          <Mail className="mr-2 h-4 w-4" />
                          Send Invite
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Team Overview Card */}
              <Card className="@container/card mx-6 p-6">
                <div className="grid gap-8 md:grid-cols-2">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-semibold">Team Members</h2>
                      <span className="text-sm text-muted-foreground">
                        {currentTeam.members.length} members
                      </span>
                    </div>
                    <div className="space-y-4">
                      {currentTeam.members.map(member => (
                        <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              {member.user.avatar ? (
                                <AvatarImage src={member.user.avatar} />
                              ) : (
                                <AvatarFallback>
                                  {member.user.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div>
                              <p className="font-medium">{member.user.name}</p>
                              <p className="text-sm text-muted-foreground">{member.user.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getRoleBadge(member.role)}
                            {member.role !== TeamRole.OWNER && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem 
                                    onClick={() => handleRoleChange(member.id, TeamRole.ADMIN)}
                                    disabled={member.role === TeamRole.ADMIN}
                                  >
                                    Make Admin
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleRoleChange(member.id, TeamRole.MEMBER)}
                                    disabled={member.role === TeamRole.MEMBER}
                                  >
                                    Make Member
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => handleRemoveMember(member.id)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Remove
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {currentTeam.invites.length > 0 && (
                      <>
                        <h3 className="text-sm font-medium mt-8 mb-3">Pending Invites</h3>
                        <div className="space-y-3">
                          {currentTeam.invites.map(invite => (
                            <div key={invite.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarFallback>
                                    <Mail className="h-4 w-4" />
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{invite.email}</p>
                                  <p className="text-sm text-muted-foreground">
                                    Expires {new Date(invite.expiresAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {getRoleBadge(invite.role)}
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleRevokeInvite(invite.id)}
                                >
                                  Revoke
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  <div className="border-l pl-6">
                    <h2 className="text-lg font-semibold mb-4">Team Information</h2>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-sm font-medium mb-2">Description</h3>
                        <p className="text-muted-foreground">{currentTeam.description}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium mb-2">Team Owner</h3>
                        <div className="flex items-center gap-3 p-3 border rounded-lg">
                          <Avatar>
                            {currentTeam.owner.avatar ? (
                              <AvatarImage src={currentTeam.owner.avatar} />
                            ) : (
                              <AvatarFallback>
                                {currentTeam.owner.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <p className="font-medium">{currentTeam.owner.name}</p>
                            <p className="text-sm text-muted-foreground">{currentTeam.owner.email}</p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium mb-2">Team Stats</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <Card className="p-4">
                            <p className="text-sm text-muted-foreground">Created</p>
                            <p className="font-medium">
                              {new Date(currentTeam.createdAt).toLocaleDateString()}
                            </p>
                          </Card>
                          <Card className="p-4">
                            <p className="text-sm text-muted-foreground">Last Updated</p>
                            <p className="font-medium">
                              {new Date(currentTeam.updatedAt).toLocaleDateString()}
                            </p>
                          </Card>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}