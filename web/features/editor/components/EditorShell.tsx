"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Shapes, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { getProject } from "@/lib/projects";
import { useEditorStore } from "../store";
import { EditorEngine } from "../engine";
import { TopBar } from "./TopBar";
import { LeftPanel } from "./LeftPanel";
import { RightPanel } from "./RightPanel";
import { ChatDock } from "./ChatDock";

function applyViewport(engine: EditorEngine | null, el: HTMLElement | null) {
  if (!engine || !el) return;
  engine.setViewport(el.clientWidth, el.clientHeight, useEditorStore.getState().zoom);
}

export function EditorShell({ projectId }: { projectId: string }) {
  const router = useRouter();
  // Small screens: side panels become slide-over drawers
  const [mobilePanel, setMobilePanel] = useState<"elements" | "inspect" | null>(null);
  const engineRef = useRef<EditorEngine | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { project, zoom, loadProject, sceneChanged, setSelection, reset } = useEditorStore();
  const engine = useCallback(() => engineRef.current, []);
  const loadedProjectId = useEditorStore((s) => s.project?.id);

  // Boot: load project into the store (renders the canvas element)
  useEffect(() => {
    const p = getProject(projectId);
    if (!p) {
      router.replace("/create");
      return;
    }
    loadProject(p);
    return () => reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  // Init engine once the project is loaded and the canvas exists in the DOM.
  // Keyed on the project id (not the project object) so edits don't re-init.
  useEffect(() => {
    const el = canvasRef.current;
    if (loadedProjectId !== projectId || !el) return;

    const eng = new EditorEngine();
    engineRef.current = eng;
    eng.onChange = () => sceneChanged(eng.getScene());
    eng.onSelection = (sel) => setSelection(sel);

    let disposed = false;
    (async () => {
      const scene = useEditorStore.getState().project?.scene;
      if (!scene) return;
      await eng.init(el, scene, 0);
      if (!disposed) applyViewport(eng, containerRef.current);
    })();

    return () => {
      disposed = true;
      eng.dispose();
      engineRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadedProjectId, projectId]);

  // Viewport sizing
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => applyViewport(engineRef.current, el));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    applyViewport(engineRef.current, containerRef.current);
  }, [zoom]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const eng = engineRef.current;
      if (!eng) return;
      const target = e.target as HTMLElement;
      if (
        eng.isEditingText() ||
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      )
        return;

      const mod = e.metaKey || e.ctrlKey;
      const store = useEditorStore.getState();

      if (mod && e.key.toLowerCase() === "z") {
        e.preventDefault();
        const scene = e.shiftKey ? store.redo() : store.undo();
        if (scene) eng.loadPage(scene, store.pageIndex);
      } else if (mod && e.key.toLowerCase() === "d") {
        e.preventDefault();
        eng.duplicateSelected();
      } else if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        eng.deleteSelected();
      } else if (e.key === "Escape") {
        eng.deselect();
      } else if (e.key.startsWith("Arrow")) {
        e.preventDefault();
        const step = e.shiftKey ? 20 : 4;
        const [dx, dy] =
          e.key === "ArrowLeft" ? [-step, 0]
          : e.key === "ArrowRight" ? [step, 0]
          : e.key === "ArrowUp" ? [0, -step]
          : [0, step];
        eng.nudgeSelected(dx, dy);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!project) {
    return (
      <div className="flex h-svh items-center justify-center bg-mist">
        <div className="animate-float text-4xl">🌸</div>
      </div>
    );
  }

  return (
    <div className="flex h-svh flex-col overflow-hidden bg-mist">
      <TopBar engine={engine} />
      <div className="flex min-h-0 flex-1">
        <div className="hidden h-full lg:block">
          <LeftPanel engine={engine} />
        </div>
        <div
          ref={containerRef}
          className="relative min-w-0 flex-1 overflow-hidden"
          style={
            project.scene.giftType === "card"
              ? {
                  // Cards edit on a warm paper-desk backdrop
                  backgroundImage:
                    "linear-gradient(180deg, #F7F1EA, #F2E8EE), radial-gradient(rgba(108,74,182,0.05) 1px, transparent 1px)",
                  backgroundBlendMode: "multiply",
                  backgroundSize: "auto, 26px 26px",
                }
              : {
                  // Bouquets keep the airy dotted grid
                  backgroundImage: "radial-gradient(rgba(108,74,182,0.10) 1px, transparent 1px)",
                  backgroundSize: "22px 22px",
                }
          }
        >
          <canvas ref={canvasRef} />
        </div>
        <div className="hidden h-full lg:block">
          <RightPanel engine={engine} />
        </div>
      </div>

      {/* Mobile slide-over drawers for the side panels */}
      {mobilePanel && (
        <div className="fixed inset-0 z-30 lg:hidden" onClick={() => setMobilePanel(null)}>
          <div className="absolute inset-0 bg-ink/30" />
          <div
            className={cn(
              "absolute bottom-0 top-14 flex max-w-[85vw] bg-white shadow-lift",
              mobilePanel === "elements" ? "left-0" : "right-0"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {mobilePanel === "elements" ? <LeftPanel engine={engine} /> : <RightPanel engine={engine} />}
          </div>
        </div>
      )}

      {/* Mobile panel toggles */}
      <div className="fixed bottom-5 left-5 z-20 flex gap-2 lg:hidden">
        <button
          onClick={() => setMobilePanel((p) => (p === "elements" ? null : "elements"))}
          className="font-button flex items-center gap-1.5 rounded-full bg-white px-4 py-3 text-[0.8125rem] font-bold text-plum shadow-lift"
        >
          <Shapes className="h-4 w-4" /> Elements
        </button>
        <button
          onClick={() => setMobilePanel((p) => (p === "inspect" ? null : "inspect"))}
          className="font-button flex items-center gap-1.5 rounded-full bg-white px-4 py-3 text-[0.8125rem] font-bold text-plum shadow-lift"
        >
          <SlidersHorizontal className="h-4 w-4" /> Edit
        </button>
      </div>

      <ChatDock engine={engine} />
    </div>
  );
}
