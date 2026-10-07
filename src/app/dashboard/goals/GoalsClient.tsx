"use client";

import * as React from "react";
import { TacticalCard, TacticalCardHeader, TacticalCardTitle, TacticalCardContent, TacticalCardFooter } from "@/components/hud/TacticalCard";
import { StatusBadge } from "@/components/hud/StatusBadge";
import { TerminalInput, QuickAddInput } from "@/components/hud/TerminalInput";
import { TacticalButton } from "@/components/hud/TacticalButton";
import {
  Target,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Circle,
  Plus,
  Minus,
  Flag,
  Brain,
  Zap,
  Dumbbell,
  Code,
  Trophy,
  Clock,
  Trash2,
  Edit,
  MoreHorizontal
} from "lucide-react";
import { cn } from "@/lib/utils";

import type { GoalStatus, ThreatLevel } from "@prisma/client";

// Type definitions matching Prisma schema
interface Goal {
  id: string;
  title: string;
  description: string | null;
  strategy: string | null;
  status: GoalStatus;
  threatLevel: ThreatLevel;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  agentId: string | null;
  milestones: Milestone[];
  agent?: Agent | null;
}

interface Milestone {
  id: string;
  title: string;
  isCompleted: boolean;
  date: Date;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  goalId: string;
}

interface Agent {
  id: string;
  name: string;
  rank: string;
  role: string;
  systemPrompt: string;
  modelEndpoint: string;
  avatarIcon: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

const threatLevelIcons: Record<ThreatLevel, React.ReactNode> = {
  CRITICAL: <Zap className="h-4 w-4 text-destructive-glow" />,
  HIGH: <Flag className="h-4 w-4 text-primary-glow" />,
  MEDIUM: <Brain className="h-4 w-4 text-secondary-glow" />,
  LOW: <Trophy className="h-4 w-4 text-foreground-muted" />,
};

const threatLevelLabels: Record<ThreatLevel, string> = {
  CRITICAL: "CRITICAL",
  HIGH: "HIGH",
  MEDIUM: "MEDIUM",
  LOW: "LOW",
};

const goalIcons: Record<string, React.ReactNode> = {
  "goal-math-olympiad": <Trophy className="h-5 w-5" />,
  "goal-systems-programming": <Code className="h-5 w-5" />,
  "goal-competitive-programming": <Zap className="h-5 w-5" />,
  "goal-warroom-platform": <Brain className="h-5 w-5" />,
  "goal-physical-conditioning": <Dumbbell className="h-5 w-5" />,
};

function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getProgress(milestones: Milestone[]): { completed: number; total: number; percentage: number } {
  const total = milestones.length;
  const completed = milestones.filter(m => m.isCompleted).length;
  return { completed, total, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
}

interface GoalCardProps {
  goal: Goal;
  onToggleMilestone: (milestoneId: string, completed: boolean) => void;
  onAddMilestone: (goalId: string, title: string) => void;
  onDeleteMilestone: (milestoneId: string) => void;
  onUpdateGoal: (goal: Goal) => void;
}

function GoalCard({ goal, onToggleMilestone, onAddMilestone, onDeleteMilestone, onUpdateGoal }: GoalCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [showAddMilestone, setShowAddMilestone] = React.useState(false);
  const [newMilestoneTitle, setNewMilestoneTitle] = React.useState("");
  const progress = getProgress(goal.milestones);

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMilestoneTitle.trim()) {
      onAddMilestone(goal.id, newMilestoneTitle.trim());
      setNewMilestoneTitle("");
      setShowAddMilestone(false);
    }
  };

