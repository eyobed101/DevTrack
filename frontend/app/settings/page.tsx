"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  IconUser,
  IconLock,
  IconBell,
  IconUsers,
  IconMail,
  IconGlobe,
  IconCalendar,
  IconBuilding,
  IconCheck,
  IconX,
  IconEdit,
  IconUpload,
  IconTrash,
  IconShield,
  IconKey,
  IconLogout,
  IconMoon,
  IconSun,
  IconSettings,
  IconDownload,
  IconDotsVertical,
  IconPlus,
} from "@tabler/icons-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { Badge } from "@/components/ui/badge"
import { TimezoneSelect } from "@/components/timezone-select"
import { LanguageSelect } from "@/components/language-select"
// import { ThemeToggle } from "@/components/theme-toggle"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Profile schema for validation
const profileFormSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  bio: z.string().max(160).optional(),
  avatar: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  company: z.string().optional(),
  timezone: z.string().optional(),
  language: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

// Security schema
const securityFormSchema = z.object({
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }).optional(),
  confirmPassword: z.string().optional(),
  twoFactorEnabled: z.boolean(),
}).refine(data => {
  if (data.newPassword && !data.currentPassword) {
    return false
  }
  return true
}, {
  message: "Current password is required to change password",
  path: ["currentPassword"],
}).refine(data => {
  if (data.newPassword && data.newPassword !== data.confirmPassword) {
    return false
  }
  return true
}, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type SecurityFormValues = z.infer<typeof securityFormSchema>

// Notification preferences
const notificationSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  mentionNotifications: z.boolean(),
  projectUpdates: z.boolean(),
  weeklyDigest: z.boolean(),
  marketingEmails: z.boolean(),
})

type NotificationValues = z.infer<typeof notificationSchema>

// Team member type
type TeamMember = {
  id: string
  name: string
  email: string
  role: "owner" | "admin" | "member"
  avatar?: string
  status: "active" | "pending" | "suspended"
  lastActive?: string
}

// Mock data
const currentUser = {
  id: "user-1",
  username: "johndoe",
  email: "john@example.com",
  firstName: "John",
  lastName: "Doe",
  bio: "Product designer and developer. Building digital experiences.",
  avatar: "/avatars/01.png",
  company: "Acme Inc",
  timezone: "America/New_York",
  language: "en-US",
  twoFactorEnabled: true,
}

const teamMembers: TeamMember[] = [
  {
    id: "user-2",
    name: "Alice Johnson",
    email: "alice@example.com",
    role: "admin",
    avatar: "/avatars/02.png",
    status: "active",
    lastActive: "2023-11-20T14:30:00Z",
  },
  {
    id: "user-3",
    name: "Bob Smith",
    email: "bob@example.com",
    role: "member",
    avatar: "/avatars/03.png",
    status: "active",
    lastActive: "2023-11-19T09:15:00Z",
  },
  {
    id: "user-4",
    name: "Charlie Brown",
    email: "charlie@example.com",
    role: "member",
    status: "pending",
  },
]

const notificationPreferences = {
  emailNotifications: true,
  pushNotifications: true,
  mentionNotifications: true,
  projectUpdates: false,
  weeklyDigest: true,
  marketingEmails: false,
}

