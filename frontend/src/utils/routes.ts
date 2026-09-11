export function parseLocationToRoute(pathname: string): { page: string; subPage: string } {
  const clean = pathname.replace(/^\/+|\/+$/g, "");
  if (!clean) return { page: "home", subPage: "" };

  const segments = clean.split("/");
  const [first, second] = segments;

  if (first === "problems") {
    return { page: second ? "problem" : "problems", subPage: second || "" };
  }
  if (first === "problem") {
    return { page: "problem", subPage: second || "" };
  }
  if (first === "contests" || first === "contest") {
    return { page: "contests", subPage: second || "" };
  }
  if (first === "learn" || first === "courses") {
    return { page: second ? "course" : "learn", subPage: second || "" };
  }
  if (first === "lesson") {
    return { page: "lesson", subPage: second || "" };
  }
  if (first === "u" || first === "user") {
    return { page: "user-profile", subPage: second || "" };
  }
  if (first === "submissions" || first === "submission") {
    return { page: "submission-share", subPage: second || "" };
  }
  if (first === "system-design") {
    return { page: "system-design", subPage: second || "" };
  }
  if (first === "verify-email") {
    return { page: "verify-email", subPage: second || (typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("token") || "" : "") };
  }
  if (first === "arena") return { page: "arena", subPage: second || "" };
  if (first === "collab") return { page: "collab", subPage: second || "" };
  if (first === "notes") return { page: "notes", subPage: "" };
  if (first === "roadmap") return { page: "roadmap", subPage: "" };
  if (first === "dashboard") return { page: "dashboard", subPage: "" };
  if (first === "leaderboard") return { page: "leaderboard", subPage: "" };
  if (first === "community") return { page: "community", subPage: "" };
  if (first === "interview") return { page: "interview", subPage: "" };
  if (first === "playground") return { page: "playground", subPage: "" };
  if (first === "profile") return { page: "profile", subPage: "" };
  if (first === "settings") return { page: "settings", subPage: "" };
  if (first === "admin") return { page: "admin", subPage: "" };

  return { page: "404", subPage: clean };
}

export function routeToUrl(page: string, subPage?: string): string {
  if (page === "home") return "/";
  if (page === "problems") return "/problems";
  if (page === "problem") return subPage ? `/problems/${subPage}` : "/problems";
  if (page === "contests") return subPage ? `/contests/${subPage}` : "/contests";
  if (page === "learn") return "/learn";
  if (page === "course") return subPage ? `/learn/${subPage}` : "/learn";
  if (page === "lesson") return subPage ? `/lesson/${subPage}` : "/learn";
  if (page === "user-profile") return subPage ? `/u/${subPage}` : "/leaderboard";
  if (page === "submission-share") return subPage ? `/submissions/${subPage}` : "/problems";
  if (page === "system-design") return subPage ? `/system-design/${subPage}` : "/system-design";
  if (page === "verify-email") return subPage ? `/verify-email?token=${subPage}` : "/verify-email";
  if (page === "arena") return "/arena";
  if (page === "collab") return subPage ? `/collab/${subPage}` : "/collab";
  if (page === "notes") return "/notes";
  if (page === "roadmap") return "/roadmap";
  if (page === "dashboard") return "/dashboard";
  if (page === "leaderboard") return "/leaderboard";
  if (page === "community") return "/community";
  if (page === "interview") return "/interview";
  if (page === "playground") return "/playground";
  if (page === "profile") return "/profile";
  if (page === "settings") return "/settings";
  if (page === "admin") return "/admin";
  return `/${page}`;
}
