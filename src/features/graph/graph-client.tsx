"use client";

import dynamic from "next/dynamic";
import type { Edge, Node } from "reactflow";

const GraphView = dynamic(() => import("./graph-view").then((m) => m.GraphView), {
  ssr: false
});

export function GraphClient({ nodes, edges }: { nodes: Node[]; edges: Edge[] }) {
  return <GraphView nodes={nodes} edges={edges} />;
}
