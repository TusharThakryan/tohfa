"use client";

import { use } from "react";
import dynamic from "next/dynamic";

const EditorShell = dynamic(
  () => import("@/features/editor/components/EditorShell").then((m) => m.EditorShell),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-svh items-center justify-center bg-mist">
        <div className="animate-float text-4xl">🌸</div>
      </div>
    ),
  }
);

export default function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <EditorShell projectId={id} />;
}
