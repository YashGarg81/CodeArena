import React, { useState, useEffect } from "react";
import { api } from "../../services/api";

const FALLBACK_SNIPPETS = [
  {
    id: "snip_bs",
    title: "Binary Search Template (Iterative)",
    language: "python",
    tags: ["binary-search", "arrays", "template", "dsa"],
    code: `def binary_search(nums, target):
    left, right = 0, len(nums) - 1
    while left <= right:
        mid = left + (right - left) // 2
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1`
  },
  {
    id: "snip_bfs",
    title: "Breadth-First Search (BFS Graph / Matrix)",
    language: "python",
    tags: ["bfs", "graphs", "matrix", "queue"],
    code: `from collections import deque

def bfs(graph, start_node):
    visited = {start_node}
    queue = deque([start_node])
    traversal_order = []

    while queue:
        node = queue.popleft()
        traversal_order.append(node)

        for neighbor in graph.get(node, []):
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)

    return traversal_order`
  },
  {
    id: "snip_dfs",
    title: "Depth-First Search (DFS Backtracking)",
    language: "python",
    tags: ["dfs", "recursion", "backtracking", "graphs"],
    code: `def dfs(graph, node, visited=None, path=None):
    if visited is None:
        visited = set()
    if path is None:
        path = []

    visited.add(node)
    path.append(node)

    for neighbor in graph.get(node, []):
        if neighbor not in visited:
            dfs(graph, neighbor, visited, path)

    return path`
  },
  {
    id: "snip_uf",
    title: "Disjoint Set Union (Union-Find with Rank & Path Compression)",
    language: "python",
    tags: ["union-find", "disjoint-set", "graphs", "kruskal"],
    code: `class UnionFind:
    def __init__(self, size):
        self.parent = list(range(size))
        self.rank = [0] * size
        self.count = size

    def find(self, x):
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])  # Path compression
        return self.parent[x]

    def union(self, x, y):
        root_x, root_y = self.find(x), self.find(y)
        if root_x == root_y:
            return False
        if self.rank[root_x] < self.rank[root_y]:
            self.parent[root_x] = root_y
        elif self.rank[root_x] > self.rank[root_y]:
            self.parent[root_y] = root_x
        else:
            self.parent[root_y] = root_x
            self.rank[root_x] += 1
        self.count -= 1
        return True`
  },
  {
    id: "snip_lru",
    title: "LRU Cache (O(1) Get & Put using Doubly Linked List)",
    language: "python",
    tags: ["lru-cache", "design", "hash-map", "doubly-linked-list"],
    code: `class DLinkedNode:
    def __init__(self, key=0, value=0):
        self.key = key
        self.value = value
        self.prev = None
        self.next = None

class LRUCache:
    def __init__(self, capacity: int):
        self.cache = {}
        self.head = DLinkedNode()
        self.tail = DLinkedNode()
        self.head.next = self.tail
        self.tail.prev = self.head
        self.capacity = capacity
        self.size = 0

    def _remove_node(self, node):
        node.prev.next = node.next
        node.next.prev = node.prev

    def _add_to_head(self, node):
        node.prev = self.head
        node.next = self.head.next
        self.head.next.prev = node
        self.head.next = node

    def get(self, key: int) -> int:
        node = self.cache.get(key, None)
        if not node:
            return -1
        self._remove_node(node)
        self._add_to_head(node)
        return node.value

    def put(self, key: int, value: int) -> None:
        node = self.cache.get(key)
        if not node:
            new_node = DLinkedNode(key, value)
            self.cache[key] = new_node
            self._add_to_head(new_node)
            self.size += 1
            if self.size > self.capacity:
                tail = self.tail.prev
                self._remove_node(tail)
                del self.cache[tail.key]
                self.size -= 1
        else:
            node.value = value
            self._remove_node(node)
            self._add_to_head(node)`
  },
  {
    id: "snip_dijkstra",
    title: "Dijkstra's Shortest Path Algorithm",
    language: "python",
    tags: ["dijkstra", "shortest-path", "heap", "graphs"],
    code: `import heapq

def dijkstra(graph, start, num_nodes):
    distances = {i: float('inf') for i in range(num_nodes)}
    distances[start] = 0
    pq = [(0, start)]

    while pq:
        current_dist, node = heapq.heappop(pq)
        if current_dist > distances[node]:
            continue

        for neighbor, weight in graph.get(node, []):
            distance = current_dist + weight
            if distance < distances[neighbor]:
                distances[neighbor] = distance
                heapq.heappush(pq, (distance, neighbor))

    return distances`
  }
];

