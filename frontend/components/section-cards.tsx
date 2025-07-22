import { IconTrendingDown, IconTrendingUp, IconUsers, IconFolder, IconMessage, IconClock } from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function SectionCards() {
  // Mock data - replace with your actual data
  const stats = {
    activeProjects: 24,
    projectsTrend: 8.3,
    teamMembers: 56,
    membersTrend: 12.5,
    discussions: 128,
    discussionsTrend: -4.2,
    avgResponseTime: 2.4,
    responseTrend: -15.8
  }

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {/* Active Projects Card */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Active Projects</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.activeProjects}
          </CardTitle>
          <CardAction>
            <Badge variant={stats.projectsTrend > 0 ? "outline" : "destructive"}>
              {stats.projectsTrend > 0 ? <IconTrendingUp /> : <IconTrendingDown />}
              {stats.projectsTrend > 0 ? '+' : ''}{stats.projectsTrend}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.projectsTrend > 0 ? 'Growing project count' : 'Fewer active projects'} 
            {stats.projectsTrend > 0 ? <IconTrendingUp className="size-4" /> : <IconTrendingDown className="size-4" />}
          </div>
          <div className="text-muted-foreground">
            <IconFolder className="inline mr-1 size-4" />
            Across all teams
          </div>
        </CardFooter>
      </Card>

      {/* Team Members Card */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Team Members</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.teamMembers}
          </CardTitle>
          <CardAction>
            <Badge variant={stats.membersTrend > 0 ? "outline" : "destructive"}>
              {stats.membersTrend > 0 ? <IconTrendingUp /> : <IconTrendingDown />}
              {stats.membersTrend > 0 ? '+' : ''}{stats.membersTrend}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.membersTrend > 0 ? 'Growing team' : 'Reduced members'} 
            {stats.membersTrend > 0 ? <IconTrendingUp className="size-4" /> : <IconTrendingDown className="size-4" />}
          </div>
          <div className="text-muted-foreground">
            <IconUsers className="inline mr-1 size-4" />
            Collaborating across projects
          </div>
        </CardFooter>
      </Card>

      {/* Active Discussions Card */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Active Discussions</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.discussions}
          </CardTitle>
          <CardAction>
            <Badge variant={stats.discussionsTrend > 0 ? "outline" : "destructive"}>
              {stats.discussionsTrend > 0 ? <IconTrendingUp /> : <IconTrendingDown />}
              {stats.discussionsTrend > 0 ? '+' : ''}{stats.discussionsTrend}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.discussionsTrend > 0 ? 'More conversations' : 'Fewer discussions'} 
            {stats.discussionsTrend > 0 ? <IconTrendingUp className="size-4" /> : <IconTrendingDown className="size-4" />}
          </div>
          <div className="text-muted-foreground">
            <IconMessage className="inline mr-1 size-4" />
            Threads and comments
          </div>
        </CardFooter>
      </Card>

      {/* Response Time Card */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Avg. Response Time</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.avgResponseTime}h
          </CardTitle>
          <CardAction>
            <Badge variant={stats.responseTrend < 0 ? "outline" : "destructive"}>
              {stats.responseTrend < 0 ? <IconTrendingUp /> : <IconTrendingDown />}
              {stats.responseTrend > 0 ? '+' : ''}{stats.responseTrend}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.responseTrend < 0 ? 'Faster responses' : 'Slower replies'} 
            {stats.responseTrend < 0 ? <IconTrendingUp className="size-4" /> : <IconTrendingDown className="size-4" />}
          </div>
          <div className="text-muted-foreground">
            <IconClock className="inline mr-1 size-4" />
            Time to first reply
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}