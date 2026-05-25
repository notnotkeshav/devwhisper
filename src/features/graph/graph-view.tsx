"use client";

import ReactFlow, { Background, Controls, MiniMap, type Edge, type Node } from "reactflow";
import "reactflow/dist/style.css";

export function GraphView({ nodes, edges }: { nodes: Node[]; edges: Edge[] }) {
  return (
    <div className="h-[calc(100vh-11rem)] min-h-[520px] overflow-hidden rounded-lg border bg-background">
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <Background />
        <MiniMap />
        <Controls />
      </ReactFlow>
    </div>
  );
}