  return (
    <TacticalCard variant={goal.status === "ACTIVE" ? "active" : "default"} withReticle className="overflow-visible">
      {/* Compact header - always visible */}
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary-glow">
          {goalIcons[goal.id] || <Target className="h-5 w-5" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <TacticalCardTitle className="truncate flex-1">{goal.title}</TacticalCardTitle>
            <StatusBadge variant={goal.status.toLowerCase() as any} showPulse={goal.status === "ACTIVE"} />
            <span className={cn("px-2 py-0.5 rounded text-timestamp font-mono border",
              goal.threatLevel === "CRITICAL" && "border-destructive text-destructive-glow bg-destructive/10",
              goal.threatLevel === "HIGH" && "border-primary text-primary-glow bg-primary/10",
              goal.threatLevel === "MEDIUM" && "border-secondary text-secondary-glow bg-secondary/10",
              goal.threatLevel === "LOW" && "border-foreground-muted text-foreground-muted bg-muted"
            )}>
              {threatLevelIcons[goal.threatLevel]}
              {threatLevelLabels[goal.threatLevel]}
            </span>
          </div>
          <div className="flex items-center gap-4 text-timestamp text-foreground-muted">
            <span className="flex items-center gap-1.5">{progress.completed}/{progress.total} milestones</span>
            <div className="flex-1 max-w-xs">
              <div className="progress-tactical">
                <div className="progress-tactical-fill" style={{ width: `${progress.percentage}%` }} />
              </div>
            </div>
            <span>{progress.percentage}%</span>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex-shrink-0 p-1.5 rounded-lg hover:bg-accent transition-colors text-foreground-muted hover:text-primary"
          aria-label={isExpanded ? "Collapse" : "Expand"}
        >
          {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </button>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="mt-4 space-y-4 animate-slide-down">
          {/* Description & Strategy */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 p-3 rounded-lg bg-background-elevated border border-card-border">
              <div className="flex items-center gap-2 text-tactical text-primary">
                <Brain className="h-4 w-4" />
                <span>OBJECTIVE</span>
              </div>
              <p className="text-sm text-foreground-muted leading-relaxed">
                {goal.description || "No objective description provided."}
              </p>
            </div>
            <div className="space-y-2 p-3 rounded-lg bg-background-elevated border border-card-border">
              <div className="flex items-center gap-2 text-tactical text-primary">
                <Flag className="h-4 w-4" />
                <span>STRATEGY</span>
              </div>
              <p className="text-sm text-foreground-muted leading-relaxed">
                {goal.strategy || "No strategy defined."}
              </p>
            </div>
          </div>

          {/* Milestones */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-tactical text-primary">
                <Clock className="h-4 w-4" />
                <span>DAILY MICRO-MILESTONES</span>
              </div>
              <TacticalButton
                size="sm"
                variant="ghost"
                onClick={() => setShowAddMilestone(!showAddMilestone)}
                leftIcon={<Plus className="h-3 w-3" />}
              >
                ADD
              </TacticalButton>
            </div>

            {showAddMilestone && (
              <form onSubmit={handleAddMilestone} className="space-y-2">
                <TerminalInput
                  value={newMilestoneTitle}
                  onChange={(e) => setNewMilestoneTitle(e.target.value)}
                  placeholder="NEW MICRO-MILESTONE..."
                  className="max-w-md"
                  autoFocus
                />
                <div className="flex gap-2">
                  <TacticalButton type="submit" size="sm" variant="primary">CONFIRM</TacticalButton>
                  <TacticalButton type="button" size="sm" variant="ghost" onClick={() => { setShowAddMilestone(false); setNewMilestoneTitle(""); }}>CANCEL</TacticalButton>
                </div>
              </form>
            )}

            {goal.milestones.length === 0 && !showAddMilestone && (
              <div className="text-center py-6 text-foreground-muted border-2 border-dashed border-card-border rounded-lg">
                <p className="text-tactical text-primary mb-1">NO MILESTONES DEPLOYED</p>
                <p className="text-sm">Click ADD to create your first micro-milestone</p>
              </div>
            )}

            <ul className="space-y-1.5" role="list">
              {goal.milestones
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map((milestone) => (
                  <li key={milestone.id} className="flex items-center gap-3 p-3 rounded-lg bg-background-elevated border border-card-border hover:border-hud-border-active transition-colors group">
                    <button
                      onClick={() => onToggleMilestone(milestone.id, !milestone.isCompleted)}
                      className={cn(
                        "flex-shrink-0 w-5 h-5 rounded border-2 transition-all duration-150 flex items-center justify-center",
                        milestone.isCompleted
                          ? "border-secondary bg-secondary text-background"
                          : "border-primary/50 hover:border-primary hover:bg-primary/10"
                      )}
                      aria-label={milestone.isCompleted ? "Mark incomplete" : "Mark complete"}
                    >
                      {milestone.isCompleted && <CheckCircle className="h-3.5 w-3.5" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "font-mono text-sm truncate",
                        milestone.isCompleted ? "line-through text-foreground-muted" : "text-foreground"
                      )}>
                        {milestone.title}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-timestamp text-foreground-muted">
                        <span>{formatDate(milestone.date)}</span>
                        {milestone.notes && (
                          <span className="truncate max-w-xs">{milestone.notes}</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => onDeleteMilestone(milestone.id)}
                      className="flex-shrink-0 p-1.5 rounded-lg text-foreground-muted hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                      aria-label="Delete milestone"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
            </ul>
          </div>

          {/* Assigned Agent */}
          {goal.agent && (
            <div className="p-3 rounded-lg bg-background-elevated border border-card-border">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{goal.agent.avatarIcon}</span>
                <div className="flex-1">
                  <p className="text-tactical text-primary">{goal.agent.rank}</p>
                  <p className="font-mono text-sm text-foreground">{goal.agent.name}</p>
                  <p className="text-timestamp text-foreground-muted truncate">{goal.agent.role}</p>
                </div>
                <span className="text-timestamp text-foreground-muted">{goal.agent.modelEndpoint}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </TacticalCard>
  );
}

export function GoalsClient() {
  const [goals, setGoals] = React.useState<Goal[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetchGoals();
  }, []);

  async function fetchGoals() {
    try {
      setIsLoading(true);
      const response = await fetch("/api/goals");
      if (!response.ok) throw new Error("Failed to fetch goals");
      const data = await response.json();
      setGoals(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleToggleMilestone(milestoneId: string, completed: boolean) {
    try {
      const response = await fetch(`/api/milestones/${milestoneId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted: completed }),
      });
      if (!response.ok) throw new Error("Failed to update milestone");

      setGoals(prev => prev.map(goal => ({
        ...goal,
        milestones: goal.milestones.map(m =>
          m.id === milestoneId ? { ...m, isCompleted: completed } : m
        )
      })));
    } catch (err) {
      console.error("Failed to toggle milestone:", err);
    }
  }

  async function handleAddMilestone(goalId: string, title: string) {
    try {
      const response = await fetch("/api/milestones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goalId, title, date: new Date().toISOString().split("T")[0] }),
      });
      if (!response.ok) throw new Error("Failed to create milestone");
      const newMilestone = await response.json();

      setGoals(prev => prev.map(goal =>
        goal.id === goalId
          ? { ...goal, milestones: [...goal.milestones, newMilestone] }
          : goal
      ));
    } catch (err) {
      console.error("Failed to add milestone:", err);
    }
  }

  async function handleDeleteMilestone(milestoneId: string) {
    try {
      const response = await fetch(`/api/milestones/${milestoneId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete milestone");

      setGoals(prev => prev.map(goal => ({
        ...goal,
        milestones: goal.milestones.filter(m => m.id !== milestoneId)
      })));
    } catch (err) {
      console.error("Failed to delete milestone:", err);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-tactical-xl text-primary">GOALS</h1>
          <p className="text-timestamp text-foreground-muted mt-1">TACTICAL OBJECTIVES & MICRO-MILESTONES</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <TacticalCard key={i} variant="default" withReticle className="h-64 animate-pulse">
              <div className="space-y-4">
                <div className="h-4 w-3/4 bg-muted rounded" />
                <div className="h-4 w-1/2 bg-muted rounded" />
                <div className="h-2 w-full bg-muted rounded" />
                <div className="h-2 w-full bg-muted rounded" />
                <div className="h-2 w-full bg-muted rounded" />
              </div>
            </TacticalCard>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-tactical-xl text-primary">GOALS</h1>
        </div>
        <TacticalCard variant="default" withReticle>
          <div className="text-center py-12">
            <p className="text-destructive-glow text-tactical mb-2">[ERROR]</p>
            <p className="text-foreground-muted">{error}</p>
          </div>
        </TacticalCard>
      </div>
    );
  }

  const activeGoals = goals.filter(g => g.status === "ACTIVE");
  const completedGoals = goals.filter(g => g.status === "COMPLETED");
  const archivedGoals = goals.filter(g => g.status === "ARCHIVED");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-tactical-xl text-primary">GOALS</h1>
        <p className="text-timestamp text-foreground-muted mt-1">TACTICAL OBJECTIVES & MICRO-MILESTONES</p>
      </div>

      {/* Active Campaigns */}
      {activeGoals.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-tactical-lg text-primary flex items-center gap-2">
              <Target className="h-5 w-5" />
              ACTIVE CAMPAIGNS
            </h2>
            <span className="badge-tactical badge-tactical-active">{activeGoals.length} DEPLOYED</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeGoals.map(goal => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onToggleMilestone={handleToggleMilestone}
                onAddMilestone={handleAddMilestone}
                onDeleteMilestone={handleDeleteMilestone}
                onUpdateGoal={(updated) => setGoals(prev => prev.map(g => g.id === updated.id ? updated : g))}
              />
            ))}
          </div>
        </section>
      )}

      {/* Completed Campaigns */}
      {completedGoals.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-tactical-lg text-secondary flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              CONQUERED OBJECTIVES
            </h2>
            <span className="badge-tactical badge-tactical-complete">{completedGoals.length} COMPLETE</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {completedGoals.map(goal => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onToggleMilestone={handleToggleMilestone}
                onAddMilestone={handleAddMilestone}
                onDeleteMilestone={handleDeleteMilestone}
                onUpdateGoal={(updated) => setGoals(prev => prev.map(g => g.id === updated.id ? updated : g))}
              />
            ))}
          </div>
        </section>
      )}

      {/* Archived Campaigns */}
      {archivedGoals.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-tactical-lg text-foreground-muted flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              ARCHIVED OPERATIONS
            </h2>
            <span className="badge-tactical badge-tactical-archived">{archivedGoals.length} ARCHIVED</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {archivedGoals.map(goal => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onToggleMilestone={handleToggleMilestone}
                onAddMilestone={handleAddMilestone}
                onDeleteMilestone={handleDeleteMilestone}
                onUpdateGoal={(updated) => setGoals(prev => prev.map(g => g.id === updated.id ? updated : g))}
              />
            ))}
          </div>
        </section>
      )}

      {goals.length === 0 && (
        <TacticalCard variant="default" withReticle className="text-center py-16">
          <Target className="h-16 w-16 mx-auto text-foreground-muted mb-4" />
          <p className="text-tactical text-primary mb-2">NO CAMPAIGNS DEPLOYED</p>
          <p className="text-foreground-muted mb-6">Initialize your first strategic objective from the command console.</p>
          <TacticalButton variant="primary" leftIcon={<Plus className="h-4 w-4" />}>
            DEPLOY NEW CAMPAIGN
          </TacticalButton>
        </TacticalCard>
      )}
    </div>
  );
}