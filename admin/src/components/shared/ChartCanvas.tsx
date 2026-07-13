import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, BarChart3, Activity } from "lucide-react";
import type { DashboardSeriesPoint } from "../../api/endpoints/dashboard";

type ChartType = "line" | "bar" | "area";
type SeriesKey = keyof typeof COLORS;

interface ChartCanvasProps {
  series: DashboardSeriesPoint[];
  height?: number;
}

const COLORS = {
  users: "#ffffff",
  applications: "#666666",
  conversations: "#999999",
  messages: "#444444",
  products: "#aaaaaa",
};

const COLORS_RGBA = {
  users: "255, 255, 255",
  applications: "102, 102, 102",
  conversations: "153, 153, 153",
  messages: "68, 68, 68",
  products: "170, 170, 170",
};

const LABELS: Record<string, string> = {
  users: "Users",
  applications: "Apps",
  conversations: "Convos",
  messages: "Msgs",
  products: "Products",
};

const KEYS = Object.keys(COLORS) as SeriesKey[];

interface Dimensions {
  w: number;
  h: number;
  cw: number;
  ch: number;
  maxVal: number;
  getX: (i: number) => number;
  getY: (val: number) => number;
  pointsMap: Record<string, { x: number; y: number }[]>;
}

const drawSmoothPath = (
  ctx: CanvasRenderingContext2D,
  points: { x: number; y: number }[],
) => {
  if (points.length < 2) return;
  ctx.moveTo(points[0].x, points[0].y);
  if (points.length === 2) {
    ctx.lineTo(points[1].x, points[1].y);
    return;
  }
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? i : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 >= points.length ? points.length - 1 : i + 2];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
  }
};

const chartTypes: {
  type: ChartType;
  icon: typeof TrendingUp;
  label: string;
}[] = [
  { type: "line", icon: Activity, label: "Line" },
  { type: "bar", icon: BarChart3, label: "Bar" },
  { type: "area", icon: TrendingUp, label: "Area" },
];