export default function SettingsPage() {
  const router = useRouter()
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = React.useState(false)
  const [isAvatarUploading, setIsAvatarUploading] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState("profile")

  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: currentUser.username,
      email: currentUser.email,
      bio: currentUser.bio,
      firstName: currentUser.firstName,
      lastName: currentUser.lastName,
      company: currentUser.company,
      timezone: currentUser.timezone,
      language: currentUser.language,
    },
  })

  // Security form
  const securityForm = useForm<SecurityFormValues>({
    resolver: zodResolver(securityFormSchema),
    defaultValues: {
      twoFactorEnabled: currentUser.twoFactorEnabled,
    },
  })

  // Notifications form
  const notificationForm = useForm<NotificationValues>({
    defaultValues: notificationPreferences,
  })

  const handleProfileSubmit = async (data: ProfileFormValues) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    toast.success("Profile updated successfully")
  }

  const handleSecuritySubmit = async (data: SecurityFormValues) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    if (data.newPassword) {
      toast.success("Password changed successfully")
    } else {
      toast.success("Security settings updated")
    }
    securityForm.reset()
  }

  const handleNotificationSubmit = async (data: NotificationValues) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    toast.success("Notification preferences updated")
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsAvatarUploading(true)
      // Simulate upload
      await new Promise(resolve => setTimeout(resolve, 1500))
      setIsAvatarUploading(false)
      toast.success("Avatar updated successfully")
    }
  }

  const handleDeleteAccount = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    toast.success("Account deletion initiated")
    router.push("/")
  }

  const handleRemoveTeamMember = (memberId: string) => {
    toast.success(`Team member removed (simulated)`)
  }

  const handleResendInvite = (email: string) => {
    toast.success(`Invite resent to ${email}`)
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
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold md:text-2xl">Settings</h1>
              <p className="text-sm text-muted-foreground">
                Manage your account settings and preferences
              </p>
            </div>
            {/* <ThemeToggle /> */}
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
              <TabsTrigger value="profile">
                <IconUser className="mr-2 size-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="security">
                <IconLock className="mr-2 size-4" />
                Security
              </TabsTrigger>
              <TabsTrigger value="notifications">
                <IconBell className="mr-2 size-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="team">
                <IconUsers className="mr-2 size-4" />
                Team
              </TabsTrigger>
              <TabsTrigger value="danger">
                <IconShield className="mr-2 size-4" />
                Danger Zone
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile</CardTitle>
                  <CardDescription>
                    Update your profile information and avatar
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-6">
                      <div className="flex flex-col items-center gap-4 md:flex-row">
                        <div className="relative">
                          <Avatar className="size-24">
                            <AvatarImage src={currentUser.avatar} />
                            <AvatarFallback>
                              {currentUser.firstName?.charAt(0)}{currentUser.lastName?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          {isAvatarUploading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          <Label htmlFor="avatar">Profile Picture</Label>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                            >
                              <label htmlFor="avatar-upload">
                                <IconUpload className="mr-2 size-4" />
                                Upload
                                <input
                                  id="avatar-upload"
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={handleAvatarChange}
                                />
                              </label>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={!currentUser.avatar}
                            >
                              <IconTrash className="mr-2 size-4" />
                              Remove
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            JPG, GIF or PNG. Max size of 2MB
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <FormField
                          control={profileForm.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Your first name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={profileForm.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Your last name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={profileForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Your username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="Your email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="company"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company</FormLabel>
                            <FormControl>
                              <Input placeholder="Your company" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bio</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Tell us a little bit about yourself"
                                className="resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <FormField
                          control={profileForm.control}
                          name="timezone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Timezone</FormLabel>
                              <FormControl>
                                <TimezoneSelect
                                  value={field.value ?? ""}
                                  onChange={field.onChange}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={profileForm.control}
                          name="language"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Language</FormLabel>
                              <FormControl>
                                <LanguageSelect
                                  value={field.value ?? ""}
                                  onChange={field.onChange}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex justify-end">
                        <Button type="submit">
                          Update Profile
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Security</CardTitle>
                  <CardDescription>
                    Change your password and manage security settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...securityForm}>
                    <form onSubmit={securityForm.handleSubmit(handleSecuritySubmit)} className="space-y-6">
                      <FormField
                        control={securityForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Enter current password"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={securityForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Enter new password"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Minimum 8 characters with at least one number and one special character
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={securityForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Confirm new password"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Separator className="my-4" />

                      <FormField
                        control={securityForm.control}
                        name="twoFactorEnabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Two-Factor Authentication
                              </FormLabel>
                              <FormDescription>
                                Add an extra layer of security to your account
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end">
                        <Button type="submit">
                          Update Security Settings
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex flex-col items-start gap-2">
                  <div className="text-sm font-medium">Active Sessions</div>
                  <div className="w-full rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Chrome on macOS</div>
                        <div className="text-sm text-muted-foreground">
                          New York, USA • {format(new Date(), "MMM d, yyyy 'at' h:mm a")}
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Revoke
                      </Button>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>
                    Configure how you receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...notificationForm}>
                    <form onSubmit={notificationForm.handleSubmit(handleNotificationSubmit)} className="space-y-6">
                      <div className="space-y-4">
                        <div className="text-sm font-medium">Email Notifications</div>
                        
                        <FormField
                          control={notificationForm.control}
                          name="emailNotifications"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                  Email Notifications
                                </FormLabel>
                                <FormDescription>
                                  Receive notifications via email
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={notificationForm.control}
                          name="mentionNotifications"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                  Mentions
                                </FormLabel>
                                <FormDescription>
                                  Get notified when you're mentioned
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  disabled={!notificationForm.watch("emailNotifications")}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={notificationForm.control}
                          name="projectUpdates"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                  Project Updates
                                </FormLabel>
                                <FormDescription>
                                  Receive updates about projects you follow
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  disabled={!notificationForm.watch("emailNotifications")}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={notificationForm.control}
                          name="weeklyDigest"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                  Weekly Digest
                                </FormLabel>
                                <FormDescription>
                                  Get a weekly summary of your activity
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  disabled={!notificationForm.watch("emailNotifications")}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={notificationForm.control}
                          name="marketingEmails"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                  Marketing Emails
                                </FormLabel>
                                <FormDescription>
                                  Receive product updates and offers
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  disabled={!notificationForm.watch("emailNotifications")}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <Separator className="my-4" />

                      <div className="space-y-4">
                        <div className="text-sm font-medium">Push Notifications</div>
                        
                        <FormField
                          control={notificationForm.control}
                          name="pushNotifications"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                  Push Notifications
                                </FormLabel>
                                <FormDescription>
                                  Receive notifications on your device
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex justify-end">
                        <Button type="submit">
                          Update Notification Preferences
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Team Tab */}
            <TabsContent value="team" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Team Management</CardTitle>
                  <CardDescription>
                    Manage your team members and their permissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-medium">Team Members</h3>
                        <p className="text-sm text-muted-foreground">
                          {teamMembers.length} members in your team
                        </p>
                      </div>
                      <Button>
                        <IconPlus className="mr-2 size-4" />
                        Invite Member
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {teamMembers.map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4">
                            <Avatar className="size-10">
                              <AvatarImage src={member.avatar} />
                              <AvatarFallback>
                                {member.name.split(" ").map(n => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{member.name}</div>
                              <div className="text-sm text-muted-foreground">{member.email}</div>
                              {member.lastActive && (
                                <div className="text-xs text-muted-foreground">
                                  Last active: {format(new Date(member.lastActive), "MMM d, yyyy")}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge variant={member.role === "owner" ? "default" : "secondary"}>
                              {member.role}
                            </Badge>
                            <Badge variant={member.status === "active" ? "default" : "outline"}>
                              {member.status}
                            </Badge>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <IconDotsVertical className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {member.status === "pending" && (
                                  <DropdownMenuItem onClick={() => handleResendInvite(member.email)}>
                                    <IconMail className="mr-2 size-4" />
                                    Resend Invite
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem>
                                  <IconEdit className="mr-2 size-4" />
                                  Edit Role
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => handleRemoveTeamMember(member.id)}
                                >
                                  <IconTrash className="mr-2 size-4" />
                                  Remove
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Danger Zone Tab */}
            <TabsContent value="danger" className="mt-6">
              <Card className="border-red-500">
                <CardHeader>
                  <CardTitle className="text-red-500">Danger Zone</CardTitle>
                  <CardDescription>
                    These actions are irreversible. Proceed with caution.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col gap-4 rounded-lg border border-red-500 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Export Data</h4>
                        <p className="text-sm text-muted-foreground">
                          Download all your data in a ZIP file
                        </p>
                      </div>
                      <Button variant="outline">
                        <IconDownload className="mr-2 size-4" />
                        Export Data
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 rounded-lg border border-red-500 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Deactivate Account</h4>
                        <p className="text-sm text-muted-foreground">
                          Temporarily disable your account
                        </p>
                      </div>
                      <Button variant="outline" className="text-red-500 border-red-500">
                        <IconX className="mr-2 size-4" />
                        Deactivate
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 rounded-lg border border-red-500 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Delete Account</h4>
                        <p className="text-sm text-muted-foreground">
                          Permanently delete your account and all data
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        onClick={() => setIsDeleteAccountOpen(true)}
                      >
                        <IconTrash className="mr-2 size-4" />
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog open={isDeleteAccountOpen} onOpenChange={setIsDeleteAccountOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your account
              and remove all your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDeleteAccount}
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  )
}