import { useEffect, useRef } from "react";
import { PieChart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Transaction } from "@/types/investment";

interface CategoryAnalysisProps {
  transactions: Transaction[];
}

export const CategoryAnalysis = ({ transactions }: CategoryAnalysisProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || transactions.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const DPR = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * DPR;
    canvas.height = rect.height * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    // Calculate category totals
    const categoryData: Record<string, number> = {};
    transactions.forEach((t) => {
      categoryData[t.category] = (categoryData[t.category] || 0) + t.roundUp;
    });

    const categories = Object.keys(categoryData);
    const total = Object.values(categoryData).reduce((a, b) => a + b, 0);

    const colors = [
      "#9b87f5", "#0EA5E9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"
    ];

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const radius = Math.min(centerX, centerY) - 40;

    let currentAngle = -Math.PI / 2;

    // Draw pie chart with animation
    const duration = 800;
    const start = performance.now();

    function render(now: number) {
      if (!ctx) return;
      const t = Math.min(1, (now - start) / duration);
      
      ctx.clearRect(0, 0, rect.width, rect.height);

      let angle = -Math.PI / 2;
      categories.forEach((category, i) => {
        const value = categoryData[category];
        const sliceAngle = (value / total) * Math.PI * 2 * t;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, angle, angle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = colors[i % colors.length];
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.1)";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw label
        if (t > 0.5) {
          const midAngle = angle + sliceAngle / 2;
          const labelX = centerX + Math.cos(midAngle) * (radius * 0.7);
          const labelY = centerY + Math.sin(midAngle) * (radius * 0.7);
          
          ctx.fillStyle = "white";
          ctx.font = "bold 12px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.globalAlpha = (t - 0.5) * 2;
          ctx.fillText(`₹${value.toFixed(0)}`, labelX, labelY);
          ctx.globalAlpha = 1;
        }

        angle += sliceAngle;
      });

      if (t < 1) requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
  }, [transactions]);

  if (transactions.length === 0) {
    return null;
  }

  const categoryData: Record<string, number> = {};
  transactions.forEach((t) => {
    categoryData[t.category] = (categoryData[t.category] || 0) + t.roundUp;
  });

  const colors = [
    "#9b87f5", "#0EA5E9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"
  ];

  return (
    <Card className="glass-card border-border/50 animate-slide-up">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <PieChart className="w-5 h-5 text-secondary" />
          Category Analysis
        </CardTitle>
        <CardDescription>Where your round-ups are coming from</CardDescription>
      </CardHeader>
      <CardContent>
        <canvas ref={canvasRef} className="w-full h-64 rounded-lg" />
        <div className="mt-4 grid grid-cols-2 gap-2">
          {Object.entries(categoryData).map(([category, amount], i) => (
            <div key={category} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: colors[i % colors.length] }}
              />
              <span className="text-muted-foreground">{category}:</span>
              <span className="font-bold">₹{amount.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
