import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { InvestmentPlan } from "@/types/investment";
import { useState } from "react";

interface PlanSelectorProps {
  plans: InvestmentPlan[];
  currentPlanId: string;
  onSelectPlan: (planId: string) => void;
  onCreatePlan: (name: string, goalAmount?: number, goalYears?: number) => void;
  onDeletePlan: (planId: string) => void;
}

export const PlanSelector = ({ plans, currentPlanId, onSelectPlan, onCreatePlan, onDeletePlan }: PlanSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newPlanName, setNewPlanName] = useState("");
  const [goalAmount, setGoalAmount] = useState("");
  const [goalYears, setGoalYears] = useState("");

  const handleCreate = () => {
    if (newPlanName.trim()) {
      onCreatePlan(
        newPlanName,
        goalAmount ? Number(goalAmount) : undefined,
        goalYears ? Number(goalYears) : undefined
      );
      setNewPlanName("");
      setGoalAmount("");
      setGoalYears("");
      setIsOpen(false);
    }
  };

  return (
    <Card className="glass-card border-border/50 animate-slide-up">
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Investment Plans</span>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="hero-gradient">
                <Plus className="w-4 h-4 mr-2" />
                New Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border/50">
              <DialogHeader>
                <DialogTitle>Create Investment Plan</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="plan-name">Plan Name</Label>
                  <Input
                    id="plan-name"
                    value={newPlanName}
                    onChange={(e) => setNewPlanName(e.target.value)}
                    placeholder="e.g., Vacation Fund, Emergency Fund"
                    className="mt-1.5 bg-muted/30 border-border/50"
                  />
                </div>
                <div>
                  <Label htmlFor="goal-amount">Goal Amount (₹) - Optional</Label>
                  <Input
                    id="goal-amount"
                    type="number"
                    value={goalAmount}
                    onChange={(e) => setGoalAmount(e.target.value)}
                    placeholder="e.g., 50000"
                    className="mt-1.5 bg-muted/30 border-border/50"
                  />
                </div>
                <div>
                  <Label htmlFor="goal-years">Goal Timeline (years) - Optional</Label>
                  <Input
                    id="goal-years"
                    type="number"
                    value={goalYears}
                    onChange={(e) => setGoalYears(e.target.value)}
                    placeholder="e.g., 2"
                    className="mt-1.5 bg-muted/30 border-border/50"
                  />
                </div>
                <Button onClick={handleCreate} className="w-full hero-gradient">
                  Create Plan
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Label>Select Active Plan</Label>
        <Select value={currentPlanId} onValueChange={onSelectPlan}>
          <SelectTrigger className="bg-muted/30 border-border/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {plans.map((plan) => (
              <SelectItem key={plan.id} value={plan.id}>
                {plan.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {plans.length > 1 && (
          <div className="pt-2 space-y-2">
            {plans.map((plan) => (
              <div key={plan.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/20">
                <span className="text-sm font-medium">{plan.name}</span>
                {plan.id !== "default" && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDeletePlan(plan.id)}
                    className="h-7 text-xs"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
