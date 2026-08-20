"use client";

/**
 * Living Bouquet - scene renderer.
 *
 * Renders a Scene as inline SVG where every layer is its own group,
 * wrapped in three nested transforms:
 *   static placement  →  entrance (one-shot)  →  hover  →  idle loop
 * Idle timing is hashed from the layer id, so no two layers ever move in
 * sync, and re-renders never reshuffle the choreography.
 */
import { useMemo } from "react";
import { ASSET_MAP } from "@/lib/assets";
import { backgroundMarkup, FONT_STACKS } from "@/lib/scene/render";
import { ASSET_BASE_SIZE as BASE, type Scene, type SceneLayer } from "@/lib/scene/types";
import { entranceFor, hash01, profileFor } from "./motion-profiles";

export interface LayerInteraction {
  /** position as percentages of the canvas */
  xPct: number;
  yPct: number;
  kind: "hover" | "click";
  color?: string;
  layerId: string;
}

function LivingText({ layer }: { layer: SceneLayer }) {
  const size = layer.fontSize ?? 40;
  const lines = (layer.text ?? "").split("\n");
  const anchor = layer.align === "left" ? "start" : layer.align === "right" ? "end" : "middle";
  return (
    <text
      fontFamily={FONT_STACKS[layer.fontFamily ?? "body"]}
      fontSize={size}
      fill={layer.color ?? "#18181B"}
      textAnchor={anchor}
      wordSpacing={(layer.fontFamily ?? "body") === "display" ? size * 0.14 : undefined}
    >
      {lines.map((line, i) => (
        <tspan
          key={i}
          x={0}
          dy={i === 0 ? ((lines.length - 1) * -0.5 + 0.35) * size * 1.25 : size * 1.25}
        >
          {line}
        </tspan>
      ))}
    </text>
  );
}

function LivingLayer({
  layer,
  entrance,
  intro,
  onInteract,
  width,
  height,
}: {
  layer: SceneLayer;
  entrance: { anim: string; delay: number };
  intro: boolean;
  onInteract?: (i: LayerInteraction) => void;
  width: number;
  height: number;
}) {
  const profile = profileFor(layer);
  const r = hash01(layer.id);
  const idleDur = profile.dur[0] + (profile.dur[1] - profile.dur[0]) * r;
  // Idle motion waits for the entrance to finish, then starts offset so
  // neighbouring layers never breathe in phase.
  const idleDelay = intro ? entrance.delay + 0.9 + r * idleDur : r * idleDur;

  const sx = layer.scaleX * (layer.flipX ? -1 : 1);
  const placement = `translate(${layer.x} ${layer.y}) rotate(${layer.rotation}) scale(${sx} ${layer.scaleY})`;

  const emit = (kind: "hover" | "click") =>
    onInteract?.({
      xPct: (layer.x / width) * 100,
      yPct: (layer.y / height) * 100,
      kind,
      color: layer.tint ?? undefined,
      layerId: layer.id,
    });

  const asset = layer.type === "asset" ? ASSET_MAP[layer.assetId ?? ""] : null;
  const body =
    asset != null ? asset.svg.replaceAll("__TINT__", layer.tint || asset.defaultTint) : null;
  if (layer.type === "asset" && !body) return null;

  return (
    <g transform={placement} opacity={layer.opacity}>
      <g
        className={intro ? "lv-enter" : undefined}
        style={intro ? { animationName: entrance.anim, animationDuration: "0.9s", animationDelay: `${entrance.delay}s` } : undefined}
      >
        <g
          className={profile.hover}
          onPointerEnter={profile.emitsPetals ? () => emit("hover") : undefined}
          onClick={profile.emitsPetals || profile.hover ? () => emit("click") : undefined}
        >
          <g
            className={profile.anim ? "lv-anim" : undefined}
            style={
              profile.anim
                ? {
                    animationName: profile.anim,
                    animationDuration: `${idleDur.toFixed(2)}s`,
                    animationDelay: `${idleDelay.toFixed(2)}s`,
                  }
                : undefined
            }
          >
            {body ? (
              <g
                transform={`translate(${-BASE / 2} ${-BASE / 2})`}
                dangerouslySetInnerHTML={{ __html: body }}
              />
            ) : (
              <LivingText layer={layer} />
            )}
          </g>
        </g>
      </g>
    </g>
  );
}

export function LivingScene({
  scene,
  intro = true,
  onInteract,
}: {
  scene: Scene;
  /** play the cinematic opening sequence on mount */
  intro?: boolean;
  onInteract?: (i: LayerInteraction) => void;
}) {
  const page = scene.pages[0];
  const { width, height } = scene.canvas;

  const entrances = useMemo(() => {
    const counters: Record<string, number> = {};
    return page.layers.map((l) => entranceFor(l, counters));
  }, [page.layers]);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="block h-auto w-full">
      <g dangerouslySetInnerHTML={{ __html: backgroundMarkup(page.background, width, height) }} />
      {page.layers.map((layer, i) => (
        <LivingLayer
          key={layer.id}
          layer={layer}
          entrance={entrances[i]}
          intro={intro}
          onInteract={onInteract}
          width={width}
          height={height}
        />
      ))}
    </svg>
  );
}
