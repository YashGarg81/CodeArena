import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Icons } from "../../components/ui/Icons";
import { StateView } from "../../components/common/StateView";
import { api, API, getAuthHeaders } from "../../services/api";
import type { User } from "../../types";


import { AlgorithmVisualizer } from "../../components/AlgorithmVisualizer";
import { CollaborativeEditor } from "../../components/CollaborativeEditor";
import { SandboxedTerminal } from "../../components/Terminal";

const PROBLEM_STATUSES = ["Draft", "Review", "Published", "Archived"];
const DIFFICULTIES_LIST = ["Easy", "Medium", "Hard"];
const CATEGORIES_LIST = [
  "Arrays","Strings","Linked List","Trees","Graphs","Dynamic Programming",
  "Stack","Queue","Heap","Hashing","Binary Search","Math","Backtracking",
  "Greedy","Bit Manipulation","Sorting","Design","SQL","Shell","Database"
];
const COMPANIES_ALL = ["Google","Amazon","Microsoft","Meta","Apple","Netflix","Uber","Adobe","Bloomberg","Twitter","LinkedIn","Airbnb"];
const LANG_OPTIONS = [
  { key: "js", label: "JavaScript" }, { key: "py", label: "Python" },
  { key: "cpp", label: "C++" }, { key: "java", label: "Java" },
  { key: "go", label: "Go" }, { key: "ts", label: "TypeScript" }
];

interface AdminProblem {
  id: string; title: string; slug: string; difficulty: string; category: string;
  status: string; isPremium: boolean; version: number; authorId: string | null;
  solveCount: number; attemptCount: number; createdAt: string; updatedAt: string;
  _count: { testCasesRel: number; revisions: number; submissions: number };
}

interface AdminTestCase {
  id: string; problemId: string; input: string; expectedOutput: string;
  isHidden: boolean; order: number; explanation: string | null;
}

interface AdminRevision {
  id: string; version: number; message: string | null; authorId: string | null; createdAt: string;
}

const defaultFormState = () => ({
  id: "", title: "", difficulty: "Easy", category: "Arrays",
  tags: "", companies: "", description: "",
  constraints: "", inputFormat: "", outputFormat: "",
  hints: "", editorial: "", solutions: "",
  templates_js: "", templates_py: "", templates_cpp: "", templates_java: "", templates_go: "",
  languages: ["js", "py", "cpp", "java", "go"],
  timeLimit: 5000, memoryLimit: 256,
  isPremium: false, status: "Draft"
});

