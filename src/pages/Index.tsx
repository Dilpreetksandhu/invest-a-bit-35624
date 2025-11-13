import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Sparkles, TrendingUp, DollarSign, Download, Play, RotateCcw, Info, Coffee, ShoppingCart } from "lucide-react";
import { InvestmentPlan, Transaction, ProjectionData, RiskTolerance, CATEGORIES } from "@/types/investment";
import { PlanSelector } from "@/components/PlanSelector";
import { GoalTracker } from "@/components/GoalTracker";
import { CategoryAnalysis } from "@/components/CategoryAnalysis";
import { RiskSimulator } from "@/components/RiskSimulator";
import { ProjectionChart } from "@/components/ProjectionChart";
import { PortfolioAllocation } from "@/components/PortfolioAllocation";
import logo from "@/assets/logo.png";

const Index = () => {
  // Plan management
  const [plans, setPlans] = useState<InvestmentPlan[]>([
    {
      id: "default",
      name: "Default Plan",
      transactions: [],
      monthlyContribution: "0",
      annualReturn: "8",
      years: "5"
    }
  ]);
  const [currentPlanId, setCurrentPlanId] = useState("default");
  
  const currentPlan = plans.find(p => p.id === currentPlanId) || plans[0];
  
  // Transaction form state
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [tdate, setTdate] = useState(new Date().toISOString().slice(0, 10));
  const [roundUnit, setRoundUnit] = useState("10");
  
  // Risk tolerance
  const [riskTolerance, setRiskTolerance] = useState<RiskTolerance>("moderate");
  
  // Current invested balance (separate from spare change)
  const [currentBalance, setCurrentBalance] = useState("0");
  
  const [lastCsv, setLastCsv] = useState("");
  const [projectionData, setProjectionData] = useState<ProjectionData | null>(null);

  const calculateRoundUp = (amt: number, unit: string) => {
    const unitNum = Number(unit);
    const ceilToUnit = Math.ceil(amt / unitNum) * unitNum;
    return Number(Math.max(0, ceilToUnit - amt).toFixed(2));
  };

  const updatePlan = (planId: string, updates: Partial<InvestmentPlan>) => {
    setPlans(plans.map(p => p.id === planId ? { ...p, ...updates } : p));
  };

  const totalSpare = currentPlan.transactions.reduce((sum, t) => sum + t.roundUp, 0);

  const addTransaction = () => {
    const descVal = desc.trim();
    const amtVal = Number(amount);
    
    // Form validation
    if (!descVal) {
      toast.error("Please enter a description");
      return;
    }
    if (!amount || amtVal <= 0) {
      toast.error("Please enter a valid positive amount");
      return;
    }
    if (amtVal > 1000000) {
      toast.error("Amount cannot exceed ₹10,00,000");
      return;
    }
    if (!tdate) {
      toast.error("Please select a date");
      return;
    }
    
    const roundUp = calculateRoundUp(amtVal, roundUnit);
    const newTransaction: Transaction = { 
      desc: descVal, 
      amount: amtVal, 
      date: tdate, 
      roundUp, 
      category 
    };
    updatePlan(currentPlanId, {
      transactions: [...currentPlan.transactions, newTransaction]
    });
    setAmount("");
    setDesc("");
    toast.success(`Transaction added • Round-up: ₹${roundUp.toFixed(2)}`);
  };

  const deleteTransaction = (idx: number) => {
    updatePlan(currentPlanId, {
      transactions: currentPlan.transactions.filter((_, i) => i !== idx)
    });
    toast.success("Transaction removed");
  };

  const seedDemo = () => {
    const demo = [
      { date: "2025-11-05", desc: "Coffee", amount: 149.5, category: "Food & Dining" },
      { date: "2025-11-06", desc: "Grocery", amount: 372.2, category: "Shopping" },
      { date: "2025-11-07", desc: "Lunch", amount: 219.0, category: "Food & Dining" },
    ];
    const newTx = demo.map((d) => ({ ...d, roundUp: calculateRoundUp(d.amount, roundUnit) }));
    updatePlan(currentPlanId, {
      transactions: [...currentPlan.transactions, ...newTx]
    });
    toast.success("Demo transactions added");
  };

  const clearAll = () => {
    updatePlan(currentPlanId, { transactions: [] });
    setProjectionData(null);
    toast.success("Cleared");
  };

  const exportCsv = () => {
    if (currentPlan.transactions.length === 0) {
      toast.error("No transactions to export");
      return;
    }
    const header = ["date", "description", "category", "amount", "roundUp"];
    const rows = currentPlan.transactions.map((t) => [
      t.date, 
      `"${t.desc}"`, 
      t.category, 
      t.amount.toFixed(2), 
      t.roundUp.toFixed(2)
    ]);
    const csv = [header.join(","), ...rows.map((r) => r.join(","))].join("\n");
    setLastCsv(csv);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentPlan.name}_transactions.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  };

  const simulate = () => {
    const spare = totalSpare;
    const monthly = Number(currentPlan.monthlyContribution);
    const annualRet = Number(currentPlan.annualReturn);
    const yrs = Number(currentPlan.years);
    const startingBalance = Number(currentBalance);
    
    // Validation
    if (spare + monthly + startingBalance <= 0) {
      toast.error("You need at least one of: spare change, monthly contribution, or current balance");
      return;
    }
    if (annualRet < 0 || annualRet > 50) {
      toast.error("Annual return should be between 0% and 50%");
      return;
    }
    if (yrs <= 0 || yrs > 50) {
      toast.error("Investment duration must be greater than 0 and less than 50 years");
      return;
    }

    // Calculate risk-adjusted returns
    const riskAdjustments = {
      conservative: { min: 0.6, max: 0.8 },
      moderate: { min: 0.9, max: 1.1 },
      aggressive: { min: 1.2, max: 1.5 }
    };
    
    const adjustment = riskAdjustments[riskTolerance];
    const conservativeRate = (annualRet * adjustment.min) / 100 / 12;
    const moderateRate = annualRet / 100 / 12;
    const aggressiveRate = (annualRet * adjustment.max) / 100 / 12;

    let balance = spare + startingBalance;
    let conservativeBalance = spare + startingBalance;
    let aggressiveBalance = spare + startingBalance;
    
    const values: number[] = [];
    const conservative: number[] = [];
    const aggressive: number[] = [];
    const labels: string[] = [];
    
    // Calculate total months
    const totalMonths = Math.ceil(yrs * 12);
    
    // Determine how to display labels (yearly for >= 1 year, monthly for < 1 year)
    const showYearly = yrs >= 1;
    const monthsPerLabel = showYearly ? 12 : Math.max(1, Math.floor(totalMonths / 5));
    
    for (let m = 1; m <= totalMonths; m++) {
      balance += monthly;
      balance = balance * (1 + moderateRate);
      
      conservativeBalance += monthly;
      conservativeBalance = conservativeBalance * (1 + conservativeRate);
      
      aggressiveBalance += monthly;
      aggressiveBalance = aggressiveBalance * (1 + aggressiveRate);
      
      // Add data points at appropriate intervals or at the end
      if (m % monthsPerLabel === 0 || m === totalMonths) {
        values.push(Number(balance.toFixed(2)));
        conservative.push(Number(conservativeBalance.toFixed(2)));
        aggressive.push(Number(aggressiveBalance.toFixed(2)));
        
        if (showYearly) {
          const yearNum = Math.floor(m / 12);
          labels.push(yearNum > 0 ? `Y${yearNum}` : `M${m}`);
        } else {
          labels.push(`M${m}`);
        }
      }
    }
    
    setProjectionData({ values, labels, conservative, aggressive });
    toast.success(`Projection generated for ${riskTolerance} risk profile`);
  };

  const investNow = () => {
    if (totalSpare <= 0) {
      toast.error("No spare change to invest");
      return;
    }
    const newMonthly = (Number(currentPlan.monthlyContribution) + totalSpare).toFixed(2);
    updatePlan(currentPlanId, {
      monthlyContribution: newMonthly,
      transactions: []
    });
    toast.success("Spare moved to monthly contribution");
  };

  const addQuickTransaction = (description: string, amt: number, cat: string) => {
    const roundUp = calculateRoundUp(amt, roundUnit);
    const newTransaction: Transaction = {
      desc: description,
      amount: amt,
      date: new Date().toISOString().slice(0, 10),
      roundUp,
      category: cat
    };
    updatePlan(currentPlanId, {
      transactions: [...currentPlan.transactions, newTransaction]
    });
    toast.success(`${description} added`);
  };

  const createPlan = (name: string, goalAmount?: number, goalYears?: number) => {
    const newPlan: InvestmentPlan = {
      id: Date.now().toString(),
      name,
      transactions: [],
      monthlyContribution: "0",
      annualReturn: "8",
      years: goalYears?.toString() || "5",
      goalAmount,
      goalYears
    };
    setPlans([...plans, newPlan]);
    setCurrentPlanId(newPlan.id);
    toast.success(`Plan "${name}" created`);
  };

  const deletePlan = (planId: string) => {
    if (planId === "default") {
      toast.error("Cannot delete default plan");
      return;
    }
    setPlans(plans.filter(p => p.id !== planId));
    if (currentPlanId === planId) {
      setCurrentPlanId("default");
    }
    toast.success("Plan deleted");
  };

  const projectedValue = projectionData?.values[projectionData.values.length - 1] || 0;

  return (
    <div className="min-h-screen p-4 md:p-6 xl:p-8">
      <div className="max-w-7xl mx-auto w-full">
      {/* Hero Header */}
      <header className="mb-6 lg:mb-8 animate-fade-in">
        <div className="glass-card rounded-2xl p-4 md:p-6 relative overflow-hidden hover:scale-[1.01] transition-transform duration-300">
          <div className="absolute right-[-40px] top-[-30px] w-60 h-60 rounded-full bg-gradient-to-br from-primary/20 to-secondary/15 blur-3xl animate-hero-in" />
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6 relative z-10">
            <div className="flex items-center gap-3 md:gap-4 flex-1">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <img src={logo} alt="Micro-Invest Logo" className="w-full h-full rounded-xl" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-1">Micro-Invest</h1>
                <p className="text-muted-foreground text-xs md:text-sm line-clamp-2">Collect spare change from everyday transactions and watch it compound</p>
              </div>
            </div>
            
            <div className="flex gap-2 md:gap-3 w-full sm:w-auto">
              <Button 
                onClick={() => document.getElementById("desc-input")?.focus()} 
                className="hero-gradient flex-1 sm:flex-initial"
                size="sm"
              >
                Get Started
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-initial"
                onClick={() => toast.info("Round-ups collect the difference between your purchase and the next rupee unit. This demo simulates investing them with compound interest.")}
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 md:gap-6 xl:gap-8">
        {/* Left Column: Transactions & Investments */}
        <div className="space-y-5 md:space-y-6">
          <Card className="glass-card border-border/50 animate-slide-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                Add Transaction
              </CardTitle>
              <CardDescription>Enter a purchase to compute the round-up</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="desc-input">Description</Label>
                <Input
                  id="desc-input"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Coffee, Grocery..."
                  className="mt-1.5 bg-muted/30 border-border/50 focus:border-primary/50"
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="mt-1.5 bg-muted/30 border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="amount">Amount (₹)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="149.50"
                    className="mt-1.5 bg-muted/30 border-border/50 focus:border-primary/50"
                  />
                </div>
                <div>
                  <Label htmlFor="tdate">Date</Label>
                  <Input
                    id="tdate"
                    type="date"
                    value={tdate}
                    onChange={(e) => setTdate(e.target.value)}
                    className="mt-1.5 bg-muted/30 border-border/50 focus:border-primary/50"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="roundUnit">Round to</Label>
                <Select value={roundUnit} onValueChange={setRoundUnit}>
                  <SelectTrigger className="mt-1.5 bg-muted/30 border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 rupee</SelectItem>
                    <SelectItem value="5">5 rupees</SelectItem>
                    <SelectItem value="10">10 rupees</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <Button onClick={addTransaction} className="w-full hero-gradient">
                  Add Transaction
                </Button>
                <div className="flex gap-2">
                  <Button onClick={seedDemo} variant="outline" size="sm" className="flex-1">
                    Seed Demo
                  </Button>
                  <Button onClick={clearAll} variant="outline" size="sm" className="flex-1">
                    Clear All
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transactions List */}
          <Card className="glass-card border-border/50 animate-slide-up" style={{ animationDelay: "100ms" }}>
            <CardHeader>
              <CardTitle className="text-lg">Transactions</CardTitle>
              <CardDescription>{currentPlan.transactions.length} transaction{currentPlan.transactions.length !== 1 ? 's' : ''}</CardDescription>
            </CardHeader>
            <CardContent>
              {currentPlan.transactions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No transactions yet. Add one to start collecting spare change.</p>
              ) : (
                <div className="space-y-2 max-h-64 md:max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                  {currentPlan.transactions.map((t, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/30 animate-slide-up hover:bg-muted/30 transition-colors"
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="px-3 py-1.5 rounded-lg bg-primary/20 text-primary font-bold text-sm">
                          ₹{t.roundUp.toFixed(2)}
                        </div>
                        <div>
                          <div className="font-semibold text-sm">{t.desc}</div>
                          <div className="text-xs text-muted-foreground">{t.date} • {t.category}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono">₹{t.amount.toFixed(2)}</span>
                        <Button onClick={() => deleteTransaction(idx)} variant="ghost" size="sm" className="h-7 text-xs">
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

          {/* Spare Change Balance */}
          <Card className="glass-card border-border/50 animate-slide-up" style={{ animationDelay: "50ms" }}>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <CardDescription className="mb-1">Spare Change Balance</CardDescription>
                  <CardTitle className="text-3xl md:text-4xl font-bold">₹ {totalSpare.toFixed(2)}</CardTitle>
                  <p className="text-xs md:text-sm text-muted-foreground mt-2">Collected from round-ups. Invest periodically or top up monthly.</p>
                </div>
                <div className="flex gap-2 md:flex-col md:gap-2">
                  <Button onClick={investNow} className="hero-gradient flex-1 md:flex-initial" size="sm">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Invest Now
                  </Button>
                  <Button onClick={exportCsv} variant="outline" size="sm" className="flex-1 md:flex-initial">
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Investment Settings */}
          <Card className="glass-card border-border/50 animate-slide-up" style={{ animationDelay: "100ms" }}>
              <CardHeader>
                <CardTitle className="text-lg">Investment Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Current Balance (₹)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={currentBalance}
                    onChange={(e) => setCurrentBalance(e.target.value)}
                    placeholder="0.00"
                    className="mt-1.5 bg-muted/30 border-border/50"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Your existing invested amount</p>
                </div>
                <div>
                  <Label>Expected Annual Return (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={currentPlan.annualReturn}
                    onChange={(e) => updatePlan(currentPlanId, { annualReturn: e.target.value })}
                    className="mt-1.5 bg-muted/30 border-border/50"
                  />
                </div>
                <div>
                  <Label>Monthly Contribution (₹)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={currentPlan.monthlyContribution}
                    onChange={(e) => updatePlan(currentPlanId, { monthlyContribution: e.target.value })}
                    className="mt-1.5 bg-muted/30 border-border/50"
                  />
                </div>
                <div>
                  <Label>Investment Duration (years)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={currentPlan.years}
                    onChange={(e) => updatePlan(currentPlanId, { years: e.target.value })}
                    className="mt-1.5 bg-muted/30 border-border/50"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Supports fractional years (e.g., 0.5, 1.5)</p>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button onClick={simulate} className="flex-1 hero-gradient">
                    <Play className="w-4 h-4 mr-2" />
                    Simulate
                  </Button>
                  <Button onClick={() => setProjectionData(null)} variant="outline" size="icon">
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

          {/* Projection Chart */}
          <Card className="glass-card border-border/50 animate-slide-up" style={{ animationDelay: "150ms" }}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-secondary" />
                Projection
              </CardTitle>
              <CardDescription>Yearly projection of invested balance</CardDescription>
            </CardHeader>
            <CardContent>
              {projectionData ? (
                <div>
                  <ProjectionChart 
                    projectionData={projectionData} 
                    goalAmount={currentPlan.goalAmount}
                  />
                  <p className="text-sm text-muted-foreground mt-4">
                    <strong>Projected after {currentPlan.years} years: ₹ {projectedValue.toFixed(2)}</strong> (Assumed {currentPlan.annualReturn}% p.a.)
                  </p>
                  {projectionData.conservative && projectionData.aggressive && (
                    <div className="text-xs text-muted-foreground mt-2 space-y-1">
                      <p>Risk-adjusted range ({riskTolerance}):</p>
                      <p>Conservative: ₹{projectionData.conservative[projectionData.conservative.length - 1].toFixed(2)}</p>
                      <p>Aggressive: ₹{projectionData.aggressive[projectionData.aggressive.length - 1].toFixed(2)}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Info className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Configure settings and click Simulate to see projection</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Plans & Portfolio */}
        <div className="space-y-5 md:space-y-6">
          <PlanSelector
            plans={plans}
            currentPlanId={currentPlanId}
            onSelectPlan={setCurrentPlanId}
            onCreatePlan={createPlan}
            onDeletePlan={deletePlan}
          />

          <GoalTracker
            plan={currentPlan}
            currentBalance={Number(currentBalance)}
            projectedValue={projectedValue}
          />

          <RiskSimulator
            riskTolerance={riskTolerance}
            onRiskChange={setRiskTolerance}
          />

          <PortfolioAllocation riskTolerance={riskTolerance} />

          <CategoryAnalysis transactions={currentPlan.transactions} />

          <Card className="glass-card border-border/50 animate-slide-up" style={{ animationDelay: "200ms" }}>
            <CardHeader>
              <CardTitle className="text-lg">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                <span className="text-sm text-muted-foreground">Transactions</span>
                <span className="text-xl font-bold">{currentPlan.transactions.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                <span className="text-sm text-muted-foreground">Total Round-Ups</span>
                <span className="text-xl font-bold">₹ {totalSpare.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                <span className="text-sm text-muted-foreground">Projected ({currentPlan.years}y)</span>
                <span className="text-xl font-bold">
                  {projectedValue > 0 ? `₹ ${projectedValue.toFixed(2)}` : "—"}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-border/50 animate-slide-up" style={{ animationDelay: "250ms" }}>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button onClick={() => addQuickTransaction("Coffee", 131.6, "Food & Dining")} variant="outline" className="w-full justify-start">
                <Coffee className="w-4 h-4 mr-2" />
                Add sample coffee
              </Button>
              <Button onClick={() => addQuickTransaction("Grocery", 485.9, "Shopping")} variant="outline" className="w-full justify-start">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add sample grocery
              </Button>
              <Button
                onClick={() => {
                  if (!lastCsv) {
                    toast.error("No CSV exported yet");
                    return;
                  }
                  const blob = new Blob([lastCsv], { type: "text/csv" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "transactions.csv";
                  a.click();
                  URL.revokeObjectURL(url);
                  toast.success("CSV downloaded");
                }}
                variant="outline"
                className="w-full justify-start"
              >
                <Download className="w-4 h-4 mr-2" />
                Download last CSV
              </Button>
            </CardContent>
          </Card>

          <div className="text-xs text-muted-foreground text-center p-4">
            Made for demo & assignment. No real investing or persistence.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
