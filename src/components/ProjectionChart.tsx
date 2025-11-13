import { useEffect, useRef, useState } from "react";
import { ProjectionData } from "@/types/investment";
import { Skeleton } from "@/components/ui/skeleton";

interface ProjectionChartProps {
  projectionData: ProjectionData | null;
  goalAmount?: number;
}

export const ProjectionChart = ({ projectionData, goalAmount }: ProjectionChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    if (!projectionData || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const DPR = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * DPR;
    canvas.height = rect.height * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    const m = { l: 50, r: 20, t: 18, b: 40 };
    const w = rect.width - m.l - m.r;
    const h = rect.height - m.t - m.b;

    const allValues = [
      ...projectionData.values,
      ...(projectionData.conservative || []),
      ...(projectionData.aggressive || []),
      ...(goalAmount ? [goalAmount] : [])
    ];
    const max = Math.max(...allValues);
    const min = Math.min(...allValues);

    const points = projectionData.values.map((v, i) => ({
      x: m.l + (i / (projectionData.values.length - 1 || 1)) * w,
      y: m.t + h - ((v - min) / (max - min || 1)) * h,
      v,
    }));

    const conservativePoints = projectionData.conservative?.map((v, i) => ({
      x: m.l + (i / (projectionData.values.length - 1 || 1)) * w,
      y: m.t + h - ((v - min) / (max - min || 1)) * h,
    }));

    const aggressivePoints = projectionData.aggressive?.map((v, i) => ({
      x: m.l + (i / (projectionData.values.length - 1 || 1)) * w,
      y: m.t + h - ((v - min) / (max - min || 1)) * h,
    }));

    const duration = 900;
    const start = performance.now();

    function render(now: number) {
      if (!ctx || !projectionData) return;
      const t = Math.min(1, (now - start) / duration);
      ctx.clearRect(0, 0, rect.width, rect.height);

      // Grid
      ctx.strokeStyle = "rgba(255,255,255,0.04)";
      ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const y = m.t + (i / 4) * h;
        ctx.beginPath();
        ctx.moveTo(m.l, y);
        ctx.lineTo(m.l + w, y);
        ctx.stroke();
      }

      // Goal line
      if (goalAmount) {
        const goalY = m.t + h - ((goalAmount - min) / (max - min || 1)) * h;
        ctx.strokeStyle = "rgba(16, 185, 129, 0.5)";
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(m.l, goalY);
        ctx.lineTo(m.l + w, goalY);
        ctx.stroke();
        ctx.setLineDash([]);
        
        ctx.fillStyle = "rgba(16, 185, 129, 0.9)";
        ctx.font = "11px sans-serif";
        ctx.textAlign = "right";
        ctx.fillText(`Goal: ₹${goalAmount.toFixed(0)}`, m.l + w, goalY - 5);
      }

      // Confidence band (if risk data available)
      if (conservativePoints && aggressivePoints) {
        ctx.fillStyle = "rgba(155, 135, 245, 0.1)";
        ctx.beginPath();
        ctx.moveTo(m.l, conservativePoints[0].y);
        for (let i = 0; i < conservativePoints.length; i++) {
          const px = m.l + (conservativePoints[i].x - m.l) * t;
          ctx.lineTo(px, conservativePoints[i].y);
        }
        for (let i = aggressivePoints.length - 1; i >= 0; i--) {
          const px = m.l + (aggressivePoints[i].x - m.l) * t;
          ctx.lineTo(px, aggressivePoints[i].y);
        }
        ctx.closePath();
        ctx.fill();
      }

      // Main line
      ctx.beginPath();
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        const px = m.l + (points[i].x - m.l) * t;
        const py = p.y;
        if (i === 0) ctx.moveTo(m.l, py);
        else ctx.lineTo(px, py);
      }
      const grad = ctx.createLinearGradient(m.l, 0, m.l + w, 0);
      grad.addColorStop(0, "#9b87f5");
      grad.addColorStop(1, "#0EA5E9");
      ctx.strokeStyle = grad;
      ctx.lineWidth = 3;
      ctx.stroke();

      // Points & labels
      ctx.fillStyle = "white";
      ctx.font = "12px sans-serif";
      ctx.textAlign = "center";
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        const x = m.l + (i / (points.length - 1 || 1)) * w;
        const y = p.y;
        ctx.globalAlpha = Math.min(1, t * 1.6 - i * 0.02);
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.fillText("₹" + p.v.toFixed(0), x, y - 12);
        ctx.fillText(projectionData.labels[i], x, m.t + h + 24);
      }

      // Y axis labels
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.textAlign = "right";
      ctx.font = "12px sans-serif";
      for (let tt = 0; tt <= 3; tt++) {
        const vy = min + (tt / 3) * (max - min);
        const y = m.t + h - (tt / 3) * h;
        ctx.fillText("₹" + Math.round(vy).toString(), m.l - 10, y + 4);
      }

      if (t < 1) requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
    
    // Hide loading skeleton after animation starts
    setTimeout(() => setIsLoading(false), 100);
  }, [projectionData, goalAmount]);

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex flex-col gap-4 p-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-40 w-full" />
          <div className="flex gap-4">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-16" />
          </div>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="w-full rounded-lg bg-gradient-to-br from-muted/10 to-transparent transition-opacity duration-300"
        style={{ height: "260px", opacity: isLoading ? 0.3 : 1 }}
      />
    </div>
  );
};
