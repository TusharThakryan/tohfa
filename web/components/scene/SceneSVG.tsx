import { sceneToSVG } from "@/lib/scene/render";
import type { Scene } from "@/lib/scene/types";
import { cn } from "@/lib/utils";

/** Static render of a scene page - thumbnails, share pages, gallery. */
export function SceneSVG({
  scene,
  pageIndex = 0,
  className,
}: {
  scene: Scene;
  pageIndex?: number;
  className?: string;
}) {
  return (
    <div
      className={cn("[&>svg]:h-full [&>svg]:w-full", className)}
      // The browser normalizes the SSR'd SVG markup (self-closing tags,
      // attribute order), so innerHTML never string-matches the source.
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: sceneToSVG(scene, pageIndex) }}
    />
  );
}
