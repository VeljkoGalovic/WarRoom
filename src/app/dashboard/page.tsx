import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TacticalCard, TacticalCardHeader, TacticalCardTitle, TacticalCardContent } from "@/components/hud/TacticalCard";
import { StatusBadge } from "@/components/hud/StatusBadge";
import { Target, Users, Map, Zap, Shield, Cpu, Radio, Sparkles, Brain, Trophy, Clock, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const stats = [
    { label: "ACTIVE FRONTS", value: "3", icon: Target, color: "text-primary", trend: "+1 THIS WEEK" },
    { label: "TOTAL CAMPAIGNS", value: "5", icon: Map, color: "text-secondary", trend: "STABLE" },
    { label: "AI COMMAND STAFF", value: "5", icon: Users, color: "text-destructive", trend: "FULLY OPERATIONAL" },
    { label: "DAILY MOMENTUM", value: "78%", icon: TrendingUp, color: "text-primary-glow", trend: "NOMINAL" },
  ];

  const recentActivity = [
    { category: "CAMPAIGN", message: "MATH OLYMPIAD: Completed mock session #3", time: "02:14", metadata: { threatLevel: "CRITICAL" } },
    { category: "INTEL", message: "SPECIALIST NOVA: Debug complete - Prisma adapter fixed", time: "01:52", metadata: { agent: "SPECIALIST NOVA" } },
    { category: "LOGISTICS", message: "CAPTAIN KELSO: Dependency breach on segment tree implementation", time: "00:47", metadata: { agent: "CAPTAIN KELSO" } },
    { category: "SYSTEM", message: "War Map visualizer deployed to /dashboard/warmap", time: "23:11", metadata: { version: "1.0.0" } },
  ];

  const quickActions = [
    { label: "DISPATCH TO GENERAL VANCE", description: "Request strategic assessment on campaign priorities", icon: Zap, agent: "GENERAL" },
    { label: "TASK SPECIALIST NOVA", description: "Deploy coding operation for segment tree beats", icon: Cpu, agent: "SPECIALIST" },
    { label: "QUERY LIEUTENANT MERCURY", description: "Request intelligence on IMO 2026 geometry trends", icon: Radio, agent: "LIEUTENANT" },
    { label: "REPORT TO SERGEANT HAMMER", description: "Daily accountability check-in and streak review", icon: Shield, agent: "SERGEANT" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-tactical-xl text-primary">COMMAND OVERVIEW</h1>
          <p className="text-timestamp text-foreground-muted mt-1">TACTICAL INTELLIGENCE BRIEFING • {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <TacticalCard key={index} variant="default" withReticle className="relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn("h-12 w-12 rounded-lg flex items-center justify-center", `bg-${stat.color.replace("text-", "")}/10`)}>
                    <stat.icon className={cn("h-6 w-6", stat.color)} />
                  </div>
                  <div>
                    <p className="text-timestamp text-foreground-muted">{stat.label}</p>
                    <p className="text-tactical-2xl font-mono {stat.color}">{stat.value}</p>
                  </div>
                </div>
                <StatusBadge variant={stat.trend.includes("+") ? "active" : stat.trend === "STABLE" ? "standby" : "mission-complete"} className="text-[0.55rem]">
                  {stat.trend}
                </StatusBadge>
              </div>
            </TacticalCard>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Activity */}
          <TacticalCard variant="default" withReticle className="lg:col-span-2">
            <TacticalCardHeader>
              <div className="flex items-center justify-between">
                <TacticalCardTitle>RECENT ACTIVITY LOG</TacticalCardTitle>
                <StatusBadge variant="active" className="text-[0.55rem]">LIVE</StatusBadge>
              </div>
            </TacticalCardHeader>
            <TacticalCardContent>
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-accent/30 border border-hud-border/50 hover:border-primary/30 transition-colors">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <span className="text-tactical text-xs text-primary font-mono">{activity.category.slice(0, 3)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground text-sm">{activity.message}</p>
                      <div className="flex items-center gap-2 mt-1 text-timestamp text-foreground-muted">
                        <Clock className="h-3 w-3" />
                        <span>{activity.time}</span>
                        {activity.metadata.threatLevel && (
                          <span className="px-1.5 py-0.5 bg-destructive/10 rounded text-destructive-glow text-[0.5rem]">{activity.metadata.threatLevel}</span>
                        )}
                        {activity.metadata.agent && (
                          <span className="px-1.5 py-0.5 bg-primary/10 rounded text-primary text-[0.5rem]">{activity.metadata.agent}</span>
                        )}
                        {activity.metadata.version && (
                          <span className="px-1.5 py-0.5 bg-secondary/10 rounded text-secondary text-[0.5rem]">v{activity.metadata.version}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TacticalCardContent>
          </TacticalCard>

          {/* Quick Actions */}
          <TacticalCard variant="default" withReticle>
            <TacticalCardHeader>
              <TacticalCardTitle>TACTICAL DISPATCH</TacticalCardTitle>
            </TacticalCardHeader>
            <TacticalCardContent>
              <div className="space-y-3">
                {quickActions.map((action, index) => (
                  <div
                    key={index}
                    className="group flex items-center gap-3 p-3 rounded-lg bg-accent/30 border border-hud-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer"
                  >
                    <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform", `bg-${action.icon === Zap ? "destructive" : action.icon === Cpu ? "primary" : action.icon === Radio ? "secondary" : "destructive"}/10`)}>
                      <action.icon className={cn("h-5 w-5", action.icon === Zap ? "text-destructive" : action.icon === Cpu ? "text-primary" : action.icon === Radio ? "text-secondary" : "text-destructive")} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-tactical text-sm font-mono text-primary">{action.label}</p>
                      <p className="text-timestamp text-foreground-muted text-xs">{action.description}</p>
                    </div>
                    <span className="text-tactical text-xs text-primary/50 opacity-0 group-hover:opacity-100 transition-opacity">►</span>
                  </div>
                ))}
              </div>
            </TacticalCardContent>
          </TacticalCard>

          {/* System Status */}
          <TacticalCard variant="default" withReticle className="lg:col-span-1">
            <TacticalCardHeader>
              <TacticalCardTitle>SYSTEM STATUS</TacticalCardTitle>
            </TacticalCardHeader>
            <TacticalCardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-timestamp mb-1">
                    <span className="text-foreground-muted">OMNIROUTE ENDPOINT</span>
                    <StatusBadge variant="active">ONLINE</StatusBadge>
                  </div>
                  <div className="progress-tactical h-1.5">
                    <div className="progress-tactical-bar" style={{ width: "100%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-timestamp mb-1">
                    <span className="text-foreground-muted">DATABASE CONNECTION</span>
                    <StatusBadge variant="active">CONNECTED</StatusBadge>
                  </div>
                  <div className="progress-tactical h-1.5">
                    <div className="progress-tactical-bar" style={{ width: "100%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-timestamp mb-1">
                    <span className="text-foreground-muted">AI STAFF READINESS</span>
                    <StatusBadge variant="mission-complete">5/5 OPERATIONAL</StatusBadge>
                  </div>
                  <div className="progress-tactical h-1.5">
                    <div className="progress-tactical-bar" style={{ width: "100%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-timestamp mb-1">
                    <span className="text-foreground-muted">WAR MAP RENDER ENGINE</span>
                    <StatusBadge variant="standby">STANDBY</StatusBadge>
                  </div>
                  <div className="progress-tactical h-1.5">
                    <div className="progress-tactical-bar" style={{ width: "90%" }} />
                  </div>
                </div>
              </div>
            </TacticalCardContent>
          </TacticalCard>
        </div>
      </div>
    </DashboardLayout>
  );
}