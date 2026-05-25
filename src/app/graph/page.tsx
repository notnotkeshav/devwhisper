import { PageHeader } from "@/components/page/page-header";
import { getGraphData } from "@/features/graph/repository";
import { GraphClient } from "@/features/graph/graph-client";
import { buildGraph } from "@/lib/graph/build";

export const dynamic = "force-dynamic";

export default async function GraphPage() {
  const data = await getGraphData();
  const graph = buildGraph(data);
  const nodes = graph.nodes.map((node, index) => ({
    id: node.id,
    data: { label: node.label },
    position: { x: (index % 6) * 180, y: Math.floor(index / 6) * 120 },
    type: "default"
  }));
  const edges = graph.edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: edge.kind
  }));

  return (
    <>
      <PageHeader
        title="Knowledge Graph"
        description="Visualize notes, blogs, topics, boards, references, backlinks, dependencies, and related concepts."
      />
      <GraphClient nodes={nodes} edges={edges} />
    </>
  );
}
