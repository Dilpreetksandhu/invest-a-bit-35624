import { Shield, TrendingUp, Zap, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { RiskTolerance } from "@/types/investment";
import { getExpectedReturnRange } from "@/lib/portfolio-allocation";

interface RiskSimulatorProps {
  riskTolerance: RiskTolerance;
  onRiskChange: (risk: RiskTolerance) => void;
}

export const RiskSimulator = ({ riskTolerance, onRiskChange }: RiskSimulatorProps) => {
  const riskProfiles = [
    {
      value: "conservative" as const,
      label: "Conservative",
      icon: Shield,
      description: "Lower returns, minimal risk",
      returnRange: "3-5% p.a.",
      color: "text-blue-400",
      tooltip: "70-90% Government Bonds, 10-30% stable mutual funds. Best for capital preservation with steady, low returns."
    },
    {
      value: "moderate" as const,
      label: "Moderate",
      icon: TrendingUp,
      description: "Balanced risk and returns",
      returnRange: "6-9% p.a.",
      color: "text-primary",
      tooltip: "40-60% ETFs, 20-40% Bonds, up to 20% growth funds. Balanced approach for steady growth with managed risk."
    },
    {
      value: "aggressive" as const,
      label: "Aggressive",
      icon: Zap,
      description: "Higher potential returns",
      returnRange: "10-15% p.a.",
      color: "text-warning",
      tooltip: "60-80% Equity ETFs, 10-25% growth funds, 0-10% bonds. Maximum growth potential with higher volatility."
    }
  ];

  return (
    <TooltipProvider>
      <Card className="glass-card border-border/50 animate-slide-up">
        <CardHeader>
          <CardTitle className="text-lg">Risk Tolerance</CardTitle>
          <CardDescription>Choose your investment risk profile</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={riskTolerance} onValueChange={(v) => onRiskChange(v as RiskTolerance)}>
            <div className="space-y-3">
              {riskProfiles.map((profile) => {
                const Icon = profile.icon;
                const isSelected = riskTolerance === profile.value;
                return (
                  <div
                    key={profile.value}
                    className={`flex items-start gap-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer hover:scale-[1.02] ${
                      isSelected
                        ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                        : "border-border/30 bg-muted/10 hover:bg-muted/20 hover:border-border/50"
                    }`}
                    onClick={() => onRiskChange(profile.value)}
                  >
                    <RadioGroupItem value={profile.value} id={profile.value} className="mt-1" />
                    <div className="flex-1">
                      <Label
                        htmlFor={profile.value}
                        className="flex items-center gap-2 cursor-pointer font-semibold"
                      >
                        <Icon className={`w-4 h-4 ${profile.color}`} />
                        {profile.label}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground transition-colors" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p className="text-xs">{profile.tooltip}</p>
                          </TooltipContent>
                        </Tooltip>
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">{profile.description}</p>
                      <p className="text-xs font-mono mt-1 text-primary">{profile.returnRange}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </RadioGroup>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};
