import { create } from "zustand";
import { saveProject } from "@/lib/projects";
import type { Project, Scene } from "@/lib/scene/types";
import type { SelectionInfo } from "./engine";

export interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

interface EditorState {
  project: Project | null;
  pageIndex: number;
  selection: SelectionInfo;
  zoom: number;
  saved: boolean;
  past: Scene[];
  future: Scene[];
  chat: ChatMessage[];
  chatBusy: boolean;

  loadProject: (p: Project) => void;
  /** Engine reports a new scene after an edit. Records history + autosaves. */
  sceneChanged: (scene: Scene) => void;
  /** Replace the scene wholesale (AI patch / template) - records history. */
  replaceScene: (scene: Scene) => void;
  undo: () => Scene | null;
  redo: () => Scene | null;
  setPageIndex: (i: number) => void;
  setSelection: (sel: SelectionInfo) => void;
  setZoom: (z: number) => void;
  setTitle: (t: string) => void;
  addChat: (msg: ChatMessage) => void;
  setChatBusy: (b: boolean) => void;
  reset: () => void;
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;
function persistDebounced(project: Project, done: () => void) {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveProject(project);
    done();
  }, 700);
}

const MAX_HISTORY = 60;

export const useEditorStore = create<EditorState>((set, get) => ({
  project: null,
  pageIndex: 0,
  selection: { count: 0, layer: null },
  zoom: 1,
  saved: true,
  past: [],
  future: [],
  chat: [
    {
      role: "assistant",
      text: "I can edit this design with you - try “add lavender”, “remove the roses”, “black wrapping”, or “more luxury”.",
    },
  ],
  chatBusy: false,

  loadProject: (p) =>
    set({ project: p, pageIndex: 0, past: [], future: [], saved: true, zoom: 1 }),

  sceneChanged: (scene) => {
    const { project, past } = get();
    if (!project) return;
    const updated = { ...project, scene, updatedAt: Date.now() };
    set({
      project: updated,
      past: [...past.slice(-MAX_HISTORY), project.scene],
      future: [],
      saved: false,
    });
    persistDebounced(updated, () => set({ saved: true }));
  },

  replaceScene: (scene) => {
    get().sceneChanged(scene);
  },

  undo: () => {
    const { project, past, future } = get();
    if (!project || past.length === 0) return null;
    const prev = past[past.length - 1];
    const updated = { ...project, scene: prev, updatedAt: Date.now() };
    set({
      project: updated,
      past: past.slice(0, -1),
      future: [project.scene, ...future].slice(0, MAX_HISTORY),
      saved: false,
    });
    persistDebounced(updated, () => set({ saved: true }));
    return prev;
  },

  redo: () => {
    const { project, past, future } = get();
    if (!project || future.length === 0) return null;
    const next = future[0];
    const updated = { ...project, scene: next, updatedAt: Date.now() };
    set({
      project: updated,
      past: [...past, project.scene].slice(-MAX_HISTORY),
      future: future.slice(1),
      saved: false,
    });
    persistDebounced(updated, () => set({ saved: true }));
    return next;
  },

  setPageIndex: (i) => set({ pageIndex: i }),
  setSelection: (sel) => set({ selection: sel }),
  setZoom: (z) => set({ zoom: Math.min(3, Math.max(0.3, z)) }),

  setTitle: (t) => {
    const { project } = get();
    if (!project) return;
    const updated = { ...project, title: t, updatedAt: Date.now() };
    set({ project: updated, saved: false });
    persistDebounced(updated, () => set({ saved: true }));
  },

  addChat: (msg) => set({ chat: [...get().chat, msg] }),
  setChatBusy: (b) => set({ chatBusy: b }),

  reset: () =>
    set({
      project: null,
      pageIndex: 0,
      selection: { count: 0, layer: null },
      past: [],
      future: [],
      zoom: 1,
      chatBusy: false,
    }),
}));
