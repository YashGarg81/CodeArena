// backend/src/roadmapRoutes.ts
import { Router } from "express";
import { prisma } from "../db";
import { optionalAuth, auth, type AuthenticatedRequest } from "./auth";
import { requirePermission } from "./rbac";

export const roadmapRouter = Router();

// 1. List all roadmaps with user progress
roadmapRouter.get("/", optionalAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const roadmaps = await prisma.roadmap.findMany({
      orderBy: { order: "asc" },
      include: {
        _count: { select: { nodes: true } },
        progress: req.userId ? { where: { userId: req.userId } } : false,
      },
    });

    const formatted = roadmaps.map((r: any) => {
      const userProgress = r.progress?.[0];
      const completedCount = userProgress?.completedNodeIds?.length || 0;
      const totalCount = r._count.nodes || 1;
      const percentage = Math.min(100, Math.round((completedCount / totalCount) * 100));

      return {
        id: r.id,
        slug: r.slug,
        title: r.title,
        description: r.description,
        icon: r.icon,
        estimatedWeeks: r.estimatedWeeks,
        nodeCount: r._count.nodes,
        progressPercent: req.userId ? percentage : 0,
      };
    });

    res.json({ roadmaps: formatted });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Get roadmap detail by slug
roadmapRouter.get("/:slug", optionalAuth, async (req: AuthenticatedRequest, res) => {
  const { slug } = req.params;
  try {
    const roadmap = await prisma.roadmap.findUnique({
      where: { slug },
      include: {
        nodes: { orderBy: { order: "asc" } },
        progress: req.userId ? { where: { userId: req.userId } } : false,
      },
    });

    if (!roadmap) {
      return res.status(404).json({ error: "Roadmap not found" });
    }

    const completedNodeIds = roadmap.progress?.[0]?.completedNodeIds || [];
    const formattedNodes = roadmap.nodes.map((n: any) => ({
      ...n,
      isCompleted: completedNodeIds.includes(n.id),
    }));

    res.json({
      roadmap: {
        id: roadmap.id,
        slug: roadmap.slug,
        title: roadmap.title,
        description: roadmap.description,
        icon: roadmap.icon,
        estimatedWeeks: roadmap.estimatedWeeks,
        nodes: formattedNodes,
        completedNodeIds,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Toggle Node Completion
roadmapRouter.post("/:slug/toggle-node", auth, async (req: AuthenticatedRequest, res) => {
  const { slug } = req.params;
  const { nodeId } = req.body;

  if (!nodeId) {
    return res.status(400).json({ error: "nodeId is required" });
  }

  try {
    const roadmap = await prisma.roadmap.findUnique({ where: { slug } });
    if (!roadmap) return res.status(404).json({ error: "Roadmap not found" });

    const existingProgress = await prisma.roadmapProgress.findUnique({
      where: { userId_roadmapId: { userId: req.userId!, roadmapId: roadmap.id } },
    });

    let currentCompleted = existingProgress?.completedNodeIds || [];
    if (currentCompleted.includes(nodeId)) {
      currentCompleted = currentCompleted.filter((id: string) => id !== nodeId);
    } else {
      currentCompleted = [...currentCompleted, nodeId];
    }

    const progress = await prisma.roadmapProgress.upsert({
      where: { userId_roadmapId: { userId: req.userId!, roadmapId: roadmap.id } },
      update: { completedNodeIds: currentCompleted },
      create: {
        userId: req.userId!,
        roadmapId: roadmap.id,
        completedNodeIds: currentCompleted,
      },
    });

    res.json({ success: true, completedNodeIds: progress.completedNodeIds });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
