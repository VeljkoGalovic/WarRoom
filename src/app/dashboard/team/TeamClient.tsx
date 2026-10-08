"use client";

import * as React from "react";
import { TacticalCard, TacticalCardHeader, TacticalCardTitle, TacticalCardContent, TacticalCardFooter } from "@/components/hud/TacticalCard";
import { StatusBadge } from "@/components/hud/StatusBadge";
import { TerminalInput, TerminalTextarea } from "@/components/hud/TerminalInput";
import { TacticalButton } from "@/components/hud/TacticalButton";
import {
  Bot,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Send,
  Mic,
  Settings,
  X,
  Check,
  Sparkles,
  Zap,
  Shield,
  Cpu,
  Radio,
  Users,
  Terminal,
  Copy,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Agent {
  id: string;
  name: string;
  rank: string;
  role: string;
  systemPrompt: string;
  modelEndpoint: string;
  avatarIcon: string | null;
  identity?: string | null;
  operationalPrompt?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  agentId?: string;
}

const rankInsignia: Record<string, React.ReactNode> = {
  GENERAL: (
    <div className="flex gap-0.5">
      <Zap className="h-4 w-4 text-primary-glow" />
      <Zap className="h-4 w-4 text-primary-glow" />
      <Zap className="h-4 w-4 text-primary-glow" />
      <Zap className="h-4 w-4 text-primary-glow" />
    </div>
  ),
  CAPTAIN: (
    <div className="flex gap-0.5">
      <Shield className="h-4 w-4 text-primary-glow" />
      <Shield className="h-4 w-4 text-primary-glow" />
      <Shield className="h-4 w-4 text-primary-glow" />
    </div>
  ),
  SPECIALIST: (
    <div className="flex gap-0.5">
      <Cpu className="h-4 w-4 text-secondary-glow" />
      <Cpu className="h-4 w-4 text-secondary-glow" />
    </div>
  ),
  LIEUTENANT: (
    <div className="flex gap-0.5">
      <Radio className="h-4 w-4 text-secondary-glow" />
      <Radio className="h-4 w-4 text-secondary-glow" />
    </div>
  ),
  SERGEANT: (
    <div className="flex gap-0.5">
      <Sparkles className="h-4 w-4 text-destructive-glow" />
      <Sparkles className="h-4 w-4 text-destructive-glow" />
      <Sparkles className="h-4 w-4 text-destructive-glow" />
    </div>
  ),
};

const rankLabels: Record<string, string> = {
  GENERAL: "GENERAL",
  CAPTAIN: "CAPTAIN",
  SPECIALIST: "SPECIALIST",
  LIEUTENANT: "LIEUTENANT",
  SERGEANT: "SERGEANT",
};

function AgentCard({ agent, onSelect, isSelected, onEditPrompt }: {
  agent: Agent;
  onSelect: () => void;
  isSelected: boolean;
  onEditPrompt: () => void;
}) {
  return (
    <TacticalCard
      variant={isSelected ? "active" : "default"}
      withReticle
      className="cursor-pointer transition-all hover:border-hud-border-active"
      onClick={onSelect}
    >
      <div className="flex items-start gap-3">
        <span className="flex-shrink-0 text-3xl">{agent.avatarIcon || <Bot className="h-8 w-8 text-foreground-muted" />}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-tactical-lg text-primary">{agent.name}</span>
            {rankInsignia[agent.rank] && <span className="flex items-center">{rankInsignia[agent.rank]}</span>}
          </div>
          <p className="text-tactical text-primary mb-1">{rankLabels[agent.rank] || agent.rank}</p>
          <p className="text-sm text-foreground-muted truncate">{agent.role}</p>
          <div className="flex items-center gap-2 mt-2 text-timestamp text-foreground-muted">
            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-muted border border-card-border">
              <Sparkles className="h-3 w-3" />
              {agent.modelEndpoint.split("/").pop()?.toUpperCase()}
            </span>
            <StatusBadge variant={agent.isActive ? "active" : "archived"} />
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onEditPrompt(); }}
          className="flex-shrink-0 p-1.5 rounded-lg text-foreground-muted hover:text-primary hover:bg-accent transition-colors opacity-0 group-hover:opacity-100"
          aria-label="Edit system prompt"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>
    </TacticalCard>
  );
}

