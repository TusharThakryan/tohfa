/**
 * Client-side project persistence (localStorage).
 * Phase 3 swaps this for the API + PostgreSQL with the same interface.
 */
import type { Project } from "@/lib/scene/types";

const KEY = "tohfa:projects";

function isBrowser() {
  return typeof window !== "undefined";
}

export function listProjects(): Project[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const projects: Project[] = raw ? JSON.parse(raw) : [];
    return projects.sort((a, b) => b.updatedAt - a.updatedAt);
  } catch {
    return [];
  }
}

export function getProject(id: string): Project | null {
  return listProjects().find((p) => p.id === id) ?? null;
}

export function saveProject(project: Project): void {
  if (!isBrowser()) return;
  const projects = listProjects().filter((p) => p.id !== project.id);
  projects.unshift({ ...project, updatedAt: Date.now() });
  window.localStorage.setItem(KEY, JSON.stringify(projects.slice(0, 100)));
}

export function deleteProject(id: string): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(KEY, JSON.stringify(listProjects().filter((p) => p.id !== id)));
}

export function duplicateProject(id: string): Project | null {
  const source = getProject(id);
  if (!source) return null;
  const copy: Project = {
    ...structuredClone(source),
    id: `prj_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    title: `${source.title} (copy)`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  saveProject(copy);
  return copy;
}
