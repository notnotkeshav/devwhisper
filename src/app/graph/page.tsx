import { PageHeader } from "@/components/page/page-header";
import { getGraphData } from "@/features/graph/repository";
import { GraphClient } from "@/features/graph/graph-client";
import { buildGraph } from "@/lib/graph/build";
import { requireUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

// Lay out a group of nodes in a grid, centred at (cx, cy) with given cell spacing
function gridLayout(
  list: { id: string }[],
  cx: number,
  cy: number,
  cellW = 220,
  cellH = 110
): Map<string, { x: number; y: number }> {
  const cols = Math.max(1, Math.ceil(Math.sqrt(list.length)));
  const map = new Map<string, { x: number; y: number }>();
  list.forEach((node, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const totalW = (Math.min(list.length, cols) - 1) * cellW;
    const totalH = (Math.ceil(list.length / cols) - 1) * cellH;
    map.set(node.id, {
      x: cx - totalW / 2 + col * cellW,
      y: cy - totalH / 2 + row * cellH
    });
  });
  return map;
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

  // Each type gets its own quadrant; grids within each quadrant prevent overlap
  const typeOrigins: Record<string, { cx: number; cy: number }> = {
    note: { cx: 500, cy: -250 },
    blog: { cx: 500, cy: 250 },
    board: { cx: -500, cy: -250 },
    topic: { cx: -500, cy: 250 }
  };

  const positionMap = new Map<string, { x: number; y: number }>();
  for (const [type, list] of Object.entries(nodesByType)) {
    const { cx, cy } = typeOrigins[type]!;
    for (const [id, pos] of gridLayout(list, cx, cy)) {
      positionMap.set(id, pos);
    }
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