export const ChartCanvas = ({ series, height = 260 }: ChartCanvasProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const baseCanvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const dimRef = useRef<Dimensions | null>(null);

  const [chartType, setChartType] = useState<ChartType>("line");
  const [containerWidth, setContainerWidth] = useState(0);
  const [tooltip, setTooltip] = useState<{
    x: number;
    date: string;
    values: Record<string, number>;
    index: number;
    alignRight: boolean;
  } | null>(null);

  const padding = useMemo(
    () => ({ top: 16, right: 24, bottom: 32, left: 40 }),
    [],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = baseCanvasRef.current;
    if (!canvas || series.length === 0 || containerWidth === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = containerWidth * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const w = containerWidth;
    const h = height;
    const cw = w - padding.left - padding.right;
    const ch = h - padding.top - padding.bottom;

    ctx.clearRect(0, 0, w, h);

    let maxVal = 1;
    for (const point of series) {
      for (const key of KEYS) {
        const v = point[key];
        if (v > maxVal) maxVal = v;
      }
    }
    maxVal = Math.ceil(maxVal / 5) * 5 || 5;

    const getX = (i: number) =>
      padding.left +
      (series.length > 1 ? (i / (series.length - 1)) * cw : cw / 2);
    const getY = (val: number) => padding.top + ch - (val / maxVal) * ch;

    const pointsMap: Record<string, { x: number; y: number }[]> = {};
    KEYS.forEach((key) => {
      pointsMap[key] = series.map((p, i) => ({
        x: getX(i),
        y: getY(p[key]),
      }));
    });

    dimRef.current = { w, h, cw, ch, maxVal, getX, getY, pointsMap };

    ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
    ctx.lineWidth = 1;
    const gridLines = 4;
    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (i / gridLines) * ch;
      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.moveTo(padding.left, y);
      ctx.lineTo(w - padding.right, y);
      ctx.stroke();
      ctx.setLineDash([]);

      const val = Math.round(maxVal - (i / gridLines) * maxVal);
      ctx.fillStyle = "#555555";
      ctx.font = "11px Inter, system-ui, sans-serif";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillText(String(val), padding.left - 10, y);
    }

    if (chartType === "bar") {
      const groupWidth = cw / series.length;
      const barWidth = Math.max(2, (groupWidth * 0.6) / KEYS.length);
      const totalBarsWidth = KEYS.length * barWidth + (KEYS.length - 1) * 2;
      const startOffset = (groupWidth - totalBarsWidth) / 2;

      series.forEach((point, i) => {
        const groupX = padding.left + i * groupWidth;
        KEYS.forEach((key, ki) => {
          const val = point[key];
          if (val === 0) return;

          const barH = (val / maxVal) * ch;
          const x = groupX + startOffset + ki * (barWidth + 2);
          const y = padding.top + ch - barH;

          const gradient = ctx.createLinearGradient(x, y, x, y + barH);
          gradient.addColorStop(0, `rgba(${COLORS_RGBA[key]}, 0.9)`);
          gradient.addColorStop(1, `rgba(${COLORS_RGBA[key]}, 0.4)`);

          ctx.fillStyle = gradient;
          ctx.beginPath();
          const radius = Math.min(barWidth / 2, 4);
          ctx.moveTo(x + radius, y);
          ctx.lineTo(x + barWidth - radius, y);
          ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
          ctx.lineTo(x + barWidth, y + barH);
          ctx.lineTo(x, y + barH);
          ctx.lineTo(x, y + radius);
          ctx.quadraticCurveTo(x, y, x + radius, y);
          ctx.fill();
        });
      });
    } else {
      KEYS.forEach((key) => {
        const points = pointsMap[key];
        const color = COLORS[key];
        const rgba = COLORS_RGBA[key];

        if (chartType === "area") {
          const gradient = ctx.createLinearGradient(
            0,
            padding.top,
            0,
            h - padding.bottom,
          );
          gradient.addColorStop(0, `rgba(${rgba}, 0.25)`);
          gradient.addColorStop(1, `rgba(${rgba}, 0.0)`);

          ctx.fillStyle = gradient;
          ctx.beginPath();
          drawSmoothPath(ctx, points);
          ctx.lineTo(points[points.length - 1].x, padding.top + ch);
          ctx.lineTo(points[0].x, padding.top + ch);
          ctx.closePath();
          ctx.fill();
        }

        ctx.shadowColor = color;
        ctx.shadowBlur = 8;
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.beginPath();
        drawSmoothPath(ctx, points);
        ctx.stroke();
        ctx.shadowBlur = 0;
      });
    }

    const labelCount = Math.min(series.length, 5);
    ctx.fillStyle = "#555555";
    ctx.font = "11px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    for (let i = 0; i < labelCount; i++) {
      const idx =
        labelCount === 1
          ? 0
          : Math.round((i / (labelCount - 1)) * (series.length - 1));
      const point = series[idx];
      const dateStr = point.date.slice(5);
      ctx.fillText(dateStr, getX(idx), h - padding.bottom + 10);
    }
  }, [series, height, containerWidth, chartType, padding]);

  useEffect(() => {
    const canvas = overlayCanvasRef.current;
    const dim = dimRef.current;
    if (!canvas || !dim) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = containerWidth * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, containerWidth, height);

    if (!tooltip) return;

    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(tooltip.x, padding.top);
    ctx.lineTo(tooltip.x, height - padding.bottom);
    ctx.stroke();
    ctx.setLineDash([]);

    KEYS.forEach((key) => {
      const point = dim.pointsMap[key][tooltip.index];
      const color = COLORS[key];

      ctx.fillStyle = "#0a0a0a";
      ctx.beginPath();
      ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
      ctx.stroke();
    });
  }, [tooltip, height, containerWidth, padding]);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const canvas = overlayCanvasRef.current;
      const dim = dimRef.current;
      if (!canvas || !dim || series.length === 0) return;

      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;

      let closestIdx = 0;
      let closestDist = Infinity;

      for (let i = 0; i < series.length; i++) {
        const x = dim.getX(i);
        const dist = Math.abs(mouseX - x);
        if (dist < closestDist) {
          closestDist = dist;
          closestIdx = i;
        }
      }

      if (closestDist < 50) {
        const point = series[closestIdx];
        const values: Record<string, number> = {};
        for (const key of KEYS) values[key] = (point as any)[key];

        const tooltipX = dim.getX(closestIdx);
        const tooltipWidth = tooltipRef.current?.offsetWidth || 160;
        const spaceRight = dim.w - tooltipX;
        const spaceLeft = tooltipX;
        const gap = 16;

        const alignRight =
          spaceRight < tooltipWidth + gap && spaceLeft > spaceRight;

        setTooltip({
          x: tooltipX,
          date: point.date,
          values,
          index: closestIdx,
          alignRight,
        });
      } else {
        setTooltip(null);
      }
    },
    [series],
  );

  const handleMouseLeave = useCallback(() => {
    setTooltip(null);
  }, []);

  useEffect(() => {
    const canvas = overlayCanvasRef.current;
    if (!canvas) return;
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseLeave]);

  return (
    <div>
      <div className="flex items-center justify-end gap-1 mb-3">
        {chartTypes.map(({ type, icon: Icon, label }) => (
          <button
            key={type}
            onClick={() => setChartType(type)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg cursor-pointer transition-all duration-200 ${
              chartType === type
                ? "bg-white/10 text-white shadow-sm"
                : "text-surface-muted hover:text-white hover:bg-surface-overlay"
            }`}
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      <div ref={containerRef} className="relative w-full" style={{ height }}>
        <canvas
          ref={baseCanvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ height }}
        />
        <canvas
          ref={overlayCanvasRef}
          className="absolute inset-0 w-full h-full cursor-crosshair"
          style={{ height }}
        />

        {tooltip && (
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, y: 5, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute pointer-events-none z-20 w-max min-w-40"
            style={{
              left: tooltip.x,
              top: 8,
              transform: tooltip.alignRight
                ? `translateX(calc(-100% - 16px))`
                : `translateX(16px)`,
            }}
          >
            <div className="bg-surface-overlay border border-surface-border rounded-xl px-3 py-2.5 shadow-2xl backdrop-blur-sm">
              <p className="text-[10px] font-medium text-surface-muted mb-2 tracking-wide uppercase">
                {tooltip.date}
              </p>
              <div className="space-y-1.5">
                {KEYS.map((key) => (
                  <div
                    key={key}
                    className="flex items-center justify-between gap-6"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: COLORS[key] }}
                      />
                      <span className="text-[11px] text-surface-muted">
                        {LABELS[key]}
                      </span>
                    </div>
                    <span className="text-[11px] text-white font-mono font-medium tabular-nums">
                      {tooltip.values[key]?.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
        {KEYS.map((key) => (
          <div key={key} className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: COLORS[key] }}
            />
            <span className="text-[11px] text-surface-muted">
              {LABELS[key]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
