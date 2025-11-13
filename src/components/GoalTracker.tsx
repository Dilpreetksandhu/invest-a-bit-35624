import { Target, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { InvestmentPlan } from "@/types/investment";

interface GoalTrackerProps {
  plan: InvestmentPlan;
  currentBalance: number;
  projectedValue: number;
}

export const GoalTracker = ({ plan, currentBalance, projectedValue }: GoalTrackerProps) => {
  if (!plan.goalAmount) return null;

  const progress = Math.min(100, (currentBalance / plan.goalAmount) * 100);
  const projectedProgress = Math.min(100, (projectedValue / plan.goalAmount) * 100);
  const onTrack = projectedValue >= plan.goalAmount;

  return (
    <Card className="glass-card border-border/50 animate-slide-up">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Goal Progress
        </CardTitle>
        <CardDescription>
          Target: ₹{plan.goalAmount.toLocaleString()} {plan.goalYears && `in ${plan.goalYears} years`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Current Balance</span>
            <span className="font-bold">₹{currentBalance.toFixed(2)}</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="text-xs text-muted-foreground mt-1">
            {progress.toFixed(1)}% of goal reached
          </div>
        </div>

        {projectedValue > 0 && (
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Projected Value</span>
              <span className={`font-bold ${onTrack ? "text-success" : "text-warning"}`}>
                ₹{projectedValue.toFixed(2)}
              </span>
            </div>
            <Progress value={projectedProgress} className="h-2" />
            <div className={`text-xs mt-1 flex items-center gap-1 ${onTrack ? "text-success" : "text-warning"}`}>
              <TrendingUp className="w-3 h-3" />
              {onTrack ? "On track to meet goal!" : `${(plan.goalAmount - projectedValue).toFixed(0)} short of goal`}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