function ChatInterface({ agent, messages, onSendMessage, isStreaming }: {
  agent: Agent | null;
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  isStreaming: boolean;
}) {
  const [input, setInput] = React.useState("");
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isStreaming) {
      onSendMessage(input.trim());
      setInput("");
    }
  };

  if (!agent) {
    return (
      <TacticalCard variant="default" withReticle className="h-full flex flex-col">
        <TacticalCardHeader>
          <div className="flex items-center justify-between">
            <TacticalCardTitle>COMMAND CONSOLE</TacticalCardTitle>
            <StatusBadge variant="standby" />
          </div>
        </TacticalCardHeader>
        <TacticalCardContent className="flex-1 flex items-center justify-center">
          <div className="text-center p-8">
            <Bot className="h-16 w-16 mx-auto text-foreground-muted mb-4" />
            <p className="text-tactical text-primary mb-2">NO AGENT SELECTED</p>
            <p className="text-foreground-muted">Select an agent from the roster to establish a tactical channel</p>
          </div>
        </TacticalCardContent>
      </TacticalCard>
    );
  }

  return (
    <TacticalCard variant="default" withReticle className="h-full flex flex-col">
      <TacticalCardHeader>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{agent.avatarIcon}</span>
          <div>
            <div className="flex items-center gap-2">
              <TacticalCardTitle className="text-tactical-lg">{agent.name}</TacticalCardTitle>
              {rankInsignia[agent.rank]}
            </div>
            <p className="text-tactical text-primary">{rankLabels[agent.rank]}</p>
          </div>
          <div className="flex-1" />
          <span className="badge-tactical badge-tactical-active flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary-glow animate-pulse" />
            CHANNEL OPEN
          </span>
        </div>
      </TacticalCardHeader>

      <TacticalCardContent className="flex-1 overflow-y-auto space-y-4 p-4">
        {messages.length === 0 && (
          <div className="text-center py-8 text-foreground-muted">
            <p className="text-tactical text-primary mb-2">CHANNEL ESTABLISHED</p>
            <p className="text-sm">Awaiting Commander input...</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2 text-timestamp">
              <span className="px-2 py-1 rounded bg-muted border border-card-border">SITREP REQUEST</span>
              <span className="px-2 py-1 rounded bg-muted border border-card-border">TASK DISPATCH</span>
              <span className="px-2 py-1 rounded bg-muted border border-card-border">STRATEGIC QUERY</span>
              <span className="px-2 py-1 rounded bg-muted border border-card-border">INTEL BRIEFING</span>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex gap-3 animate-slide-down",
              msg.role === "user" && "flex-row-reverse"
            )}
          >
            <div
              className={cn(
                "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-mono",
                msg.role === "user"
                  ? "bg-primary/20 text-primary"
                  : "bg-secondary/20 text-secondary"
              )}
            >
              {msg.role === "user" ? "CMD" : agent.rank.slice(0, 3)}
            </div>
            <div
              className={cn(
                "flex-1 max-w-[80%] p-3 rounded-lg",
                msg.role === "user"
                  ? "bg-primary/10 border border-primary/30 text-foreground"
                  : "bg-secondary/10 border border-secondary/30 text-foreground"
              )}
            >
              <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
              <div className="flex items-center justify-end gap-2 mt-1 text-timestamp text-foreground-muted">
                <span>{msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                {msg.role === "assistant" && (
                  <button
                    className="p-1 rounded hover:bg-accent transition-colors"
                    onClick={() => navigator.clipboard.writeText(msg.content)}
                    aria-label="Copy response"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {isStreaming && (
          <div className="flex gap-3 animate-slide-down">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center text-sm font-mono text-secondary">
              {agent.rank.slice(0, 3)}
            </div>
            <div className="flex-1 max-w-[80%] p-3 rounded-lg bg-secondary/10 border border-secondary/30">
              <div className="flex items-center gap-2 text-secondary-glow">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-tactical text-sm">RECEIVING TRANSMISSION...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </TacticalCardContent>

      <TacticalCardFooter className="border-t border-card-border">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <TerminalInput
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="ENTER TRANSMISSION..."
            className="flex-1"
            disabled={isStreaming}
          />
          <TacticalButton
            type="submit"
            variant="primary"
            disabled={!input.trim() || isStreaming}
            rightIcon={isStreaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          >
            {isStreaming ? "STREAMING..." : "TRANSMIT"}
          </TacticalButton>
        </form>
        <p className="text-timestamp text-foreground-muted text-center mt-2">
          ENTER to send • SHIFT+ENTER for new line • ESC to clear
        </p>
      </TacticalCardFooter>
    </TacticalCard>
  );
}

function EditPromptModal({ agent, isOpen, onClose, onSave }: {
  agent: Agent | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { systemPrompt: string; identity: string; operationalPrompt: string }) => void;
}) {
  const [systemPrompt, setSystemPrompt] = React.useState("");
  const [identity, setIdentity] = React.useState("");
  const [operationalPrompt, setOperationalPrompt] = React.useState("");
  const [activeTab, setActiveTab] = React.useState<"identity" | "operational" | "legacy">("identity");

  React.useEffect(() => {
    if (isOpen && agent) {
      setSystemPrompt(agent.systemPrompt);
      setIdentity(agent.identity || "");
      setOperationalPrompt(agent.operationalPrompt || "");
    }
  }, [isOpen, agent]);

  if (!isOpen || !agent) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col">
        <TacticalCard variant="active" withReticle className="flex flex-col overflow-hidden">
          <TacticalCardHeader className="flex flex-row items-center justify-between">
            <div>
              <p className="text-tactical text-primary">EDIT AGENT PERSONA</p>
              <p className="text-timestamp text-foreground-muted">{agent.name} • {rankLabels[agent.rank]}</p>
            </div>
            <button onClick={onClose} className="p-1 rounded hover:bg-accent transition-colors">
              <X className="h-5 w-5" />
            </button>
          </TacticalCardHeader>
          <TacticalCardContent className="flex-1 overflow-y-auto p-4">
            {/* Tab navigation */}
            <div className="flex gap-1 mb-4 border-b border-card-border">
              <button
                onClick={() => setActiveTab("identity")}
                className={`px-3 py-2 text-sm font-mono rounded-t transition-colors ${
                  activeTab === "identity"
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground-muted hover:text-foreground"
                }`}
              >
                IDENTITY
              </button>
              <button
                onClick={() => setActiveTab("operational")}
                className={`px-3 py-2 text-sm font-mono rounded-t transition-colors ${
                  activeTab === "operational"
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground-muted hover:text-foreground"
                }`}
              >
                OPERATIONAL
              </button>
              <button
                onClick={() => setActiveTab("legacy")}
                className={`px-3 py-2 text-sm font-mono rounded-t transition-colors ${
                  activeTab === "legacy"
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground-muted hover:text-foreground"
                }`}
              >
                LEGACY
              </button>
            </div>

            {/* Tab content */}
            {activeTab === "identity" && (
              <div className="space-y-4">
                <label className="block text-xs font-mono text-foreground-muted mb-1">
                  IDENTITY — Stable "who am I" (persistent across tasks)
                </label>
                <TerminalTextarea
                  value={identity}
                  onChange={(e) => setIdentity(e.target.value)}
                  placeholder="e.g., You are GENERAL VANCE, supreme strategic commander..."
                  className="h-[40vh] font-mono text-sm"
                  rows={15}
                />
                <p className="text-xs text-foreground-muted">
                  This defines the agent's core identity, rank, and character. Persists across all tasks.
                </p>
              </div>
            )}

            {activeTab === "operational" && (
              <div className="space-y-4">
                <label className="block text-xs font-mono text-foreground-muted mb-1">
                  OPERATIONAL PROMPT — Default task framing (can vary by context)
                </label>
                <TerminalTextarea
                  value={operationalPrompt}
                  onChange={(e) => setOperationalPrompt(e.target.value)}
                  placeholder="e.g., Think in campaigns, not tasks. Prioritize ruthlessly..."
                  className="h-[40vh] font-mono text-sm"
                  rows={15}
                />
                <p className="text-xs text-foreground-muted">
                  This defines how the agent approaches tasks. Can be overridden per-request.
                </p>
              </div>
            )}

            {activeTab === "legacy" && (
              <div className="space-y-4">
                <label className="block text-xs font-mono text-foreground-muted mb-1">
                  LEGACY SYSTEM PROMPT — Deprecated (kept for backward compatibility)
                </label>
                <TerminalTextarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="FULL SYSTEM PROMPT..."
                  className="h-[40vh] font-mono text-sm"
                  rows={15}
                />
                <p className="text-xs text-destructive-glow">
                  ⚠ Legacy field. Prefer using Identity + Operational Prompt instead.
                </p>
              </div>
            )}
          </TacticalCardContent>
          <TacticalCardFooter className="flex justify-end gap-2 border-t border-card-border">
            <TacticalButton variant="ghost" onClick={onClose}>CANCEL</TacticalButton>
            <TacticalButton variant="primary" onClick={() => {
              onSave({ systemPrompt, identity, operationalPrompt });
              onClose();
            }} leftIcon={<Check className="h-4 w-4" />}>
              SAVE PERSONA
            </TacticalButton>
          </TacticalCardFooter>
        </TacticalCard>
      </div>
    </div>
  );
}

export function TeamClient() {
  const [agents, setAgents] = React.useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = React.useState<Agent | null>(null);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [editingAgent, setEditingAgent] = React.useState<Agent | null>(null);

  React.useEffect(() => {
    fetchAgents();
  }, []);

  async function fetchAgents() {
    try {
      setIsLoading(true);
      const response = await fetch("/api/agents");
      if (!response.ok) throw new Error("Failed to fetch agents");
      const data = await response.json();
      setAgents(data);
      if (data.length > 0 && !selectedAgent) {
        setSelectedAgent(data[0]);
        await fetchMessages(data[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchMessages(agentId: string) {
    try {
      const response = await fetch(`/api/agents/${agentId}/messages`);
      if (!response.ok) throw new Error("Failed to fetch messages");
      const data = await response.json();
      setMessages(data.map((m: any) => ({
        ...m,
        timestamp: new Date(m.timestamp),
      })));
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    }
  }

  async function handleSendMessage(content: string) {
    if (!selectedAgent) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date(),
      agentId: selectedAgent.id,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsStreaming(true);

    try {
      const response = await fetch("/api/agents/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: selectedAgent.id,
          message: content,
          systemPrompt: selectedAgent.systemPrompt,
          model: selectedAgent.modelEndpoint,
          channel: "internal",
        }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";
      let messageId = `msg-${Date.now()}`;

      // Add placeholder for assistant message
      setMessages((prev) => [...prev, {
        id: messageId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        agentId: selectedAgent.id,
      }]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          assistantMessage += chunk;
          setMessages((prev) => prev.map((m) =>
            m.id === messageId ? { ...m, content: assistantMessage } : m
          ));
        }
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
    } finally {
      setIsStreaming(false);
    }
  }

  function handleSelectAgent(agent: Agent) {
    setSelectedAgent(agent);
    setMessages([]);
    fetchMessages(agent.id);
  }

  function handleEditPrompt(agent: Agent) {
    setEditingAgent(agent);
    setShowEditModal(true);
  }

  function handleSavePrompt(data: { systemPrompt: string; identity: string; operationalPrompt: string }) {
    if (!editingAgent) return;
    // Call API to persist changes
    fetch(`/api/agents/${editingAgent.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemPrompt: data.systemPrompt,
        identity: data.identity,
        operationalPrompt: data.operationalPrompt,
      }),
    }).catch((err) => console.error("Failed to update agent:", err));

    // Update local state immediately for responsiveness
    setAgents((prev) => prev.map((a) =>
      a.id === editingAgent.id ? { ...a, systemPrompt: data.systemPrompt, identity: data.identity, operationalPrompt: data.operationalPrompt } : a
    ));
    if (selectedAgent?.id === editingAgent.id) {
      setSelectedAgent((prev) => prev ? { ...prev, systemPrompt: data.systemPrompt, identity: data.identity, operationalPrompt: data.operationalPrompt } : null);
    }
    setEditingAgent(null);
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-tactical-xl text-primary">COMMAND STAFF</h1>
          <p className="text-timestamp text-foreground-muted mt-1">AI TACTICAL AGENT ROSTER</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <TacticalCard key={i} variant="default" withReticle className="h-64 animate-pulse">
              <div className="space-y-4">
                <div className="h-8 w-3/4 bg-muted rounded" />
                <div className="h-4 w-1/2 bg-muted rounded" />
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
          <h1 className="text-tactical-xl text-primary">COMMAND STAFF</h1>
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-tactical-xl text-primary">COMMAND STAFF</h1>
        <p className="text-timestamp text-foreground-muted mt-1">AI TACTICAL AGENT ROSTER & TACTICAL DISPATCH</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Agent Roster */}
        <div className="lg:col-span-1 space-y-4">
          <TacticalCard variant="default" withReticle>
            <TacticalCardHeader>
              <TacticalCardTitle>ACTIVE ROSTER</TacticalCardTitle>
            </TacticalCardHeader>
            <TacticalCardContent className="space-y-3 p-0">
              {agents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  isSelected={selectedAgent?.id === agent.id}
                  onSelect={() => handleSelectAgent(agent)}
                  onEditPrompt={() => handleEditPrompt(agent)}
                />
              ))}
            </TacticalCardContent>
          </TacticalCard>
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-3 h-[calc(100vh-280px)]">
          <ChatInterface
            agent={selectedAgent}
            messages={messages}
            onSendMessage={handleSendMessage}
            isStreaming={isStreaming}
          />
        </div>
      </div>

      {/* Edit Prompt Modal */}
      <EditPromptModal
        agent={editingAgent}
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); setEditingAgent(null); }}
        onSave={handleSavePrompt}
      />
    </div>
  );
}