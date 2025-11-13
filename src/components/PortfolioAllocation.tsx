import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RiskTolerance } from "@/types/investment";
import { getPortfolioAllocation } from "@/lib/portfolio-allocation";
import { PieChart, TrendingUp } from "lucide-react";

interface PortfolioAllocationProps {
  riskTolerance: RiskTolerance;
}

export const PortfolioAllocation = ({ riskTolerance }: PortfolioAllocationProps) => {
  const allocation = getPortfolioAllocation(riskTolerance);

  return (
    <Card className="glass-card border-border/50 animate-slide-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <PieChart className="w-5 h-5 text-primary" />
          Portfolio Allocation
        </CardTitle>
        <CardDescription>
          Asset distribution based on {riskTolerance} risk profile
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {allocation.map((asset, idx) => (
          <div key={asset.name} className="space-y-2 animate-fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: asset.color }}
                />
                <span className="font-medium">{asset.name}</span>
              </div>
              <span className="font-bold text-foreground">{asset.percentage}%</span>
            </div>
            <div className="relative h-2 bg-muted/30 rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full rounded-full transition-all duration-700 ease-out"
                style={{ 
                  width: `${asset.percentage}%`,
                  backgroundColor: asset.color
                }}
              />
            </div>
          </div>
        ))}
        
        <div className="pt-4 mt-4 border-t border-border/50">
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <TrendingUp className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
            <p>
              This allocation automatically optimizes your investment for {riskTolerance} risk tolerance. 
              Adjust your risk profile to see different distributions.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
