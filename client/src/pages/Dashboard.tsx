import React, { useState, useEffect } from "react";
import {
  LuLayers,
  LuStar,
  LuCircle,
  LuChartBar,
  LuChevronRight,
  LuTrendingUp,
} from "react-icons/lu";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import Skeleton from "../components/Skeleton";

interface DashboardProps {}

const Dashboard: React.FC<DashboardProps> = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate initial data fetch
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    { label: "Total Problems", value: 5, icon: LuLayers, color: "text-brand" },
    { label: "Starred", value: 2, icon: LuStar, color: "text-yellow-400" },
    { label: "Easy", value: 3, icon: LuCircle, color: "text-green-500" },
    { label: "Hard", value: 1, icon: LuCircle, color: "text-red-500" },
  ];

  const categoryData = [
    { name: "Coding", value: 1 },
    { name: "Algos", value: 2 },
    { name: "Tech", value: 1 },
    { name: "DS", value: 1 },
  ];

  const difficultyData = [
    { name: "Easy", count: 3, color: "#10b981" },
    { name: "Medium", count: 1, color: "#f59e0b" },
    { name: "Hard", count: 1, color: "#ef4444" },
  ];

  const recentProblems = [
    {
      title: "Two Sum",
      difficulty: "Easy",
      category: "LeetCode-style",
      starred: true,
    },
    {
      title: "Binary Search",
      difficulty: "Easy",
      category: "Searching",
      starred: false,
    },
    {
      title: "Sliding Window Maximum",
      difficulty: "Hard",
      category: "Sliding Window",
      starred: true,
    },
    {
      title: "Merge Sort",
      difficulty: "Medium",
      category: "Sorting",
      starred: false,
    },
    {
      title: "Linked List Cycle Detection",
      difficulty: "Easy",
      category: "Linked List",
      starred: false,
    },
  ];

  if (loading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="space-y-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-sidebar border border-border-subtle p-5 rounded-3xl"
            >
              <Skeleton className="h-4 w-24 mb-3" />
              <Skeleton className="h-10 w-12" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="bg-sidebar border border-border-subtle p-8 rounded-3xl h-[350px]"
            >
              <Skeleton className="h-6 w-32 mb-6" />
              <Skeleton className="h-full w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-text-main">
          Dashboard
        </h1>
        <p className="text-text-muted font-medium">
          Your personal DSA mastery system
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-sidebar border border-border-subtle p-4 md:p-6 rounded-3xl hover:border-brand/40 transition-all duration-300 group shadow-sm hover:shadow-xl hover:shadow-brand/5"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-sidebar-bg rounded-xl">
                <stat.icon size={16} className={`${stat.color}`} />
              </div>
              <span className="text-[10px] font-black text-text-muted uppercase tracking-widest hidden sm:block">
                {stat.label}
              </span>
            </div>
            <div className="text-2xl md:text-4xl font-black text-text-main tracking-tighter">
              {stat.value}
            </div>
            <span className="text-[9px] font-bold text-text-muted/60 uppercase tracking-tight sm:hidden">
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8">
        {/* By Category Chart */}
        <div className="bg-sidebar border border-border-subtle p-6 md:p-8 rounded-3xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-brand/10 p-2 rounded-xl text-brand">
                <LuChartBar size={20} />
              </div>
              <span className="text-lg font-bold text-text-main">
                Category Distribution
              </span>
            </div>
            <LuTrendingUp size={18} className="text-text-muted/40" />
          </div>
          <div className="h-[250px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <XAxis
                  dataKey="name"
                  stroke="var(--text-muted)"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <Tooltip
                  cursor={{ fill: "rgba(var(--brand-rgb), 0.05)" }}
                  contentStyle={{
                    backgroundColor: "var(--sidebar-bg)",
                    borderColor: "var(--border-subtle)",
                    borderRadius: "16px",
                    color: "var(--text-main)",
                    border: "1px solid var(--border-subtle)",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  }}
                  itemStyle={{
                    color: "var(--brand)",
                    fontWeight: "bold",
                    fontSize: "12px",
                  }}
                />
                <Bar
                  dataKey="value"
                  fill="var(--brand)"
                  radius={[6, 6, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* By Difficulty Chart */}
        <div className="bg-sidebar border border-border-subtle p-6 md:p-8 rounded-3xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-brand/10 p-2 rounded-xl text-brand">
                <LuLayers size={20} />
              </div>
              <span className="text-lg font-bold text-text-main">
                Difficulty Breakdown
              </span>
            </div>
          </div>
          <div className="h-[250px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={difficultyData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="var(--text-muted)"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  width={70}
                />
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  contentStyle={{
                    backgroundColor: "var(--sidebar-bg)",
                    borderColor: "var(--border-subtle)",
                    borderRadius: "16px",
                  }}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={25}>
                  {difficultyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recently Added Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-end px-2">
          <h2 className="text-2xl font-black text-text-main tracking-tight">
            Recently Added
          </h2>
          <button className="text-xs font-black uppercase tracking-widest text-brand hover:opacity-80 flex items-center gap-2 transition-all group">
            View all library{" "}
            <LuChevronRight
              size={14}
              className="group-hover:translate-x-1 transition-transform"
            />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {recentProblems.map((problem) => (
            <div
              key={problem.title}
              className="bg-sidebar border border-border-subtle p-6 rounded-3xl hover:border-brand/40 transition-all hover:translate-y-[-4px] shadow-sm hover:shadow-2xl hover:shadow-brand/5 group flex flex-col justify-between"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex flex-wrap gap-2">
                  <span
                    className={`text-[9px] px-2.5 py-1 rounded-full font-black uppercase tracking-widest ${
                      problem.difficulty === "Easy"
                        ? "bg-green-500/10 text-green-500 border border-green-500/20"
                        : problem.difficulty === "Medium"
                          ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                          : "bg-red-500/10 text-red-500 border border-red-500/20"
                    }`}
                  >
                    {problem.difficulty}
                  </span>
                  <span className="text-[9px] px-2.5 py-1 rounded-full font-black uppercase tracking-widest bg-border-subtle/30 text-text-muted border border-border-subtle">
                    {problem.category}
                  </span>
                </div>
                <button
                  className={`transition-all duration-500 ${problem.starred ? "text-yellow-400 scale-125" : "text-text-muted hover:text-yellow-400 hover:scale-125"}`}
                >
                  <LuStar
                    size={20}
                    fill={problem.starred ? "currentColor" : "none"}
                  />
                </button>
              </div>
              <h3 className="font-extrabold text-xl leading-tight group-hover:text-brand transition-colors tracking-tight">
                {problem.title}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