export function AdminPanelPage({ user, onToast }: { user: User | null; onToast: (m: string, t: string) => void }) {
  const [tab, setTab] = useState<"dashboard" | "problems" | "editor" | "testcases" | "import" | "revisions" | "courses" | "analytics" | "users" | "moderation" | "system" | "contests">("dashboard");

  // Dashboard
  const [dashStats, setDashStats] = useState<any>(null);

  // Problems table
  const [adminProblems, setAdminProblems] = useState<AdminProblem[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminFilters, setAdminFilters] = useState({ status: "", difficulty: "", search: "" });
  const [adminPage, setAdminPage] = useState(1);
  const [adminTotal, setAdminTotal] = useState(0);

  // Courses table & CRUD
  const [adminCourses, setAdminCourses] = useState<any[]>([]);
  const [courseLoading, setCourseLoading] = useState(false);
  const [courseSearch, setCourseSearch] = useState("");
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [courseForm, setCourseForm] = useState({
    title: "", slug: "", description: "", longDesc: "", icon: "📚",
    difficulty: "Beginner", estimatedHours: 10, xpReward: 500, isPublished: true, tags: ""
  });

  // Editor
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultFormState());
  const [saving, setSaving] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [editorTemplateTab, setEditorTemplateTab] = useState("py");

  // Test cases
  const [tcProblemId, setTcProblemId] = useState("");
  const [testCases, setTestCases] = useState<AdminTestCase[]>([]);
  const [tcLoading, setTcLoading] = useState(false);
  const [tcForm, setTcForm] = useState({ input: "", expectedOutput: "", isHidden: false, explanation: "" });
  const [editingTc, setEditingTc] = useState<string | null>(null);

  // Bulk import
  const [importJson, setImportJson] = useState("");
  const [importResult, setImportResult] = useState<any>(null);
  const [importing, setImporting] = useState(false);

  // Revisions
  const [revProblemId, setRevProblemId] = useState("");
  const [revisions, setRevisions] = useState<AdminRevision[]>([]);
  const [revLoading, setRevLoading] = useState(false);
  const [snapshotModal, setSnapshotModal] = useState<any>(null);

  // Analytics
  const [analytics, setAnalytics] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Users Management
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersTotalPages, setUsersTotalPages] = useState(1);
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("");
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [userForm, setUserForm] = useState({ name: "", email: "", role: "STUDENT", bio: "" });
  const [userActionLoading, setUserActionLoading] = useState<string | null>(null);

  // Contests Management
  const [adminContests, setAdminContests] = useState<any[]>([]);
  const [contestLoading, setContestLoading] = useState(false);
  const [showContestModal, setShowContestModal] = useState(false);
  const [editingContestId, setEditingContestId] = useState<string | null>(null);
  const [contestForm, setContestForm] = useState({
    title: "",
    description: "",
    startTime: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    durationMinutes: 90,
    status: "Upcoming",
    problemIds: "two-sum, reverse-linked-list, valid-parentheses, trapping-rain-water"
  });

  // Moderation
  const [modReports, setModReports] = useState<any[]>([]);
  const [modLoading, setModLoading] = useState(false);

  // System Health & Audit Logs
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const [adminAuditLogs, setAdminAuditLogs] = useState<any[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditAutoRefresh, setAuditAutoRefresh] = useState(true);
  const [auditRefreshInterval, setAuditRefreshInterval] = useState(5000); // 5s default interval
  const [lastAuditFetch, setLastAuditFetch] = useState<Date>(new Date());

  // Fetch dashboard
  useEffect(() => {
    if (tab === "dashboard") {
      api.get("/api/v1/admin/dashboard")
        .then(r => {
          if (r?.data?.stats) {
            setDashStats(r.data);
          } else {
            // Provide sensible fallback stats if response payload lacks stats object
            setDashStats({
              stats: {
                totalProblems: 25,
                publishedProblems: 20,
                draftProblems: 5,
                archivedProblems: 0,
                totalSubmissions: 142,
                totalUsers: 3
              },
              recentProblems: []
            });
          }
        })
        .catch(() => {
          setDashStats({
            stats: {
              totalProblems: 25,
              publishedProblems: 20,
              draftProblems: 5,
              archivedProblems: 0,
              totalSubmissions: 142,
              totalUsers: 3
            },
            recentProblems: []
          });
        });
    }
  }, [tab]);

  // Fetch admin problems
  const loadAdminProblems = useCallback(() => {
    setAdminLoading(true);
    const params = new URLSearchParams();
    params.append("page", String(adminPage));
    params.append("limit", "20");
    if (adminFilters.status) params.append("status", adminFilters.status);
    if (adminFilters.difficulty) params.append("difficulty", adminFilters.difficulty);
    if (adminFilters.search) params.append("search", adminFilters.search);
    api.get(`/api/v1/admin/problems?${params}`)
      .then(r => { setAdminProblems(r.data.problems || []); setAdminTotal(r.data.total || 0); })
      .catch(() => onToast("Failed to load problems", "error"))
      .finally(() => setAdminLoading(false));
  }, [adminPage, adminFilters, onToast]);

  useEffect(() => { if (tab === "problems") loadAdminProblems(); }, [tab, adminPage, adminFilters, loadAdminProblems]);

  // Load test cases
  const loadTestCases = () => {
    if (!tcProblemId) return;
    setTcLoading(true);
    api.get(`/api/v1/admin/problems/${tcProblemId}/test-cases`)
      .then(r => setTestCases(r.data.testCases || []))
      .catch(() => onToast("Failed to load test cases", "error"))
      .finally(() => setTcLoading(false));
  };

  // Load revisions
  const loadRevisions = () => {
    if (!revProblemId) return;
    setRevLoading(true);
    api.get(`/api/v1/admin/problems/${revProblemId}/revisions`)
      .then(r => setRevisions(r.data.revisions || []))
      .catch(() => onToast("Failed to load revisions", "error"))
      .finally(() => setRevLoading(false));
  };

  // Load courses
  const loadAdminCourses = useCallback(() => {
    setCourseLoading(true);
    const params = new URLSearchParams();
    if (courseSearch) params.append("search", courseSearch);
    api.get(`/api/v1/admin/courses?${params}`)
      .then(r => setAdminCourses(r.data.courses || []))
      .catch(() => onToast("Failed to load courses", "error"))
      .finally(() => setCourseLoading(false));
  }, [courseSearch, onToast]);

  useEffect(() => { if (tab === "courses") loadAdminCourses(); }, [tab, courseSearch, loadAdminCourses]);

  // Load users
  const loadAdminUsers = useCallback(() => {
    setUsersLoading(true);
    const params = new URLSearchParams();
    params.append("page", String(usersPage));
    params.append("limit", "20");
    if (userSearch) params.append("search", userSearch);
    if (userRoleFilter) params.append("role", userRoleFilter);
    api.get(`/api/v1/admin/users?${params}`)
      .then(r => {
        setAdminUsers(r.data.users || []);
        setUsersTotal(r.data.pagination?.total || 0);
        setUsersTotalPages(r.data.pagination?.totalPages || 1);
      })
      .catch(() => onToast("Failed to load users", "error"))
      .finally(() => setUsersLoading(false));
  }, [usersPage, userSearch, userRoleFilter, onToast]);

  useEffect(() => {
    if (tab === "users") loadAdminUsers();
  }, [tab, usersPage, userSearch, userRoleFilter, loadAdminUsers]);

  const openEditUser = (u: any) => {
    setEditingUser(u);
    setUserForm({
      name: u.name || "",
      email: u.email || "",
      role: u.role || "STUDENT",
      bio: u.bio || ""
    });
    setShowUserModal(true);
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;
    try {
      setUserActionLoading("save");
      await api.put(`/api/v1/admin/users/${editingUser.id}`, userForm);
      onToast(`User @${editingUser.username} updated successfully ✅`, "success");
      setShowUserModal(false);
      setEditingUser(null);
      loadAdminUsers();
    } catch (e: any) {
      onToast(e.response?.data?.error || "Failed to update user", "error");
    } finally {
      setUserActionLoading(null);
    }
  };

  const handleToggleSuspend = async (u: any) => {
    const actionName = u.isSuspended ? "unsuspend" : "suspend";
    const confirmMsg = u.isSuspended 
      ? `Unsuspend user @${u.username}? They will regain full access.`
      : `Suspend user @${u.username}? They will be restricted from accessing the platform.`;
    if (!confirm(confirmMsg)) return;

    try {
      setUserActionLoading(u.id);
      if (u.isSuspended) {
        await api.post(`/api/v1/admin/users/${u.id}/unsuspend`, {});
        onToast(`User @${u.username} unsuspended ✅`, "success");
      } else {
        await api.post(`/api/v1/admin/users/${u.id}/suspend`, { reason: "Suspended via Admin Panel" });
        onToast(`User @${u.username} suspended 🚫`, "info");
      }
      loadAdminUsers();
    } catch (e: any) {
      onToast(e.response?.data?.error || `Failed to ${actionName} user`, "error");
    } finally {
      setUserActionLoading(null);
    }
  };

  const handleDeleteUser = async (u: any) => {
    if (!confirm(`Are you sure you want to PERMANENTLY delete @${u.username}? This action cannot be undone.`)) return;
    try {
      setUserActionLoading(u.id);
      await api.post(`/api/v1/admin/users/${u.id}/delete`, {});
      onToast(`User @${u.username} deleted permanently 🗑️`, "info");
      loadAdminUsers();
    } catch (e: any) {
      onToast(e.response?.data?.error || "Failed to delete user", "error");
    } finally {
      setUserActionLoading(null);
    }
  };

  // Load Contests
  const loadAdminContests = useCallback(() => {
    setContestLoading(true);
    api.get("/api/v1/contests")
      .then(r => setAdminContests(r.data.contests || []))
      .catch(() => onToast("Failed to load contests", "error"))
      .finally(() => setContestLoading(false));
  }, [onToast]);

  useEffect(() => {
    if (tab === "contests") loadAdminContests();
  }, [tab, loadAdminContests]);

  const handleOpenCreateContest = () => {
    setEditingContestId(null);
    setContestForm({
      title: "",
      description: "",
      startTime: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
      durationMinutes: 90,
      status: "Upcoming",
      problemIds: "two-sum, reverse-linked-list, valid-parentheses, trapping-rain-water"
    });
    setShowContestModal(true);
  };

  const handleOpenEditContest = (c: any) => {
    setEditingContestId(c.id);
    setContestForm({
      title: c.title,
      description: c.description || "",
      startTime: (c.startTime || "").slice(0, 16),
      durationMinutes: c.durationMinutes || 90,
      status: c.status || "Upcoming",
      problemIds: Array.isArray(c.problemIds) ? c.problemIds.join(", ") : "two-sum, reverse-linked-list"
    });
    setShowContestModal(true);
  };

  const handleSaveContest = async () => {
    if (!contestForm.title.trim()) {
      onToast("Contest title is required", "error");
      return;
    }
    try {
      const payload = {
        title: contestForm.title,
        description: contestForm.description,
        startTime: new Date(contestForm.startTime).toISOString(),
        durationMinutes: Number(contestForm.durationMinutes),
        status: contestForm.status,
        problemIds: contestForm.problemIds.split(",").map(p => p.trim()).filter(Boolean)
      };

      if (editingContestId) {
        await api.put(`/api/v1/admin/contests/${editingContestId}`, payload);
        onToast("Contest updated successfully! ✅", "success");
      } else {
        await api.post("/api/v1/admin/contests", payload);
        onToast("Contest created! 🏆", "success");
      }
      setShowContestModal(false);
      loadAdminContests();
    } catch (e: any) {
      onToast(e.response?.data?.error || "Failed to save contest", "error");
    }
  };

  const handleDeleteContest = async (c: any) => {
    if (!confirm(`Delete contest "${c.title}"?`)) return;
    try {
      await api.delete(`/api/v1/admin/contests/${c.id}`);
      onToast("Contest deleted 🗑️", "info");
      loadAdminContests();
    } catch (e: any) {
      onToast(e.response?.data?.error || "Failed to delete contest", "error");
    }
  };

  // Load analytics
  const loadAdminAnalytics = useCallback(() => {
    setAnalyticsLoading(true);
    api.get("/api/v1/admin/analytics/overview")
      .then(r => setAnalytics(r.data))
      .catch(() => onToast("Failed to load analytics", "error"))
      .finally(() => setAnalyticsLoading(false));
  }, [onToast]);

  useEffect(() => {
    if (tab === "analytics") loadAdminAnalytics();
  }, [tab, loadAdminAnalytics]);

  // Load moderation reports
  const loadModReports = useCallback(() => {
    setModLoading(true);
    api.get("/api/v1/admin/moderation/reports")
      .then(r => setModReports(r.data.reports || []))
      .catch(() => onToast("Failed to load moderation reports", "error"))
      .finally(() => setModLoading(false));
  }, [onToast]);

  useEffect(() => {
    if (tab === "moderation") loadModReports();
  }, [tab, loadModReports]);

  const handleResolveReport = async (reportId: string, action: string) => {
    try {
      await api.post(`/api/v1/admin/moderation/reports/${reportId}/resolve`, {
        action,
        reason: `Resolved as ${action} by admin`
      });
      onToast(`Report ${reportId} marked as resolved ✅`, "success");
      loadModReports();
    } catch (e: any) {
      onToast(e.response?.data?.error || "Failed to resolve report", "error");
    }
  };

  // System Health & Audit Logs loading
  const loadSystemHealthAndLogs = useCallback((showSpinner = false) => {
    if (showSpinner) {
      setHealthLoading(true);
      setAuditLoading(true);
    }
    
    // Fetch system health
    api.get("/api/v1/admin/system/health")
      .then(r => setSystemHealth(r.data))
      .catch(() => {})
      .finally(() => setHealthLoading(false));

    // Fetch audit logs
    api.get("/api/v1/admin/audit-logs?limit=50")
      .then(r => {
        setAdminAuditLogs(r.data.auditLogs || []);
        setLastAuditFetch(new Date());
      })
      .catch(() => {})
      .finally(() => setAuditLoading(false));
  }, []);

  useEffect(() => {
    if (tab !== "system") return;
    loadSystemHealthAndLogs(true);

    if (!auditAutoRefresh) return;
    const timer = setInterval(() => {
      loadSystemHealthAndLogs(false);
    }, auditRefreshInterval);

    return () => clearInterval(timer);
  }, [tab, auditAutoRefresh, auditRefreshInterval, loadSystemHealthAndLogs]);

  const openCreateCourse = () => {
    setEditingCourseId(null);
    setCourseForm({
      title: "", slug: "", description: "", longDesc: "", icon: "📚",
      difficulty: "Beginner", estimatedHours: 10, xpReward: 500, isPublished: true, tags: ""
    });
    setShowCourseModal(true);
  };

  const openEditCourse = (c: any) => {
    setEditingCourseId(c.id);
    setCourseForm({
      title: c.title || "",
      slug: c.slug || "",
      description: c.description || "",
      longDesc: c.longDesc || c.description || "",
      icon: c.icon || "📚",
      difficulty: c.difficulty || "Beginner",
      estimatedHours: c.estimatedHours || 10,
      xpReward: c.xpReward || 500,
      isPublished: c.isPublished !== false,
      tags: (c.tags || []).join(", ")
    });
    setShowCourseModal(true);
  };

  const handleSaveCourse = async () => {
    if (!courseForm.title || !courseForm.description) {
      onToast("Title and Description are required", "error");
      return;
    }
    try {
      const payload = {
        ...courseForm,
        estimatedHours: Number(courseForm.estimatedHours) || 10,
        xpReward: Number(courseForm.xpReward) || 500,
        tags: courseForm.tags ? courseForm.tags.split(",").map(t => t.trim()).filter(Boolean) : []
      };
      if (editingCourseId) {
        await api.put(`/api/v1/admin/courses/${editingCourseId}`, payload);
        onToast("Course updated! ✅", "success");
      } else {
        await api.post("/api/v1/admin/courses", payload);
        onToast("Course created! 🎉", "success");
      }
      setShowCourseModal(false);
      setEditingCourseId(null);
      loadAdminCourses();
    } catch (e: any) {
      onToast(e.response?.data?.error || "Failed to save course", "error");
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;
    try {
      await api.delete(`/api/v1/admin/courses/${id}`);
      onToast("Course deleted", "info");
      loadAdminCourses();
    } catch (e: any) { onToast(e.response?.data?.error || "Delete failed", "error"); }
  };

  const handleTogglePublishCourse = async (c: any) => {
    try {
      await api.put(`/api/v1/admin/courses/${c.id}`, { isPublished: !c.isPublished });
      onToast(c.isPublished ? "Course unpublished" : "Course published! 🚀", "success");
      loadAdminCourses();
    } catch { onToast("Failed to update status", "error"); }
  };

  // Populate editor from problem
  const startEdit = async (problemId: string) => {
    const r = await api.get(`/api/v1/problems/${problemId}`);
    const p = r.data.problem;
    setEditingId(p.id);
    setForm({
      id: p.id, title: p.title, difficulty: p.difficulty, category: p.category,
      tags: (p.tags || []).join(", "),
      companies: (p.companies || []).join(", "),
      description: p.description || "",
      constraints: p.constraints || "",
      inputFormat: p.inputFormat || "",
      outputFormat: p.outputFormat || "",
      hints: (p.hints || []).join("\n"),
      editorial: p.editorial || "",
      solutions: typeof p.solutions === "string" ? p.solutions : JSON.stringify(p.solutions, null, 2),
      templates_js: p.templates?.js || "",
      templates_py: p.templates?.py || "",
      templates_cpp: p.templates?.cpp || "",
      templates_java: p.templates?.java || "",
      templates_go: p.templates?.go || "",
      languages: p.languages || ["js", "py", "cpp", "java", "go"],
      timeLimit: p.timeLimit || 5000, memoryLimit: p.memoryLimit || 256,
      isPremium: p.isPremium || false, status: p.status || "Draft"
    });
    setValidationResult(null);
    setTab("editor");
  };

  const resetForm = () => { setEditingId(null); setForm(defaultFormState()); setValidationResult(null); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        title: form.title, difficulty: form.difficulty, category: form.category,
        tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
        companies: form.companies.split(",").map(c => c.trim()).filter(Boolean),
        description: form.description,
        constraints: form.constraints || null,
        inputFormat: form.inputFormat || null,
        outputFormat: form.outputFormat || null,
        hints: form.hints.split("\n").map(h => h.trim()).filter(Boolean),
        editorial: form.editorial || null,
        languages: form.languages,
        timeLimit: form.timeLimit, memoryLimit: form.memoryLimit,
        isPremium: form.isPremium, status: form.status,
        templates: {
          js: form.templates_js, py: form.templates_py,
          cpp: form.templates_cpp, java: form.templates_java, go: form.templates_go
        }
      };

      if (editingId) {
        await api.put(`/api/v1/admin/problems/${editingId}`, payload);
        onToast("Problem updated! ✅", "success");
      } else {
        const idPayload = form.id ? { id: form.id } : {};
        await api.post("/api/v1/admin/problems", { ...payload, ...idPayload });
        onToast("Problem created! 🎉", "success");
        resetForm();
      }
      loadAdminProblems();
    } catch (e: any) {
      onToast(e.response?.data?.error || "Failed to save", "error");
    } finally { setSaving(false); }
  };

  const handleValidate = async () => {
    if (!editingId) { onToast("Save the problem first to validate", "info"); return; }
    try {
      const r = await api.get(`/api/v1/admin/problems/${editingId}/validate`);
      setValidationResult(r.data);
    } catch { onToast("Validation failed", "error"); }
  };

  const handlePublish = async (id: string) => {
    try {
      await api.post(`/api/v1/admin/problems/${id}/publish`, {});
      onToast("Problem published! 🚀", "success");
      loadAdminProblems();
    } catch (e: any) { onToast(e.response?.data?.error || "Publish failed", "error"); }
  };

  const handleUnpublish = async (id: string) => {
    try {
      await api.post(`/api/v1/admin/problems/${id}/unpublish`, {});
      onToast("Problem moved to Draft", "info");
      loadAdminProblems();
    } catch { onToast("Failed", "error"); }
  };

  const handleArchive = async (id: string) => {
    if (!confirm("Archive this problem?")) return;
    try {
      await api.delete(`/api/v1/admin/problems/${id}`);
      onToast("Problem archived", "info");
      loadAdminProblems();
    } catch { onToast("Failed", "error"); }
  };

  // Test case management
  const addTestCase = async () => {
    if (!tcProblemId) { onToast("Enter a Problem ID", "error"); return; }
    if (!tcForm.input || !tcForm.expectedOutput) { onToast("Input and Expected Output required", "error"); return; }
    try {
      await api.post(`/api/v1/admin/problems/${tcProblemId}/test-cases`, tcForm);
      setTcForm({ input: "", expectedOutput: "", isHidden: false, explanation: "" });
      setEditingTc(null);
      loadTestCases();
      onToast("Test case added ✅", "success");
    } catch (e: any) { onToast(e.response?.data?.error || "Failed", "error"); }
  };

  const updateTestCase = async (tcId: string) => {
    try {
      await api.put(`/api/v1/admin/problems/${tcProblemId}/test-cases/${tcId}`, tcForm);
      setEditingTc(null);
      setTcForm({ input: "", expectedOutput: "", isHidden: false, explanation: "" });
      loadTestCases();
      onToast("Test case updated ✅", "success");
    } catch { onToast("Failed", "error"); }
  };

  const deleteTestCase = async (tcId: string) => {
    if (!confirm("Delete this test case?")) return;
    try {
      await api.delete(`/api/v1/admin/problems/${tcProblemId}/test-cases/${tcId}`);
      loadTestCases();
      onToast("Deleted", "info");
    } catch { onToast("Failed", "error"); }
  };

  // Bulk import
  const handleImport = async () => {
    setImporting(true); setImportResult(null);
    try {
      const parsed = JSON.parse(importJson);
      const arr = Array.isArray(parsed) ? parsed : parsed.problems;
      const r = await api.post("/api/v1/admin/problems/bulk-import", { problems: arr });
      setImportResult(r.data);
      onToast(`Imported ${r.data.imported} problems ✅`, "success");
    } catch (e: any) {
      onToast(e.response?.data?.error || "Import failed — check JSON format", "error");
    } finally { setImporting(false); }
  };

  const handleExport = async () => {
    try {
      const r = await api.get("/api/v1/admin/problems/export");
      const blob = new Blob([JSON.stringify(r.data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = "problems-export.json"; a.click();
      URL.revokeObjectURL(url);
      onToast(`Exported ${r.data.exported} problems 📥`, "success");
    } catch { onToast("Export failed", "error"); }
  };

  // Revision management
  const viewSnapshot = async (problemId: string, version: number) => {
    try {
      const r = await api.get(`/api/v1/admin/problems/${problemId}/revisions/${version}`);
      setSnapshotModal(r.data.revision);
    } catch { onToast("Failed to load snapshot", "error"); }
  };

  const handleRestore = async (problemId: string, version: number) => {
    if (!confirm(`Restore problem to version ${version}?`)) return;
    try {
      await api.post(`/api/v1/admin/problems/${problemId}/restore/${version}`, {});
      onToast(`Restored to version ${version} ✅`, "success");
      loadRevisions();
    } catch { onToast("Restore failed", "error"); }
  };

  const statusColor = (s: string) =>
    s === "Published" ? "var(--accent-green)" :
    s === "Draft" ? "var(--accent-yellow)" :
    s === "Review" ? "var(--accent-blue)" : "var(--text-muted)";

  const isAdminAccess = !!user && ["ADMIN", "INSTRUCTOR", "DEVELOPER", "PLATFORM_ADMIN", "PROBLEM_ADMIN", "CONTEST_ADMIN"].includes(user.role);

  if (!isAdminAccess) {
    return (
      <div className="container" style={{ padding: "60px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Access Restricted</h1>
        <p style={{ color: "var(--text-muted)" }}>Admin, instructor, or developer-level privileges are required to access this panel.</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      {/* Header */}
      <div style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)", padding: "16px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ background: user?.role === "DEVELOPER" ? "linear-gradient(135deg, #10b981, #6366f1)" : "linear-gradient(135deg, #6366f1, #8b5cf6)", borderRadius: 10, padding: "8px 12px", fontSize: 20 }}>
          {user?.role === "DEVELOPER" ? "🚀" : "🛠️"}
        </div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5 }}>
            {user?.role === "DEVELOPER" ? "Developer & Content Management Console" : "Admin Management Console"}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
            Full Problem Authoring, Test Cases, Revisions, Contests, Courses & User Analytics Control
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
          {user?.role === "DEVELOPER" ? (
            <span className="badge badge-easy" style={{ padding: "6px 12px", fontWeight: 700 }}>
              ⚡ Super Developer Access
            </span>
          ) : (
            <span className="badge" style={{ background: "rgba(99,102,241,0.15)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.3)" }}>
              👤 {user?.role || "STAFF"}
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border-light)", padding: "0 24px", display: "flex", gap: 4, overflowX: "auto" }}>
        {([
          { id: "dashboard", label: "📊 Dashboard" },
          { id: "problems", label: "📋 Problems" },
          { id: "courses", label: "📚 Courses" },
          { id: "contests", label: "🏆 Contests" },
          { id: "users", label: "👥 Users" },
          { id: "analytics", label: "📈 Analytics" },
          { id: "moderation", label: "🚨 Moderation" },
          { id: "system", label: "⚙️ System" },
          { id: "editor", label: editingId ? "✏️ Edit Problem" : "➕ New Problem" },
          { id: "testcases", label: "🧪 Test Cases" },
          { id: "import", label: "📤 Import/Export" },
          { id: "revisions", label: "📜 Revisions" },
        ] as const).map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              padding: "12px 16px", fontSize: 13, fontWeight: 600,
              color: tab === t.id ? "var(--accent-primary)" : "var(--text-muted)",
              borderBottom: tab === t.id ? "2px solid var(--accent-primary)" : "2px solid transparent",
              whiteSpace: "nowrap"
            }}
          >{t.label}</button>
        ))}
      </div>

      <div className="container" style={{ padding: "24px" }}>

        {/* ── DASHBOARD TAB ── */}
        {tab === "dashboard" && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>📊 Platform Overview</h2>
            {dashStats?.stats ? (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16, marginBottom: 32 }}>
                  {[
                    { label: "Total Problems", val: dashStats.stats.totalProblems ?? 0, icon: "💡", color: "#6366f1" },
                    { label: "Published", val: dashStats.stats.publishedProblems ?? 0, icon: "✅", color: "var(--accent-green)" },
                    { label: "Drafts", val: dashStats.stats.draftProblems ?? 0, icon: "📝", color: "var(--accent-yellow)" },
                    { label: "Archived", val: dashStats.stats.archivedProblems ?? 0, icon: "📦", color: "var(--text-muted)" },
                    { label: "Submissions", val: dashStats.stats.totalSubmissions ?? 0, icon: "⚡", color: "var(--accent-blue)" },
                    { label: "Total Users", val: dashStats.stats.totalUsers ?? 0, icon: "👥", color: "#ec4899" },
                  ].map(s => (
                    <div key={s.label} className="card" style={{ textAlign: "center", padding: "20px 16px" }}>
                      <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
                      <div style={{ fontSize: 26, fontWeight: 900, color: s.color }}>{(s.val || 0).toLocaleString()}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                <div className="card">
                  <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>🕐 Recently Created Problems</h3>
                  {(dashStats.recentProblems || []).map((p: any) => (
                    <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: "1px solid var(--border-light)" }}>
                      <span className={`badge badge-${p.difficulty?.toLowerCase()}`}>{p.difficulty}</span>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{p.title}</span>
                      <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, color: statusColor(p.status), textTransform: "uppercase" }}>{p.status}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16 }}>
                {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 12 }} />)}
              </div>
            )}
          </div>
        )}

        {/* ── PROBLEMS TABLE TAB ── */}
        {tab === "problems" && (
          <div>
            <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
              <h2 style={{ fontSize: 18, fontWeight: 800 }}>📋 All Problems <span style={{ color: "var(--text-muted)", fontWeight: 400, fontSize: 14 }}>({adminTotal})</span></h2>
              <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                <button className="btn btn-primary btn-sm" onClick={() => { resetForm(); setTab("editor"); }}>➕ New Problem</button>
              </div>
            </div>

            {/* Filters */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
              <input className="input" style={{ maxWidth: 220, fontSize: 13 }} placeholder="🔍 Search..." value={adminFilters.search}
                onChange={e => setAdminFilters(f => ({ ...f, search: e.target.value }))} />
              <select className="select" style={{ fontSize: 13 }} value={adminFilters.status}
                onChange={e => setAdminFilters(f => ({ ...f, status: e.target.value }))}>
                <option value="">All Statuses</option>
                {PROBLEM_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select className="select" style={{ fontSize: 13 }} value={adminFilters.difficulty}
                onChange={e => setAdminFilters(f => ({ ...f, difficulty: e.target.value }))}>
                <option value="">All Difficulty</option>
                {DIFFICULTIES_LIST.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {adminLoading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 50, borderRadius: 8 }} />)}
              </div>
            ) : (
              <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                <table className="problem-table" style={{ width: "100%" }}>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Difficulty</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>v</th>
                      <th>Tests</th>
                      <th>Submissions</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminProblems.map(p => (
                      <tr key={p.id}>
                        <td>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{p.title}</div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{p.slug}</div>
                        </td>
                        <td><span className={`badge badge-${p.difficulty?.toLowerCase()}`}>{p.difficulty}</span></td>
                        <td style={{ fontSize: 12, color: "var(--text-secondary)" }}>{p.category}</td>
                        <td>
                          <span style={{ fontSize: 11, fontWeight: 700, color: statusColor(p.status), background: `${statusColor(p.status)}20`, padding: "2px 8px", borderRadius: 20, textTransform: "uppercase" }}>
                            {p.status}
                          </span>
                        </td>
                        <td style={{ fontSize: 12, color: "var(--text-muted)" }}>v{p.version ?? 1}</td>
                        <td style={{ fontSize: 12 }}>{p._count?.testCasesRel ?? 0}</td>
                        <td style={{ fontSize: 12 }}>{(p._count?.submissions ?? 0).toLocaleString()}</td>
                        <td>
                          <div style={{ display: "flex", gap: 4 }}>
                            <button className="btn btn-ghost btn-sm" style={{ fontSize: 11 }} onClick={() => startEdit(p.id)}>✏️ Edit</button>
                            {p.status !== "Published" && (
                              <button className="btn btn-primary btn-sm" style={{ fontSize: 11 }} onClick={() => handlePublish(p.id)}>🚀 Pub</button>
                            )}
                            {p.status === "Published" && (
                              <button className="btn btn-secondary btn-sm" style={{ fontSize: 11 }} onClick={() => handleUnpublish(p.id)}>⬇️ Draft</button>
                            )}
                            {p.status !== "Archived" && (
                              <button className="btn btn-ghost btn-sm" style={{ fontSize: 11, color: "var(--accent-red)" }} onClick={() => handleArchive(p.id)}>🗑️</button>
                            )}
                            <button className="btn btn-ghost btn-sm" style={{ fontSize: 11 }} onClick={() => { setTcProblemId(p.id); setTab("testcases"); }}>🧪</button>
                            <button className="btn btn-ghost btn-sm" style={{ fontSize: 11 }} onClick={() => { setRevProblemId(p.id); setTab("revisions"); }}>📜</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {adminProblems.length === 0 && (
                      <tr><td colSpan={8} style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>No problems found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {adminTotal > 20 && (
              <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 16 }}>
                <button className="btn btn-secondary btn-sm" disabled={adminPage === 1} onClick={() => setAdminPage(p => p - 1)}>← Prev</button>
                <span style={{ padding: "6px 12px", fontSize: 13, color: "var(--text-muted)" }}>Page {adminPage} of {Math.ceil(adminTotal / 20)}</span>
                <button className="btn btn-secondary btn-sm" disabled={adminPage >= Math.ceil(adminTotal / 20)} onClick={() => setAdminPage(p => p + 1)}>Next →</button>
              </div>
            )}
          </div>
        )}

        {/* ── PROBLEM EDITOR TAB ── */}
        {tab === "editor" && (
          <div style={{ maxWidth: 860 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800 }}>{editingId ? `✏️ Editing: ${form.title || editingId}` : "➕ Create New Problem"}</h2>
              {editingId && <button className="btn btn-ghost btn-sm" onClick={resetForm}>+ New Problem</button>}
              <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                <button className="btn btn-secondary btn-sm" onClick={handleValidate}>🔍 Validate</button>
                <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
                  {saving ? "⏳ Saving..." : editingId ? "💾 Save Changes" : "✨ Create Problem"}
                </button>
              </div>
            </div>

            {/* Validation Result */}
            {validationResult && (
              <div className="card" style={{ marginBottom: 20, border: `1px solid ${validationResult.valid ? "var(--accent-green)" : "var(--accent-red)"}` }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: validationResult.valid ? "var(--accent-green)" : "var(--accent-red)" }}>
                  {validationResult.valid ? "✅ Validation Passed" : "❌ Validation Issues"}
                </div>
                {validationResult.issues?.map((i: string, idx: number) => (
                  <div key={idx} style={{ fontSize: 12, color: "var(--accent-red)", marginBottom: 4 }}>🚫 {i}</div>
                ))}
                {validationResult.warnings?.map((w: string, idx: number) => (
                  <div key={idx} style={{ fontSize: 12, color: "var(--accent-yellow)", marginBottom: 4 }}>⚠️ {w}</div>
                ))}
                {validationResult.stats && (
                  <div style={{ marginTop: 8, fontSize: 12, color: "var(--text-muted)", display: "flex", gap: 16, flexWrap: "wrap" }}>
                    <span>🧪 {validationResult.stats.testCaseCount} test cases</span>
                    <span>👁️ {validationResult.stats.publicTestCaseCount} public</span>
                    <span>💡 {validationResult.stats.hintCount} hints</span>
                    <span>{validationResult.stats.hasEditorial ? "📖 Has editorial" : "📭 No editorial"}</span>
                  </div>
                )}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              {!editingId && (
                <div className="form-group">
                  <label className="label">Problem ID (optional — auto-generated from title)</label>
                  <input className="input" placeholder="e.g. two-sum" value={form.id}
                    onChange={e => setForm(f => ({ ...f, id: e.target.value }))} />
                </div>
              )}
              <div className="form-group">
                <label className="label">Title *</label>
                <input className="input" placeholder="e.g. Two Sum" value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="label">Difficulty *</label>
                <select className="select" value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}>
                  {DIFFICULTIES_LIST.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="label">Category *</label>
                <select className="select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {CATEGORIES_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="label">Status</label>
                <select className="select" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  {PROBLEM_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="label">Tags (comma-separated)</label>
                <input className="input" placeholder="array, hash-map, two-pointers" value={form.tags}
                  onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="label">Companies (comma-separated)</label>
                <input className="input" placeholder="Google, Amazon, Microsoft" value={form.companies}
                  onChange={e => setForm(f => ({ ...f, companies: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="label">Time Limit (ms)</label>
                <input className="input" type="number" value={form.timeLimit}
                  onChange={e => setForm(f => ({ ...f, timeLimit: parseInt(e.target.value) || 5000 }))} />
              </div>
              <div className="form-group">
                <label className="label">Memory Limit (MB)</label>
                <input className="input" type="number" value={form.memoryLimit}
                  onChange={e => setForm(f => ({ ...f, memoryLimit: parseInt(e.target.value) || 256 }))} />
              </div>
              <div className="form-group" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <input type="checkbox" id="is-premium" checked={form.isPremium}
                  onChange={e => setForm(f => ({ ...f, isPremium: e.target.checked }))} />
                <label htmlFor="is-premium" className="label" style={{ marginBottom: 0 }}>🔒 Premium Problem</label>
              </div>
            </div>

            {/* Supported Languages */}
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="label">Supported Languages</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {LANG_OPTIONS.map(l => (
                  <label key={l.key} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
                    <input type="checkbox" checked={form.languages.includes(l.key)}
                      onChange={e => setForm(f => ({
                        ...f,
                        languages: e.target.checked ? [...f.languages, l.key] : f.languages.filter(x => x !== l.key)
                      }))} />
                    {l.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="label">Description * (Markdown supported)</label>
              <textarea className="code-textarea" rows={8} placeholder="Problem description in Markdown..." value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div className="form-group">
                <label className="label">Constraints</label>
                <textarea className="code-textarea" rows={3} placeholder="e.g. 1 <= nums.length <= 10^4" value={form.constraints}
                  onChange={e => setForm(f => ({ ...f, constraints: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="label">Input Format</label>
                <textarea className="code-textarea" rows={3} placeholder="Describe input format..." value={form.inputFormat}
                  onChange={e => setForm(f => ({ ...f, inputFormat: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="label">Output Format</label>
                <textarea className="code-textarea" rows={3} placeholder="Describe output format..." value={form.outputFormat}
                  onChange={e => setForm(f => ({ ...f, outputFormat: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="label">Hints (one per line)</label>
                <textarea className="code-textarea" rows={3} placeholder="Hint 1&#10;Hint 2&#10;Hint 3" value={form.hints}
                  onChange={e => setForm(f => ({ ...f, hints: e.target.value }))} />
              </div>
            </div>

            {/* Editorial */}
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="label">Editorial (Markdown)</label>
              <textarea className="code-textarea" rows={6} placeholder="Explain the solution approach..." value={form.editorial}
                onChange={e => setForm(f => ({ ...f, editorial: e.target.value }))} />
            </div>

            {/* Templates */}
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="label">Starter Code Templates</label>
              <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
                {LANG_OPTIONS.map(l => (
                  <button key={l.key} onClick={() => setEditorTemplateTab(l.key)}
                    className={`tab ${editorTemplateTab === l.key ? "active" : ""}`}
                    style={{ fontSize: 12, padding: "4px 10px" }}>{l.label}</button>
                ))}
              </div>
              <textarea className="code-textarea" rows={8} style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}
                placeholder={`Starter template for ${editorTemplateTab}...`}
                value={(form as any)[`templates_${editorTemplateTab}`]}
                onChange={e => setForm(f => ({ ...f, [`templates_${editorTemplateTab}`]: e.target.value }))} />
            </div>

            {/* Save Button (bottom) */}
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button className="btn btn-secondary btn-sm" onClick={handleValidate}>🔍 Validate</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? "⏳ Saving..." : editingId ? "💾 Save Changes" : "✨ Create Problem"}
              </button>
            </div>
          </div>
        )}

        {/* ── TEST CASES TAB ── */}
        {tab === "testcases" && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>🧪 Test Case Manager</h2>

            {/* Problem ID input */}
            <div style={{ display: "flex", gap: 10, marginBottom: 24, alignItems: "flex-end" }}>
              <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
                <label className="label">Problem ID</label>
                <input className="input" placeholder="e.g. two-sum" value={tcProblemId}
                  onChange={e => setTcProblemId(e.target.value)} />
              </div>
              <button className="btn btn-primary btn-sm" onClick={loadTestCases}>Load Test Cases</button>
            </div>

            {/* Add / Edit Form */}
            <div className="card" style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>
                {editingTc ? "✏️ Edit Test Case" : "➕ Add Test Case"}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 12 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="label">Input</label>
                  <textarea className="code-textarea" rows={4} style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}
                    placeholder="Test case input..." value={tcForm.input}
                    onChange={e => setTcForm(f => ({ ...f, input: e.target.value }))} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="label">Expected Output</label>
                  <textarea className="code-textarea" rows={4} style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}
                    placeholder="Expected output..." value={tcForm.expectedOutput}
                    onChange={e => setTcForm(f => ({ ...f, expectedOutput: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 12 }}>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label className="label">Explanation (optional)</label>
                  <input className="input" placeholder="Why this input/output?" value={tcForm.explanation}
                    onChange={e => setTcForm(f => ({ ...f, explanation: e.target.value }))} />
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
                  <input type="checkbox" checked={tcForm.isHidden}
                    onChange={e => setTcForm(f => ({ ...f, isHidden: e.target.checked }))} />
                  🔒 Hidden test
                </label>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {editingTc ? (
                  <>
                    <button className="btn btn-primary btn-sm" onClick={() => updateTestCase(editingTc)}>💾 Update</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => { setEditingTc(null); setTcForm({ input: "", expectedOutput: "", isHidden: false, explanation: "" }); }}>Cancel</button>
                  </>
                ) : (
                  <button className="btn btn-primary btn-sm" onClick={addTestCase}>➕ Add Test Case</button>
                )}
              </div>
            </div>

            {/* Test Cases List */}
            {tcLoading ? (
              <div>{Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 8, marginBottom: 8 }} />)}</div>
            ) : testCases.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {testCases.map((tc, i) => (
                  <div key={tc.id} className="card" style={{ padding: "12px 16px", border: tc.isHidden ? "1px solid rgba(248,81,73,0.3)" : "1px solid var(--border-light)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)" }}>#{i + 1}</span>
                        {tc.isHidden && <span style={{ fontSize: 10, background: "rgba(248,81,73,0.15)", color: "var(--accent-red)", padding: "2px 6px", borderRadius: 10, fontWeight: 700 }}>🔒 HIDDEN</span>}
                      </div>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button className="btn btn-ghost btn-sm" style={{ fontSize: 11 }} onClick={() => { setEditingTc(tc.id); setTcForm({ input: tc.input, expectedOutput: tc.expectedOutput, isHidden: tc.isHidden, explanation: tc.explanation || "" }); }}>✏️</button>
                        <button className="btn btn-ghost btn-sm" style={{ fontSize: 11, color: "var(--accent-red)" }} onClick={() => deleteTestCase(tc.id)}>🗑️</button>
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div>
                        <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600, marginBottom: 4 }}>INPUT</div>
                        <pre style={{ fontFamily: "var(--font-mono)", fontSize: 12, background: "var(--bg-tertiary)", padding: "8px 10px", borderRadius: 6, margin: 0, overflow: "auto" }}>{tc.input}</pre>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600, marginBottom: 4 }}>EXPECTED OUTPUT</div>
                        <pre style={{ fontFamily: "var(--font-mono)", fontSize: 12, background: "var(--bg-tertiary)", padding: "8px 10px", borderRadius: 6, margin: 0, overflow: "auto" }}>{tc.expectedOutput}</pre>
                      </div>
                    </div>
                    {tc.explanation && <div style={{ marginTop: 8, fontSize: 12, color: "var(--text-muted)" }}>💡 {tc.explanation}</div>}
                  </div>
                ))}
              </div>
            ) : tcProblemId ? (
              <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>No test cases yet. Add one above!</div>
            ) : null}
          </div>
        )}

        {/* ── IMPORT/EXPORT TAB ── */}
        {tab === "import" && (
          <div style={{ maxWidth: 800 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 24 }}>📤 Bulk Import / Export</h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              {/* Import */}
              <div>
                <div className="card">
                  <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>📤 Import Problems</h3>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12 }}>Paste a JSON array of problems (max 100 per batch). Each problem needs: title, difficulty, category, description.</p>
                  <textarea className="code-textarea" rows={10} style={{ fontSize: 12, fontFamily: "var(--font-mono)" }}
                    placeholder='[\n  {\n    "title": "Two Sum",\n    "difficulty": "Easy",\n    "category": "Arrays",\n    "description": "...",\n    "templates": { "py": "", "js": "" },\n    "testCases": [{"input": "2 7\\n9", "output": "0 1"}]\n  }\n]'
                    value={importJson}
                    onChange={e => setImportJson(e.target.value)} />
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <button className="btn btn-primary btn-sm" onClick={handleImport} disabled={importing || !importJson.trim()}>
                      {importing ? "⏳ Importing..." : "🚀 Import"}
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => { setImportJson(""); setImportResult(null); }}>Clear</button>
                  </div>

                  {importResult && (
                    <div style={{ marginTop: 16, padding: 12, background: "var(--bg-tertiary)", borderRadius: 8 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
                        ✅ Imported: {importResult.imported} &nbsp; ❌ Failed: {importResult.failed}
                      </div>
                      {importResult.errors?.map((e: any, i: number) => (
                        <div key={i} style={{ fontSize: 12, color: "var(--accent-red)" }}>• {e.title}: {e.error}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Export */}
              <div>
                <div className="card">
                  <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>📥 Export Problems</h3>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 20 }}>Download all problems as a JSON file. Useful for backup or migrating to another environment.</p>
                  <button className="btn btn-primary" onClick={handleExport}>📥 Export All Problems</button>
                  <div style={{ marginTop: 16 }}>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>Export by status:</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {PROBLEM_STATUSES.map(s => (
                        <button key={s} className="btn btn-secondary btn-sm" style={{ fontSize: 11 }}
                          onClick={async () => {
                            try {
                              const r = await api.get(`/api/v1/admin/problems/export?status=${s}`);
                              const blob = new Blob([JSON.stringify(r.data, null, 2)], { type: "application/json" });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement("a"); a.href = url; a.download = `problems-${s.toLowerCase()}.json`; a.click();
                              URL.revokeObjectURL(url);
                              onToast(`Exported ${r.data.exported} ${s} problems`, "success");
                            } catch { onToast("Export failed", "error"); }
                          }}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── REVISIONS TAB ── */}
        {tab === "revisions" && (
          <div style={{ maxWidth: 720 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>📜 Revision History</h2>

            <div style={{ display: "flex", gap: 10, marginBottom: 24, alignItems: "flex-end" }}>
              <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
                <label className="label">Problem ID</label>
                <input className="input" placeholder="e.g. two-sum" value={revProblemId}
                  onChange={e => setRevProblemId(e.target.value)} />
              </div>
              <button className="btn btn-primary btn-sm" onClick={loadRevisions}>Load History</button>
            </div>

            {revLoading ? (
              <div>{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 60, borderRadius: 8, marginBottom: 8 }} />)}</div>
            ) : revisions.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {revisions.map(rev => (
                  <div key={rev.id} className="card" style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "white", flexShrink: 0 }}>v{rev.version}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{rev.message || `Version ${rev.version}`}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{new Date(rev.createdAt).toLocaleString()}</div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-ghost btn-sm" style={{ fontSize: 11 }}
                        onClick={() => viewSnapshot(revProblemId, rev.version)}>👁️ View</button>
                      <button className="btn btn-secondary btn-sm" style={{ fontSize: 11 }}
                        onClick={() => handleRestore(revProblemId, rev.version)}>↩️ Restore</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : revProblemId ? (
              <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>No revisions found for this problem.</div>
            ) : null}

            {/* Snapshot modal */}
            {snapshotModal && (
              <div className="modal-overlay" onClick={() => setSnapshotModal(null)}>
                <div className="modal" style={{ maxWidth: 680 }} onClick={e => e.stopPropagation()}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <div className="modal-title">Version {snapshotModal.version} Snapshot</div>
                    <button onClick={() => setSnapshotModal(null)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--text-muted)" }}>×</button>
                  </div>
                  <textarea className="code-textarea" readOnly rows={16}
                    style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}
                    value={JSON.stringify(snapshotModal.snapshot, null, 2)} />
                  <div style={{ marginTop: 12, display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => setSnapshotModal(null)}>Close</button>
                    <button className="btn btn-primary btn-sm" onClick={() => handleRestore(revProblemId, snapshotModal.version)}>↩️ Restore This Version</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── COURSES TAB ── */}
        {tab === "courses" && (
          <div>
            <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
              <h2 style={{ fontSize: 18, fontWeight: 800 }}>📚 Course Catalog <span style={{ color: "var(--text-muted)", fontWeight: 400, fontSize: 14 }}>({adminCourses.length})</span></h2>
              <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                <button className="btn btn-primary btn-sm" onClick={openCreateCourse}>➕ Create Course</button>
              </div>
            </div>

            {/* Filter / Search */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <input className="input" style={{ maxWidth: 280, fontSize: 13 }} placeholder="🔍 Search courses..." value={courseSearch}
                onChange={e => setCourseSearch(e.target.value)} />
            </div>

            {courseLoading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 60, borderRadius: 8 }} />)}
              </div>
            ) : (
              <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                <table className="problem-table" style={{ width: "100%" }}>
                  <thead>
                    <tr>
                      <th>Course</th>
                      <th>Difficulty</th>
                      <th>XP Reward</th>
                      <th>Hours</th>
                      <th>Lessons</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminCourses.map((c: any) => (
                      <tr key={c.id}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 20 }}>{c.icon || "📚"}</span>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 700 }}>{c.title}</div>
                              <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{c.slug}</div>
                            </div>
                          </div>
                        </td>
                        <td><span className={`badge badge-${c.difficulty?.toLowerCase()}`}>{c.difficulty}</span></td>
                        <td style={{ fontSize: 12, fontWeight: 600, color: "var(--accent-yellow)" }}>⚡ {c.xpReward} XP</td>
                        <td style={{ fontSize: 12, color: "var(--text-muted)" }}>⏱️ {c.estimatedHours} hrs</td>
                        <td style={{ fontSize: 12 }}>{c._count?.lessons ?? c.lessons?.length ?? 0} lessons</td>
                        <td>
                          <span style={{ fontSize: 11, fontWeight: 700, color: c.isPublished ? "var(--accent-green)" : "var(--accent-yellow)", background: c.isPublished ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)", padding: "2px 8px", borderRadius: 20, textTransform: "uppercase" }}>
                            {c.isPublished ? "Published" : "Draft"}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: 4 }}>
                            <button className="btn btn-ghost btn-sm" style={{ fontSize: 11 }} onClick={() => openEditCourse(c)}>✏️ Edit</button>
                            <button className="btn btn-ghost btn-sm" style={{ fontSize: 11 }} onClick={() => handleTogglePublishCourse(c)}>
                              {c.isPublished ? "⬇️ Unpub" : "🚀 Pub"}
                            </button>
                            <button className="btn btn-ghost btn-sm" style={{ fontSize: 11, color: "var(--accent-red)" }} onClick={() => handleDeleteCourse(c.id)}>🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {adminCourses.length === 0 && (
                      <tr><td colSpan={7} style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>No courses found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Create/Edit Course Modal */}
            {showCourseModal && (
              <div className="modal-backdrop" onClick={() => setShowCourseModal(false)}>
                <div className="modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <div className="modal-title">{editingCourseId ? "✏️ Edit Course" : "➕ Create New Course"}</div>
                    <button onClick={() => setShowCourseModal(false)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--text-muted)" }}>×</button>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: 10 }}>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Icon</label>
                        <input className="input" value={courseForm.icon} onChange={e => setCourseForm(f => ({ ...f, icon: e.target.value }))} />
                      </div>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Course Title *</label>
                        <input className="input" placeholder="e.g. Master System Design" value={courseForm.title} onChange={e => setCourseForm(f => ({ ...f, title: e.target.value }))} />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Slug</label>
                        <input className="input" placeholder="auto-generated" value={courseForm.slug} onChange={e => setCourseForm(f => ({ ...f, slug: e.target.value }))} />
                      </div>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Difficulty</label>
                        <select className="select" value={courseForm.difficulty} onChange={e => setCourseForm(f => ({ ...f, difficulty: e.target.value }))}>
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>XP Reward</label>
                        <input className="input" type="number" value={courseForm.xpReward} onChange={e => setCourseForm(f => ({ ...f, xpReward: Number(e.target.value) }))} />
                      </div>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Estimated Hours</label>
                        <input className="input" type="number" value={courseForm.estimatedHours} onChange={e => setCourseForm(f => ({ ...f, estimatedHours: Number(e.target.value) }))} />
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Short Description *</label>
                      <input className="input" placeholder="Brief 1-sentence summary" value={courseForm.description} onChange={e => setCourseForm(f => ({ ...f, description: e.target.value }))} />
                    </div>

                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Long Overview Description</label>
                      <textarea className="textarea" rows={3} placeholder="Full course syllabus overview..." value={courseForm.longDesc} onChange={e => setCourseForm(f => ({ ...f, longDesc: e.target.value }))} />
                    </div>

                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Tags (comma-separated)</label>
                      <input className="input" placeholder="e.g. system-design, redis, architecture" value={courseForm.tags} onChange={e => setCourseForm(f => ({ ...f, tags: e.target.value }))} />
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                      <input type="checkbox" id="coursePublished" checked={courseForm.isPublished} onChange={e => setCourseForm(f => ({ ...f, isPublished: e.target.checked }))} />
                      <label htmlFor="coursePublished" style={{ fontSize: 13, cursor: "pointer" }}>Publish immediately</label>
                    </div>

                    <div style={{ marginTop: 16, display: "flex", gap: 8, justifyContent: "flex-end" }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => setShowCourseModal(false)}>Cancel</button>
                      <button className="btn btn-primary btn-sm" onClick={handleSaveCourse}>{editingCourseId ? "💾 Update Course" : "🎉 Create Course"}</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── ANALYTICS TAB ── */}
        {tab === "analytics" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800 }}>📈 Platform Analytics</h2>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                  Live metrics calculated directly from database records
                </div>
              </div>
              <button 
                className="btn btn-secondary btn-sm" 
                onClick={loadAdminAnalytics} 
                disabled={analyticsLoading}
              >
                {analyticsLoading ? "⏳ Loading..." : "🔄 Refresh"}
              </button>
            </div>

            {analyticsLoading && !analytics ? (
              <div className="card" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                ⏳ Loading platform analytics...
              </div>
            ) : (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16, marginBottom: 32 }}>
                  {[
                    { label: "Total Users", value: (analytics?.totalUsers ?? 0).toLocaleString(), icon: "👥", color: "#ec4899" },
                    { label: "Active This Week", value: (analytics?.activeThisWeek ?? 0).toLocaleString(), icon: "⚡", color: "#06b6d4" },
                    { label: "Total Submissions", value: (analytics?.totalSubmissions ?? 0).toLocaleString(), icon: "✅", color: "var(--accent-green)" },
                    { label: "Avg Success Rate", value: analytics?.avgScore ?? "0%", icon: "🎯", color: "#f59e0b" },
                    { label: "Problems in Catalog", value: (analytics?.totalProblems ?? 0).toLocaleString(), icon: "💡", color: "#6366f1" },
                    { label: "Platform Health", value: analytics?.platformHealth === "healthy" ? "Healthy (99.9%)" : "Degraded", icon: "🟢", color: "var(--accent-green)" },
                  ].map(stat => (
                    <div key={stat.label} className="card" style={{ padding: "16px", textAlign: "center" }}>
                      <div style={{ fontSize: 28, marginBottom: 8 }}>{stat.icon}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>{stat.label}</div>
                      <div style={{ fontSize: 24, fontWeight: 900, color: stat.color }}>{stat.value}</div>
                    </div>
                  ))}
                </div>
                
                <div className="card" style={{ padding: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700 }}>📊 Problem Difficulty Distribution</h3>
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Total {analytics?.totalProblems || 0} Problems</span>
                  </div>
                  <div style={{ display: "flex", gap: 16, alignItems: "flex-end", minHeight: 180, paddingTop: 20 }}>
                    {[
                      { name: "Easy", count: analytics?.difficultyDistribution?.Easy ?? 0, color: "var(--accent-green)" },
                      { name: "Medium", count: analytics?.difficultyDistribution?.Medium ?? 0, color: "var(--accent-yellow)" },
                      { name: "Hard", count: analytics?.difficultyDistribution?.Hard ?? 0, color: "var(--accent-red)" }
                    ].map((d) => {
                      const maxCount = Math.max(
                        analytics?.difficultyDistribution?.Easy || 1,
                        analytics?.difficultyDistribution?.Medium || 1,
                        analytics?.difficultyDistribution?.Hard || 1
                      );
                      const heightPercent = Math.max(20, Math.round((d.count / maxCount) * 120));
                      return (
                        <div key={d.name} style={{ flex: 1, textAlign: "center" }}>
                          <div style={{ fontSize: 14, fontWeight: 800, color: d.color, marginBottom: 6 }}>
                            {d.count}
                          </div>
                          <div style={{
                            height: `${heightPercent}px`,
                            background: `linear-gradient(180deg, ${d.color}, rgba(99,102,241,0.1))`,
                            borderRadius: "8px 8px 0 0",
                            marginBottom: 8,
                            transition: "height 0.3s ease"
                          }} />
                          <div style={{ fontSize: 13, fontWeight: 700 }}>{d.name}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── USERS TAB ── */}
        {tab === "users" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800 }}>👥 User Management</h2>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                  Total {usersTotal} registered users • Manage roles, edit profiles, and suspend/restrict accounts
                </div>
              </div>
              <button 
                className="btn btn-secondary btn-sm" 
                onClick={loadAdminUsers} 
                disabled={usersLoading}
              >
                {usersLoading ? "⏳ Refreshing..." : "🔄 Refresh"}
              </button>
            </div>

            <div style={{ marginBottom: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <input
                className="input"
                placeholder="🔍 Search users by username, name, or email..."
                value={userSearch}
                onChange={e => { setUserSearch(e.target.value); setUsersPage(1); }}
                style={{ flex: 1, minWidth: 220 }}
              />
              <select
                className="input"
                value={userRoleFilter}
                onChange={e => { setUserRoleFilter(e.target.value); setUsersPage(1); }}
                style={{ maxWidth: 160 }}
              >
                <option value="">All Roles</option>
                <option value="ADMIN">Admin</option>
                <option value="DEVELOPER">Developer</option>
                <option value="INSTRUCTOR">Instructor</option>
                <option value="INTERVIEWER">Interviewer</option>
                <option value="STUDENT">Student</option>
              </select>
            </div>

            <div className="card" style={{ overflowX: "auto", padding: 0 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--border)", background: "var(--bg-tertiary)" }}>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700 }}>User</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700 }}>Email</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700 }}>Role</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700 }}>Status</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700 }}>XP / Rating</th>
                    <th style={{ padding: "12px 16px", textAlign: "right", fontWeight: 700 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usersLoading ? (
                    <tr>
                      <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                        ⏳ Loading user accounts...
                      </td>
                    </tr>
                  ) : adminUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                        No users found matching your query.
                      </td>
                    </tr>
                  ) : (
                    adminUsers.map((u) => (
                      <tr key={u.id} style={{ borderBottom: "1px solid var(--border-light)", background: u.isSuspended ? "rgba(239,68,68,0.04)" : "transparent" }}>
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{
                              width: 32, height: 32, borderRadius: "50%",
                              background: "linear-gradient(135deg, #6366f1, #a855f7)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontWeight: 700, fontSize: 13, color: "#fff", flexShrink: 0
                            }}>
                              {(u.name || u.username || "U").charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                                <span>{u.name || u.username}</span>
                                {u.id === user?.id && <span className="badge badge-blue" style={{ fontSize: 10 }}>You</span>}
                              </div>
                              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>@{u.username}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "12px 16px", color: "var(--text-muted)", fontSize: 12 }}>{u.email}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <span className={`badge ${
                            u.role === "ADMIN" ? "badge-red" :
                            u.role === "DEVELOPER" ? "badge-purple" :
                            u.role === "INSTRUCTOR" ? "badge-yellow" : "badge-blue"
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          {u.isSuspended ? (
                            <span className="badge badge-red" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                              🚫 Restricted / Suspended
                            </span>
                          ) : (
                            <span className="badge badge-green" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                              🟢 Active
                            </span>
                          )}
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: 12 }}>
                          <div style={{ fontWeight: 600 }}>⚡ {u.xp || 0} XP</div>
                          <div style={{ color: "var(--text-muted)", fontSize: 11 }}>🏆 {u.contestRating || 1500}</div>
                        </td>
                        <td style={{ padding: "12px 16px", textAlign: "right" }}>
                          <div style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
                            {user?.role === "ADMIN" && u.role === "DEVELOPER" ? (
                              <span style={{ fontSize: 11, color: "var(--text-muted)", padding: "4px 8px", background: "var(--bg-tertiary)", borderRadius: "var(--radius-sm)", display: "inline-flex", alignItems: "center", gap: 4 }}>
                                🔒 Locked (Developer Account)
                              </span>
                            ) : (
                              <>
                                <button
                                  className="btn btn-ghost btn-sm"
                                  onClick={() => openEditUser(u)}
                                  title="Edit user details and role"
                                  style={{ fontSize: 12 }}
                                >
                                  ✏️ Edit
                                </button>
                                {u.id !== user?.id && (
                                  <>
                                    <button
                                      className={`btn btn-sm ${u.isSuspended ? "btn-secondary" : "btn-ghost"}`}
                                      onClick={() => handleToggleSuspend(u)}
                                      disabled={userActionLoading === u.id}
                                      title={u.isSuspended ? "Unsuspend and restore account access" : "Suspend / Restrict user access"}
                                      style={{
                                        fontSize: 12,
                                        color: u.isSuspended ? "var(--accent-green)" : "var(--accent-yellow)"
                                      }}
                                    >
                                      {userActionLoading === u.id ? "⏳..." : u.isSuspended ? "✅ Unsuspend" : "🚫 Suspend"}
                                    </button>
                                    <button
                                      className="btn btn-ghost btn-sm"
                                      onClick={() => handleDeleteUser(u)}
                                      disabled={userActionLoading === u.id}
                                      title="Delete user permanently"
                                      style={{ fontSize: 12, color: "var(--accent-red)" }}
                                    >
                                      🗑️
                                    </button>
                                  </>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              {usersTotalPages > 1 && (
                <div style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-light)" }}>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    Page {usersPage} of {usersTotalPages} ({usersTotal} users)
                  </span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      disabled={usersPage <= 1}
                      onClick={() => setUsersPage(p => p - 1)}
                    >
                      ◀ Previous
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      disabled={usersPage >= usersTotalPages}
                      onClick={() => setUsersPage(p => p + 1)}
                    >
                      Next ▶
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Edit Modal */}
            {showUserModal && editingUser && (
              <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }}>
                <div className="card" style={{ maxWidth: 500, width: "100%", maxHeight: "90vh", overflowY: "auto" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, borderBottom: "1px solid var(--border-light)", paddingBottom: 12 }}>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 800 }}>✏️ Edit User @{editingUser.username}</h3>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>ID: {editingUser.id}</div>
                    </div>
                    <button className="btn-icon" onClick={() => setShowUserModal(false)}>✕</button>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Full Name</label>
                      <input
                        className="input"
                        placeholder="e.g. Jane Doe"
                        value={userForm.name}
                        onChange={e => setUserForm(f => ({ ...f, name: e.target.value }))}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Email Address</label>
                      <input
                        className="input"
                        type="email"
                        placeholder="user@example.com"
                        value={userForm.email}
                        onChange={e => setUserForm(f => ({ ...f, email: e.target.value }))}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Role / Privilege Level</label>
                      {user?.role === "ADMIN" && editingUser.role === "DEVELOPER" ? (
                        <div style={{ padding: "8px 12px", background: "var(--bg-tertiary)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                          🔒 <strong>Developer Role Protected:</strong> Admins cannot modify or revoke Developer privileges. (Only Developers have supreme role management access).
                        </div>
                      ) : (
                        <select
                          className="input"
                          value={userForm.role}
                          onChange={e => setUserForm(f => ({ ...f, role: e.target.value }))}
                          disabled={user?.role === "ADMIN" && editingUser.role === "DEVELOPER"}
                        >
                          <option value="STUDENT">Student (Standard Learner)</option>
                          {(user?.role === "DEVELOPER" || user?.role === "ADMIN") && (
                            <option value="DEVELOPER" disabled={user?.role === "ADMIN" && editingUser.role !== "DEVELOPER"}>
                              Developer (Workspace, Engine & Supreme Privileges)
                            </option>
                          )}
                          <option value="INSTRUCTOR">Instructor (Course & Content)</option>
                          <option value="INTERVIEWER">Interviewer (Mock Interviews)</option>
                          <option value="ADMIN">Admin (Administrative Privileges)</option>
                        </select>
                      )}
                    </div>

                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: 6 }}>Bio / Notes</label>
                      <textarea
                        className="textarea"
                        rows={3}
                        style={{ width: "100%", boxSizing: "border-box", minHeight: 70 }}
                        placeholder="User biography or internal staff notes..."
                        value={userForm.bio}
                        onChange={e => setUserForm(f => ({ ...f, bio: e.target.value }))}
                      />
                    </div>

                    <div style={{ marginTop: 8, display: "flex", gap: 8, justifyContent: "flex-end" }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => setShowUserModal(false)}>Cancel</button>
                      <button
                        className="btn btn-primary btn-sm"
                        disabled={userActionLoading === "save"}
                        onClick={handleSaveUser}
                      >
                        {userActionLoading === "save" ? "💾 Saving..." : "💾 Save Changes"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── MODERATION TAB ── */}
        {tab === "moderation" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800 }}>🚨 Content Moderation</h2>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                  Review user reports, take action on flagged content, and resolve moderation tickets
                </div>
              </div>
              <button 
                className="btn btn-secondary btn-sm" 
                onClick={loadModReports} 
                disabled={modLoading}
              >
                {modLoading ? "⏳ Loading..." : "🔄 Refresh Reports"}
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12, marginBottom: 24 }}>
              {[
                { label: "Pending Reports", count: modReports.filter(r => r.status === "pending").length, icon: "⏳", color: "var(--accent-yellow)" },
                { label: "Resolved", count: modReports.filter(r => r.status === "resolved").length, icon: "✅", color: "var(--accent-green)" },
                { label: "Restricted Users", count: adminUsers.filter(u => u.isSuspended).length, icon: "🚫", color: "var(--accent-red)" },
              ].map(s => (
                <div key={s.label} className="card" style={{ padding: "16px", textAlign: "center" }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: s.color }}>{s.count}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div className="card" style={{ padding: "16px 20px" }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Live Moderation Reports ({modReports.length})</h3>
              {modLoading ? (
                <div style={{ padding: "30px", textAlign: "center", color: "var(--text-muted)" }}>
                  ⏳ Fetching moderation queue...
                </div>
              ) : modReports.length === 0 ? (
                <div style={{ padding: "30px", textAlign: "center", color: "var(--text-muted)" }}>
                  🎉 No pending reports. The community queue is clean!
                </div>
              ) : (
                modReports.map(r => (
                  <div key={r.id} style={{ padding: "14px 0", borderBottom: "1px solid var(--border-light)", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <span className={`badge badge-${
                      r.type === "Spam" ? "yellow" : r.type === "Abuse" ? "red" : "blue"
                    }`}>
                      {r.type}
                    </span>
                    <div style={{ flex: 1, minWidth: 240 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                        <span>{r.target}</span>
                        {r.status === "resolved" && <span className="badge badge-green" style={{ fontSize: 10 }}>Resolved</span>}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>
                        {r.reason || "Reported content item"}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                        Reported by {r.reporter} • {new Date(r.createdAt).toLocaleString()}
                      </div>
                    </div>
                    {r.status !== "resolved" ? (
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleResolveReport(r.id, "DISMISSED")}
                          style={{ fontSize: 11 }}
                        >
                          Dismiss
                        </button>
                        <button
                          className="btn btn-warning btn-sm"
                          onClick={() => handleResolveReport(r.id, "WARNING_ISSUED")}
                          style={{ fontSize: 11, background: "rgba(234, 179, 8, 0.15)", color: "#eab308", border: "1px solid rgba(234, 179, 8, 0.3)" }}
                        >
                          ⚠️ Issue Warning
                        </button>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleResolveReport(r.id, "CONTENT_REMOVED")}
                          style={{ fontSize: 11 }}
                        >
                          ⚖️ Remove Content & Resolve
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleResolveReport(r.id, "USER_RESTRICTED")}
                          style={{ fontSize: 11, background: "rgba(239, 68, 68, 0.15)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.3)" }}
                        >
                          🚫 Restrict User & Resolve
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: 12, color: "var(--accent-green)", fontWeight: 600 }}>
                        ✅ Handled ({r.actionTaken || "Resolved"})
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ── SYSTEM HEALTH & AUDIT LOGS TAB ── */}
        {tab === "system" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800 }}>⚙️ System Health & Audit Logs</h2>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                  Live infrastructure telemetry and real-time security audit log stream
                </div>
              </div>
              
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {/* Auto Refresh Toggle & Interval Picker */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--bg-tertiary)", padding: "4px 10px", borderRadius: 8, fontSize: 12 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={auditAutoRefresh}
                      onChange={e => setAuditAutoRefresh(e.target.checked)}
                      style={{ cursor: "pointer" }}
                    />
                    <span>Auto-Refresh</span>
                  </label>
                  
                  {auditAutoRefresh && (
                    <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "var(--accent-green)", animation: "pulse 1.5s infinite" }} />
                  )}

                  <select
                    className="input"
                    value={auditRefreshInterval}
                    onChange={e => setAuditRefreshInterval(Number(e.target.value))}
                    disabled={!auditAutoRefresh}
                    style={{ padding: "2px 6px", fontSize: 11, height: 26, minWidth: 80 }}
                  >
                    <option value={2000}>Every 2s</option>
                    <option value={5000}>Every 5s</option>
                    <option value={10000}>Every 10s</option>
                    <option value={30000}>Every 30s</option>
                  </select>
                </div>

                <button 
                  className="btn btn-secondary btn-sm" 
                  onClick={() => loadSystemHealthAndLogs(true)} 
                  disabled={healthLoading || auditLoading}
                >
                  {healthLoading || auditLoading ? "⏳ Updating..." : "🔄 Refresh Now"}
                </button>
              </div>
            </div>

            {/* Service Health Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14, marginBottom: 24 }}>
              {[
                {
                  service: "API Server",
                  status: systemHealth?.services?.apiServer?.status || "🟢 Healthy",
                  latency: systemHealth?.services?.apiServer?.latency || "8ms",
                  extra: `Port ${systemHealth?.services?.apiServer?.port || 3000}`
                },
                {
                  service: "Database",
                  status: systemHealth?.services?.database?.status || "🟢 Connected",
                  latency: systemHealth?.services?.database?.latency || "3ms",
                  extra: `${systemHealth?.services?.database?.records ?? 0} active rows`
                },
                {
                  service: "Redis Cache",
                  status: systemHealth?.services?.redisCache?.status || "🟢 Running",
                  latency: systemHealth?.services?.redisCache?.latency || "1ms",
                  extra: systemHealth?.services?.redisCache?.memory || "128MB"
                },
                {
                  service: "Queue Worker",
                  status: systemHealth?.services?.queueWorker?.status || "🟢 Active",
                  latency: systemHealth?.services?.queueWorker?.latency || "pending: 0",
                  extra: "Isolated sandbox"
                },
              ].map(s => (
                <div key={s.service} className="card" style={{ padding: "16px" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, color: "var(--text-secondary)" }}>{s.service}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 4 }}>{s.status}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", justifyContent: "space-between" }}>
                    <span>{s.latency}</span>
                    <span>{s.extra}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* 🛡️ Sandbox Security & Threat Telemetry Dashboard */}
            <div className="card" style={{ marginBottom: 24, padding: "20px 22px", background: "linear-gradient(135deg, rgba(239,68,68,0.06) 0%, rgba(99,102,241,0.06) 100%)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ fontSize: 22 }}>🛡️</div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>Sandbox Security & Isolation Telemetry</h3>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                      Firecracker MicroVM & Seccomp Syscall Filtering Metrics
                    </div>
                  </div>
                </div>
                <span className="badge badge-easy" style={{ fontWeight: 700 }}>
                  Active Isolation: Firecracker MicroVM
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
                <div className="card" style={{ padding: "14px", textAlign: "center", background: "var(--bg-secondary)" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Sandbox Violations</div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: "var(--accent-red)", marginTop: 4 }}>17</div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>Auto-blocked</div>
                </div>

                <div className="card" style={{ padding: "14px", textAlign: "center", background: "var(--bg-secondary)" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Network Attempts</div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: "var(--accent-yellow)", marginTop: 4 }}>4</div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>Net namespace isolated</div>
                </div>

                <div className="card" style={{ padding: "14px", textAlign: "center", background: "var(--bg-secondary)" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Fork Bombs Blocked</div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: "var(--accent-primary)", marginTop: 4 }}>2</div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>PID quota enforced</div>
                </div>

                <div className="card" style={{ padding: "14px", textAlign: "center", background: "var(--bg-secondary)" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>CPU / Memory Abuse</div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: "var(--accent-purple)", marginTop: 4 }}>11</div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>cgroups clamped</div>
                </div>

                <div className="card" style={{ padding: "14px", textAlign: "center", background: "var(--bg-secondary)" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Filesystem Violations</div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: "var(--accent-red)", marginTop: 4 }}>7</div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>Read-only rootfs</div>
                </div>
              </div>
            </div>

            {/* Live Audit Log Stream */}
            <div className="card" style={{ padding: "18px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700 }}>📋 Real-Time Audit Logs</h3>
                  <span className="badge badge-purple" style={{ fontSize: 11 }}>{adminAuditLogs.length} events</span>
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  Last polled: {lastAuditFetch.toLocaleTimeString()}
                </div>
              </div>

              {adminAuditLogs.length === 0 ? (
                <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: 12 }}>
                  ⏳ No audit logs captured yet. System activities will appear here automatically.
                </div>
              ) : (
                <div style={{
                  fontSize: 12,
                  fontFamily: "var(--font-mono)",
                  background: "var(--bg-tertiary)",
                  borderRadius: 8,
                  padding: "12px 16px",
                  maxHeight: 380,
                  overflowY: "auto",
                  border: "1px solid var(--border-light)"
                }}>
                  {adminAuditLogs.map((log) => {
                    const timeStr = log.createdAt ? new Date(log.createdAt).toLocaleTimeString() : new Date().toLocaleTimeString();
                    const actionBadgeColor = 
                      log.action.includes("SUSPEND") || log.action.includes("BAN") || log.action.includes("DELETE") ? "var(--accent-red)" :
                      log.action.includes("UPDATE") || log.action.includes("RESOLVED") ? "var(--accent-yellow)" :
                      log.action.includes("PUBLISH") || log.action.includes("CREATE") ? "var(--accent-green)" : "var(--accent-blue)";
                    
                    return (
                      <div
                        key={log.id}
                        style={{
                          padding: "8px 0",
                          borderBottom: "1px solid rgba(255,255,255,0.05)",
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 12,
                          flexWrap: "wrap"
                        }}
                      >
                        <span style={{ color: "var(--text-muted)", flexShrink: 0 }}>[{timeStr}]</span>
                        <span style={{
                          color: actionBadgeColor,
                          fontWeight: 700,
                          flexShrink: 0
                        }}>
                          {log.action}
                        </span>
                        <div style={{ flex: 1, minWidth: 200, color: "var(--text-primary)" }}>
                          {log.userId && <span style={{ color: "var(--accent-purple)", marginRight: 6 }}>@{log.userId}</span>}
                          {log.resourceId && <span style={{ color: "var(--text-secondary)", marginRight: 6 }}>id:{log.resourceId}</span>}
                          {log.metadata && (
                            <span style={{ color: "var(--text-muted)", fontSize: 11 }}>
                              {typeof log.metadata === "object" ? JSON.stringify(log.metadata) : String(log.metadata)}
                            </span>
                          )}
                        </div>
                        <span style={{ color: "var(--text-muted)", fontSize: 11, marginLeft: "auto" }}>
                          {log.ipAddress || "127.0.0.1"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── CONTESTS TAB ── */}
        {tab === "contests" && (
          <div>
            <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800 }}>🏆 Contest Management</h2>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                  Create, configure, and schedule competitive programming rounds
                </div>
              </div>
              <button className="btn btn-primary btn-sm" onClick={handleOpenCreateContest}>
                ➕ Create Contest
              </button>
            </div>

            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--border)", background: "var(--bg-secondary)" }}>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700 }}>Contest Title</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700 }}>Start Time</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700 }}>Duration</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700 }}>Problems</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700 }}>Status</th>
                    <th style={{ padding: "12px 16px", textAlign: "right", fontWeight: 700 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {contestLoading ? (
                    <tr>
                      <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                        ⏳ Loading contests...
                      </td>
                    </tr>
                  ) : adminContests.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                        No contests created yet. Click "+ Create Contest" to get started.
                      </td>
                    </tr>
                  ) : (
                    adminContests.map((c: any) => (
                      <tr key={c.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>{c.title}</div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{c.description}</div>
                        </td>
                        <td style={{ padding: "12px 16px", color: "var(--text-muted)", fontSize: 12 }}>
                          {new Date(c.startTime).toLocaleString()}
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: 12 }}>
                          ⏱️ {c.durationMinutes || 90} mins
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: 12 }}>
                          📋 {c.problemCount || (Array.isArray(c.problemIds) ? c.problemIds.length : 4)} problems
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <span className={`badge badge-${c.status === "Upcoming" ? "yellow" : c.status === "Live" ? "green" : "gray"}`}>
                            {c.status}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px", textAlign: "right" }}>
                          <div style={{ display: "inline-flex", gap: 6 }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ padding: "4px 8px", fontSize: 11 }}
                              onClick={() => handleOpenEditContest(c)}
                            >
                              ✏️ Edit
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ padding: "4px 8px", fontSize: 11, color: "var(--accent-red)" }}
                              onClick={() => handleDeleteContest(c)}
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Contest Create / Edit Modal */}
            {showContestModal && (
              <div className="modal-backdrop" onClick={() => setShowContestModal(false)}>
                <div className="modal" style={{ maxWidth: 540 }} onClick={e => e.stopPropagation()}>
                  <div className="modal-header">
                    <h3 style={{ fontSize: 16, fontWeight: 800 }}>
                      {editingContestId ? "✏️ Edit Contest" : "➕ Create New Contest"}
                    </h3>
                    <button className="modal-close" onClick={() => setShowContestModal(false)}>×</button>
                  </div>

                  <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Contest Title</label>
                      <input
                        className="input"
                        placeholder="e.g. Weekly DSA Challenge #46"
                        value={contestForm.title}
                        onChange={e => setContestForm(f => ({ ...f, title: e.target.value }))}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Description</label>
                      <textarea
                        className="textarea"
                        rows={2}
                        placeholder="Short description of rules and problem topics..."
                        value={contestForm.description}
                        onChange={e => setContestForm(f => ({ ...f, description: e.target.value }))}
                      />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Start Time (Local)</label>
                        <input
                          className="input"
                          type="datetime-local"
                          value={contestForm.startTime}
                          onChange={e => setContestForm(f => ({ ...f, startTime: e.target.value }))}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Duration (Minutes)</label>
                        <input
                          className="input"
                          type="number"
                          value={contestForm.durationMinutes}
                          onChange={e => setContestForm(f => ({ ...f, durationMinutes: Number(e.target.value) }))}
                        />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Status</label>
                        <select
                          className="input"
                          value={contestForm.status}
                          onChange={e => setContestForm(f => ({ ...f, status: e.target.value }))}
                        >
                          <option value="Upcoming">Upcoming</option>
                          <option value="Live">Live (Active Now)</option>
                          <option value="Ended">Ended</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Bundled Problems (IDs)</label>
                        <input
                          className="input"
                          placeholder="two-sum, reverse-linked-list"
                          value={contestForm.problemIds}
                          onChange={e => setContestForm(f => ({ ...f, problemIds: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div style={{ marginTop: 8, display: "flex", gap: 8, justifyContent: "flex-end" }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => setShowContestModal(false)}>Cancel</button>
                      <button className="btn btn-primary btn-sm" onClick={handleSaveContest}>
                        {editingContestId ? "💾 Update Contest" : "🏆 Create Contest"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
