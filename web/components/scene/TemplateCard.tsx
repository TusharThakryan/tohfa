"use client";

import { useRouter } from "next/navigation";
import { SceneSVG } from "@/components/scene/SceneSVG";
import { saveProject } from "@/lib/projects";
import { templateScene, type TemplateDef } from "@/lib/templates";
import { uid, type Project } from "@/lib/scene/types";

export function TemplateCard({ template }: { template: TemplateDef }) {
  const router = useRouter();
  const scene = templateScene(template);

  const use = () => {
    const project: Project = {
      id: uid("prj"),
      title: template.title,
      scene,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    saveProject(project);
    router.push(`/create/${project.id}`);
  };

  return (
    <button
      onClick={use}
      className="group block w-full overflow-hidden rounded-3xl border border-plum/8 bg-white text-left shadow-soft transition-all duration-500 ease-spring hover:-translate-y-2 hover:shadow-lift"
    >
      <div className="relative">
        <SceneSVG scene={scene} className="aspect-[4/5] w-full" />
        <span className="font-button absolute left-4 top-4 rounded-full bg-white/85 px-3 py-1 text-[0.6875rem] font-bold text-plum backdrop-blur">
          {template.occasion}
        </span>
        <span className="font-button absolute inset-x-4 bottom-4 rounded-full bg-ink/85 py-2 text-center text-[0.75rem] font-bold text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
          Use this template →
        </span>
      </div>
      <div className="px-4 py-3.5">
        <h3 className="font-display text-lg font-semibold text-ink">{template.title}</h3>
        <p className="mt-0.5 text-[0.75rem] leading-relaxed text-ink-soft">{template.description}</p>
      </div>
    </button>
  );
}
