"use client";

import { useRouter } from "next/navigation";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Edge,
  type Node,
  type NodeProps,
  Handle,
  Position
} from "reactflow";
import "reactflow/dist/style.css";

// ── Custom node components ──────────────────────────────────────────────────

function NoteNode({ data }: NodeProps) {
  return (
    <>
      <Handle type="target" position={Position.Top} className="!border-emerald-500" />
      <div className="flex min-w-[110px] max-w-[180px] cursor-pointer flex-col items-center gap-1 rounded-full border-2 border-emerald-500 bg-emerald-950/60 px-4 py-2 text-center shadow-md shadow-emerald-900/40 transition-transform hover:scale-105">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-emerald-400">
          note
        </span>
        <span className="line-clamp-2 text-xs font-medium text-emerald-100">{data.label}</span>
      </div>
      <Handle type="source" position={Position.Bottom} className="!border-emerald-500" />
    </>
  );
}

function BlogNode({ data }: NodeProps) {
  return (
    <>
      <Handle type="target" position={Position.Top} className="!border-blue-400" />
      <div className="flex min-w-[120px] max-w-[190px] cursor-pointer flex-col items-center gap-1 rounded-lg border-2 border-blue-400 bg-blue-950/60 px-4 py-2.5 text-center shadow-md shadow-blue-900/40 transition-transform hover:scale-105">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-blue-400">
          blog
        </span>
        <span className="line-clamp-2 text-xs font-medium text-blue-100">{data.label}</span>
      </div>
      <Handle type="source" position={Position.Bottom} className="!border-blue-400" />
    </>
  );
}

function BoardNode({ data }: NodeProps) {
  return (
    <>
      <Handle type="target" position={Position.Top} className="!border-amber-400" />
      <div
        className="flex min-w-[110px] max-w-[180px] cursor-pointer flex-col items-center gap-1 bg-amber-950/60 px-4 py-2.5 text-center shadow-md shadow-amber-900/40 transition-transform hover:scale-105"
        style={{
          clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
          border: "2px solid hsl(45 93% 47%)",
          minWidth: 130,
          paddingTop: 24,
          paddingBottom: 24
        }}
      >
        <span className="text-[10px] font-semibold uppercase tracking-widest text-amber-400">
          board
        </span>
        <span className="line-clamp-2 text-xs font-medium text-amber-100">{data.label}</span>
      </div>
      <Handle type="source" position={Position.Bottom} className="!border-amber-400" />
    </>
  );
}

function TopicNode({ data }: NodeProps) {
  const sides = 6;
  const r = 58;
  const points = Array.from({ length: sides }, (_, i) => {
    const a = (Math.PI / sides) * (2 * i - 1);
    return `${50 + r * Math.cos(a)}% ${50 + r * Math.sin(a)}%`;
  }).join(", ");

  return (
    <>
      <Handle type="target" position={Position.Top} className="!border-purple-400" />
      <div
        className="flex min-w-[110px] max-w-[180px] cursor-pointer flex-col items-center gap-1 bg-purple-950/60 px-4 py-3 text-center shadow-md shadow-purple-900/40 transition-transform hover:scale-105"
        style={{
          clipPath: `polygon(${points})`,
          border: "2px solid hsl(270 70% 60%)",
          minWidth: 140,
          paddingTop: 28,
          paddingBottom: 28
        }}
      >
        <span className="text-[10px] font-semibold uppercase tracking-widest text-purple-400">
          topic
        </span>
        <span className="line-clamp-2 text-xs font-medium text-purple-100">{data.label}</span>
      </div>
      <Handle type="source" position={Position.Bottom} className="!border-purple-400" />
    </>
  );
}

const nodeTypes = {
  note: NoteNode,
  blog: BlogNode,
  board: BoardNode,
  topic: TopicNode
};

// ── Main view ───────────────────────────────────────────────────────────────

export function GraphView({
  nodes: initialNodes,
  edges: initialEdges
}: {
  nodes: Node[];
  edges: Edge[];
}) {
  const router = useRouter();
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div className="h-[calc(100vh-11rem)] min-h-[520px] overflow-hidden rounded-lg border bg-background">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        onNodeClick={(_event, node) => {
          const href = node.data?.href as string | undefined;
          if (href) router.push(href as never);
        }}
      >
        <Background color="hsl(218 14% 22%)" gap={24} />
        <MiniMap
          nodeColor={(node) => {
            const colors: Record<string, string> = {
              note: "#10b981",
              blog: "#60a5fa",
              board: "#f59e0b",
              topic: "#a78bfa"
            };
            return colors[node.type ?? ""] ?? "#6b7280";
          }}
          maskColor="rgba(0,0,0,0.6)"
        />
        <Controls />
      </ReactFlow>
    </div>
  );
}
