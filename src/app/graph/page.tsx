import { PageHeader } from "@/components/page/page-header";
import { getGraphData } from "@/features/graph/repository";
import { GraphClient } from "@/features/graph/graph-client";
import { buildGraph } from "@/lib/graph/build";
import { requireUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

function radialLayout(count: number, index: number, radius = 300) {
  if (count === 0) return { x: 0, y: 0 };
  if (count === 1) return { x: 0, y: 0 };
  const angle = (2 * Math.PI * index) / count - Math.PI / 2;
  return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius };
}

export default async function GraphPage() {
  const user = await requireUser();
  const data = await getGraphData(user.id);
  const graph = buildGraph(data);

  const nodesByType = {
    note: graph.nodes.filter((n) => n.type === "note"),
    blog: graph.nodes.filter((n) => n.type === "blog"),
    board: graph.nodes.filter((n) => n.type === "board"),
    topic: graph.nodes.filter((n) => n.type === "topic")
  };

  // Place each type group in its own orbital ring
  const typeOffsets: Record<string, { cx: number; cy: number; r: number }> = {
    topic: { cx: 0, cy: 0, r: 0 },
    note: { cx: 450, cy: 0, r: 160 },
    blog: { cx: 0, cy: 380, r: 160 },
    board: { cx: -450, cy: 0, r: 120 }
  };

  const positionMap = new Map<string, { x: number; y: number }>();

  for (const [type, list] of Object.entries(nodesByType)) {
    const { cx, cy, r } = typeOffsets[type];
    list.forEach((node, i) => {
      const pos = radialLayout(list.length, i, r);
      positionMap.set(node.id, { x: cx + pos.x, y: cy + pos.y });
    });
  }

  const nodes = graph.nodes.map((node) => ({
    id: node.id,
    data: { label: node.label, href: node.href, nodeType: node.type },
    position: positionMap.get(node.id) ?? { x: 0, y: 0 },
    type: node.type
  }));

  const edges = graph.edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: edge.kind,
    animated: edge.kind === "published_from",
    style: { stroke: "hsl(var(--border))", strokeWidth: 1.5 }
  }));

  return (
    <>
      <PageHeader
        title="Knowledge Graph"
        description="All your notes, blogs, boards, and topics — visually connected."
      />
      <GraphClient nodes={nodes} edges={edges} />
    </>
  );
}
