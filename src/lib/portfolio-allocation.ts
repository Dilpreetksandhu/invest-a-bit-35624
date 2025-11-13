import { RiskTolerance } from "@/types/investment";

export interface AllocationBreakdown {
  name: string;
  percentage: number;
  color: string;
}

export const getPortfolioAllocation = (riskTolerance: RiskTolerance): AllocationBreakdown[] => {
  switch (riskTolerance) {
    case "conservative":
      return [
        { name: "Government Bonds", percentage: 80, color: "hsl(220, 70%, 50%)" },
        { name: "Stable Mutual Funds", percentage: 15, color: "hsl(174, 62%, 47%)" },
        { name: "Low Volatility ETFs", percentage: 5, color: "hsl(265, 70%, 66%)" }
      ];
    case "moderate":
      return [
        { name: "Diversified ETFs", percentage: 50, color: "hsl(174, 62%, 47%)" },
        { name: "Government Bonds", percentage: 30, color: "hsl(220, 70%, 50%)" },
        { name: "Growth Mutual Funds", percentage: 20, color: "hsl(265, 70%, 66%)" }
      ];
    case "aggressive":
      return [
        { name: "Equity ETFs", percentage: 70, color: "hsl(265, 70%, 66%)" },
        { name: "Growth Mutual Funds", percentage: 20, color: "hsl(174, 62%, 47%)" },
        { name: "Government Bonds", percentage: 10, color: "hsl(220, 70%, 50%)" }
      ];
  }
};

export const getExpectedReturnRange = (riskTolerance: RiskTolerance): string => {
  switch (riskTolerance) {
    case "conservative":
      return "3-5% p.a.";
    case "moderate":
      return "6-9% p.a.";
    case "aggressive":
      return "10-15% p.a.";
  }
};