export function SnippetsLibraryModal({ onClose, onToast }: { onClose: () => void; onToast: (m: string, t: string) => void }) {
  const [snippets, setSnippets] = useState<any[]>(FALLBACK_SNIPPETS);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedSnippet, setSelectedSnippet] = useState<any | null>(FALLBACK_SNIPPETS[0]);

  useEffect(() => {
    api.get("/api/v1/snippets")
      .then(res => {
        const list = res?.data?.snippets || [];
        if (Array.isArray(list) && list.length > 0) {
          // Merge API list with fallbacks cleanly
          const merged = Array.from(new Map([...list, ...FALLBACK_SNIPPETS].map(s => [s.id, s])).values());
          setSnippets(merged);
          setSelectedSnippet((prev: any) => prev || merged[0]);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = snippets.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    (s.tags || []).some((t: string) => t.toLowerCase().includes(search.toLowerCase()))
  );

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code).then(() => onToast("Snippet copied to clipboard! 📋", "success"));
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 850, width: "95vw" }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18 }}>⚡</span>
            <h3 style={{ fontSize: 16, fontWeight: 800 }}>Algorithmic Snippets & Templates</h3>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div style={{ padding: "16px 20px 0" }}>
          <input
            className="input"
            placeholder="🔍 Search templates (e.g. Binary Search, BFS, DFS, LRU, Segment Tree)..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 16, padding: 20, minHeight: 380, maxHeight: "65vh" }}>
          {/* List */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6, overflowY: "auto" }}>
            {loading ? (
              <div style={{ textAlign: "center", padding: 20, color: "var(--text-muted)" }}>Loading templates...</div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: 20, color: "var(--text-muted)", fontSize: 13 }}>No snippets match your query.</div>
            ) : (
              filtered.map(snip => (
                <div
                  key={snip.id}
                  onClick={() => setSelectedSnippet(snip)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 8,
                    background: selectedSnippet?.id === snip.id ? "var(--bg-tertiary)" : "transparent",
                    border: selectedSnippet?.id === snip.id ? "1px solid var(--accent-primary)" : "1px solid var(--border-light)",
                    cursor: "pointer",
                    transition: "all 0.1s ease"
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text-primary)" }}>{snip.title}</div>
                  <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
                    {(snip.tags || []).slice(0, 2).map((t: string) => (
                      <span key={t} style={{ fontSize: 10, background: "var(--bg-primary)", padding: "1px 5px", borderRadius: 4, color: "var(--text-muted)" }}>{t}</span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Preview & Actions */}
          {selectedSnippet ? (
            <div className="card" style={{ padding: 16, display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 14 }}>{selectedSnippet.title}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Language: {selectedSnippet.language.toUpperCase()}</div>
                </div>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => copyToClipboard(selectedSnippet.code)}
                >
                  📋 Copy Snippet
                </button>
              </div>
              <pre style={{
                flex: 1,
                margin: 0,
                padding: 14,
                background: "var(--bg-primary)",
                borderRadius: 6,
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                overflow: "auto",
                whiteSpace: "pre-wrap",
                lineHeight: 1.5
              }}>
                {selectedSnippet.code}
              </pre>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
              Select a snippet to preview
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary btn-sm" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}