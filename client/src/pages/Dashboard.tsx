import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import {
  LuLayers,
  LuStar,
  LuCircle,
  LuChartBar,
  LuChevronRight,
  LuTrendingUp,
  LuActivity,
  LuPlus,
  LuTrash,
  LuPencil,
  LuClock,
} from "react-icons/lu";
const CustomBarChart = React.lazy(() => import("../components/CustomCharts/CustomBarChart"));
import Skeleton from "../components/Skeleton";
import { fetchProblems } from "../features/problems/problemsSlice";
import type { RootState, AppDispatch } from "../app/store";
import api from "../services/api";
import { io } from "socket.io-client";

interface DashboardProps {}

const useContainerSize = () => {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const observerRef = React.useRef<ResizeObserver | null>(null);

  const ref = useCallback((node: HTMLDivElement | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    if (node) {
      observerRef.current = new ResizeObserver((entries) => {
        if (!entries || entries.length === 0) return;
        const { width, height } = entries[0].contentRect;
        setSize({ width, height });
      });
      observerRef.current.observe(node);

      // Set initial size
      setSize({
        width: node.clientWidth,
        height: node.clientHeight,
      });
    }
  }, []);

  return [ref, size] as const;
};

const Dashboard: React.FC<DashboardProps> = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { problems, loading: problemsLoading } = useSelector(
    (state: RootState) => state.problems
  );

  const [activeTab, setActiveTab] = useState<"activity" | "telemetry">("activity");
  const [activities, setActivities] = useState<any[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [telemetryLogs, setTelemetryLogs] = useState<any[]>([]);
  const [telemetryLoading, setTelemetryLoading] = useState(true);
  const [averages, setAverages] = useState<Record<string, { value: number; rating: string }>>({
    FCP: { value: 0, rating: "good" },
    LCP: { value: 0, rating: "good" },
    FID: { value: 0, rating: "good" },
    CLS: { value: 0, rating: "good" },
    TTFB: { value: 0, rating: "good" },
  });

  const [categoryRef, categorySize] = useContainerSize();
  const [difficultyRef, difficultySize] = useContainerSize();

  const loadActivities = useCallback(async () => {
    try {
      const res = await api.get("/activities");
      setActivities(res.data);
    } catch (err) {
      console.error("Failed to load telemetry activities:", err);
    } finally {
      setActivitiesLoading(false);
    }
  }, []);

  const loadTelemetry = useCallback(async () => {
    try {
      const res = await api.get("/telemetry");
      if (res.data) {
        setTelemetryLogs(res.data.logs || []);
        if (res.data.averages) {
          setAverages((prev) => ({
            ...prev,
            ...res.data.averages,
          }));
        }
      }
    } catch (err) {
      console.error("Failed to load telemetry performance records:", err);
    } finally {
      setTelemetryLoading(false);
    }
  }, []);

  useEffect(() => {
    dispatch(fetchProblems({}));
    loadActivities();
    loadTelemetry();

    // Connect to WebSocket server for real-time telemetry stream!
    const socketUrl = import.meta.env.VITE_API_URL 
      ? import.meta.env.VITE_API_URL.replace("/api", "") 
      : "http://localhost:5000";
    const socket = io(socketUrl);

    socket.on("connect", () => {
      console.log("[WebSocket Telemetry] Connected to real-time activities stream!");
    });

    socket.on("activity", (newActivity: any) => {
      console.log("[WebSocket Telemetry] Received activity feed event:", newActivity);
      setActivities((prev) => [newActivity, ...prev].slice(0, 15)); // prepend and cap at 15 items!
    });

    socket.on("telemetry", (newReport: any) => {
      console.log("[WebSocket Telemetry] Received performance telemetry event:", newReport);
      setTelemetryLogs((prev) => [newReport, ...prev].slice(0, 15));
      
      setAverages((prev) => {
        const prevMetric = prev[newReport.metric] || { value: 0, rating: "good" };
        const newValue = prevMetric.value === 0 
          ? newReport.value 
          : parseFloat(((prevMetric.value * 9 + newReport.value) / 10).toFixed(3));
        return {
          ...prev,
          [newReport.metric]: {
            value: newValue,
            rating: newReport.rating,
          }
        };
      });
    });

    socket.on("disconnect", () => {
      console.log("[WebSocket Telemetry] Disconnected from activities stream.");
    });

    return () => {
      socket.disconnect();
    };
  }, [dispatch, loadActivities, loadTelemetry]);

  // Compute dynamic stats based on real database records
  const totalProblemsCount = problems.length;
  const starredCount = problems.filter((p) => p.starred).length;
  const easyCount = problems.filter((p) => p.difficulty === "Easy").length;
  const mediumCount = problems.filter((p) => p.difficulty === "Medium").length;
  const hardCount = problems.filter((p) => p.difficulty === "Hard").length;

  const stats = [
    { label: "Total Problems", value: totalProblemsCount, icon: LuLayers, color: "text-brand" },
    { label: "Starred", value: starredCount, icon: LuStar, color: "text-yellow-400" },
    { label: "Easy / Medium", value: `${easyCount} / ${mediumCount}`, icon: LuCircle, color: "text-green-500" },
    { label: "Hard Challenges", value: hardCount, icon: LuCircle, color: "text-red-500" },
  ];

  // Dynamic Category count mapper
  const categoryCounts: Record<string, number> = {};
  problems.forEach((p) => {
    const cat = p.categories?.[0] || "Uncategorized";
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  const categoryData = Object.keys(categoryCounts).length > 0
    ? Object.keys(categoryCounts).map((cat) => ({
        name: cat,
        value: categoryCounts[cat],
      }))
    : [
        { name: "Coding", value: 0 },
        { name: "Algos", value: 0 },
        { name: "Tech", value: 0 },
        { name: "DS", value: 0 },
      ];

  const difficultyData = [
    { name: "Easy", count: easyCount, color: "#10b981" },
    { name: "Medium", count: mediumCount, color: "#f59e0b" },
    { name: "Hard", count: hardCount, color: "#ef4444" },
  ];

  // Real-time sorted recently added problem records
  const recentProblems = [...problems]
    .sort((a, b) => new Date(b.addedDate || 0).getTime() - new Date(a.addedDate || 0).getTime())
    .slice(0, 4);

  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (problemsLoading && problems.length === 0) {
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
            <div className="text-xl md:text-3xl font-black text-text-main tracking-tighter">
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
          <div ref={categoryRef} className="h-[250px] w-full min-w-0">
            {categorySize.width > 0 && (
              <Suspense fallback={<Skeleton className="h-[250px] w-full rounded-2xl" />}>
                <CustomBarChart
                  width={categorySize.width}
                  height={250}
                  data={categoryData}
                  barDataKey="value"
                  xAxisDataKey="name"
                  barSize={40}
                  radius={[6, 6, 0, 0]}
                  customTooltipCursor={{ fill: "rgba(var(--brand-rgb), 0.05)" }}
                  customTooltipContentStyle={{
                    backgroundColor: "var(--sidebar-bg)",
                    borderColor: "var(--border-subtle)",
                    borderRadius: "16px",
                    color: "var(--text-main)",
                    border: "1px solid var(--border-subtle)",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  }}
                  customTooltipItemStyle={{
                    color: "var(--brand)",
                    fontWeight: "bold",
                    fontSize: "12px",
                  }}
                />
              </Suspense>
            )}
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
          <div ref={difficultyRef} className="h-[250px] w-full min-w-0">
            {difficultySize.width > 0 && (
              <Suspense fallback={<Skeleton className="h-[250px] w-full rounded-2xl" />}>
                <CustomBarChart
                  width={difficultySize.width}
                  height={250}
                  data={difficultyData}
                  layout="vertical"
                  barDataKey="count"
                  yAxisDataKey="name"
                  barSize={25}
                  radius={[0, 6, 6, 0]}
                  hideXAxis={true}
                  hideYAxis={false}
                  yAxisWidth={70}
                  customTooltipCursor={{ fill: "transparent" }}
                  customTooltipContentStyle={{
                    backgroundColor: "var(--sidebar-bg)",
                    borderColor: "var(--border-subtle)",
                    borderRadius: "16px",
                  }}
                  cells={difficultyData.map(entry => ({ fill: entry.color }))}
                />
              </Suspense>
            )}
          </div>
        </div>
      </div>

      {/* 2-Column Split: Recently Added & Observability Telemetry Stream */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 md:gap-8 items-start">
        {/* Left Column (Recently Added) */}
        <div className="xl:col-span-3 space-y-6">
          <div className="flex justify-between items-end px-2">
            <h2 className="text-2xl font-black text-text-main tracking-tight">
              Recently Added
            </h2>
            <Link 
              to="/all-problems" 
              className="text-xs font-black uppercase tracking-widest text-brand hover:opacity-80 flex items-center gap-2 transition-all group"
            >
              View all library{" "}
              <LuChevronRight
                size={14}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {recentProblems.length > 0 ? (
              recentProblems.map((problem) => (
                <Link
                  key={problem.slug}
                  to={`/problems/${problem.slug}`}
                  className="bg-sidebar border border-border-subtle p-6 rounded-3xl hover:border-brand/40 transition-all hover:translate-y-[-4px] shadow-sm hover:shadow-2xl hover:shadow-brand/5 group flex flex-col justify-between h-40 animate-in fade-in-50 duration-300"
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
                        {problem.categories?.[0] || "General"}
                      </span>
                    </div>
                    {problem.starred && (
                      <span className="text-yellow-400">
                        <LuStar size={16} fill="currentColor" />
                      </span>
                    )}
                  </div>
                  <h3 className="font-extrabold text-lg leading-tight group-hover:text-brand transition-colors tracking-tight line-clamp-2">
                    {problem.title}
                  </h3>
                </Link>
              ))
            ) : (
              <div className="col-span-2 py-12 text-center bg-sidebar border border-border-subtle rounded-3xl text-text-muted text-sm font-medium">
                No problems added yet. Click New Problem to begin.
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Observability Telemetry Feed) */}
        <div className="xl:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="bg-brand/10 p-2 rounded-xl text-brand animate-pulse">
                <LuActivity size={18} />
              </div>
              <h2 className="text-2xl font-black text-text-main tracking-tight">
                Observability
              </h2>
            </div>
            
            <div className="flex bg-sidebar border border-border-subtle p-0.5 rounded-xl text-[10px] font-black uppercase tracking-wider">
              <button
                onClick={() => setActiveTab("activity")}
                className={`px-3 py-1.5 rounded-lg transition-all duration-200 ${
                  activeTab === "activity"
                    ? "bg-brand text-white shadow-md shadow-brand/15"
                    : "text-text-muted hover:text-text-main"
                }`}
              >
                Activities
              </button>
              <button
                onClick={() => setActiveTab("telemetry")}
                className={`px-3 py-1.5 rounded-lg transition-all duration-200 ${
                  activeTab === "telemetry"
                    ? "bg-brand text-white shadow-md shadow-brand/15"
                    : "text-text-muted hover:text-text-main"
                }`}
              >
                Vitals
              </button>
            </div>
          </div>

          <div className="bg-sidebar/80 border border-border-subtle backdrop-blur-md rounded-3xl p-6 shadow-sm overflow-hidden h-[360px] flex flex-col">
            {activeTab === "activity" ? (
              <div className="overflow-y-auto pr-1 flex-1 space-y-4 custom-scrollbar">
                {activitiesLoading ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="flex gap-4 items-start p-3 bg-white/3 border border-white/5 rounded-2xl animate-pulse">
                      <div className="h-10 w-10 bg-white/10 rounded-xl" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 w-32 bg-white/10 rounded" />
                        <div className="h-3 w-48 bg-white/10 rounded" />
                      </div>
                    </div>
                  ))
                ) : activities.length > 0 ? (
                  activities.map((activity, i) => {
                    let badgeBg = "bg-green-500/10 text-green-400 border-green-500/20";
                    let Icon = LuPlus;
                    
                    if (activity.action === "update") {
                      badgeBg = "bg-blue-500/10 text-blue-400 border-blue-500/20";
                      Icon = LuPencil;
                    } else if (activity.action === "delete") {
                      badgeBg = "bg-red-500/10 text-red-400 border-red-500/20";
                      Icon = LuTrash;
                    }

                    return (
                      <div
                        key={activity._id || i}
                        className="flex gap-4 items-start p-3 hover:bg-white/3 border border-transparent hover:border-white/5 rounded-2xl transition-all duration-300 animate-in slide-in-from-right-3"
                      >
                        <div className={`p-2 rounded-xl border shrink-0 ${badgeBg}`}>
                          <Icon size={16} />
                        </div>
                        
                        <div className="min-w-0 flex-1">
                          <div className="flex justify-between items-start gap-2">
                            <span className="text-xs font-black uppercase tracking-widest text-text-main truncate">
                              {activity.action} problem
                            </span>
                            <span className="text-[10px] text-text-muted/60 flex items-center gap-1 font-bold whitespace-nowrap">
                              <LuClock size={10} />
                              {getRelativeTime(activity.timestamp)}
                            </span>
                          </div>
                          <p className="text-xs text-text-muted mt-1 leading-relaxed break-all font-medium">
                            {activity.details || `Problem "${activity.itemName}" was ${activity.action}d.`}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center text-text-muted py-12">
                    <LuActivity size={24} className="text-text-muted/40 mb-3 animate-pulse" />
                    <p className="text-xs font-black uppercase tracking-widest">Awaiting events</p>
                    <p className="text-[10px] mt-1 text-text-muted/60">No recent workspace actions captured.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col h-full overflow-hidden">
                {/* 5-Column Core Web Vitals Summary Row */}
                <div className="grid grid-cols-5 gap-1.5 mb-4 shrink-0">
                  {Object.keys(averages).map((metric) => {
                    const data = averages[metric];
                    const ratingColor =
                      data.rating === "good"
                        ? "text-green-400 border-green-500/20 bg-green-500/5"
                        : data.rating === "needs-improvement"
                          ? "text-yellow-400 border-yellow-500/20 bg-yellow-500/5"
                          : "text-red-400 border-red-500/20 bg-red-500/5";

                    return (
                      <div
                        key={metric}
                        className={`border rounded-xl p-2 text-center transition-all duration-300 ${ratingColor}`}
                      >
                        <div className="text-[8px] font-black uppercase opacity-65 tracking-wider">
                          {metric}
                        </div>
                        <div className="text-xs font-black mt-1 leading-none tracking-tight">
                          {data.value === 0 ? "—" : `${data.value}${metric === "CLS" ? "" : "ms"}`}
                        </div>
                        <div className="text-[7px] font-black uppercase mt-1 leading-none opacity-80 scale-90">
                          {data.rating || "good"}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Telemetry Log Feed */}
                <div className="overflow-y-auto pr-1 flex-1 space-y-2 custom-scrollbar">
                  {telemetryLoading ? (
                    [...Array(3)].map((_, i) => (
                      <div key={i} className="flex gap-4 items-start p-2.5 bg-white/3 border border-white/5 rounded-xl animate-pulse">
                        <div className="h-8 w-8 bg-white/10 rounded-lg" />
                        <div className="space-y-1.5 flex-1">
                          <div className="h-3 w-24 bg-white/10 rounded" />
                          <div className="h-2 w-36 bg-white/10 rounded" />
                        </div>
                      </div>
                    ))
                  ) : telemetryLogs.length > 0 ? (
                    telemetryLogs.map((log, i) => {
                      const ratingColor =
                        log.rating === "good"
                          ? "bg-green-500/10 text-green-400 border-green-500/20"
                          : log.rating === "needs-improvement"
                            ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                            : "bg-red-500/10 text-red-400 border-red-500/20";

                      return (
                        <div
                          key={log._id || i}
                          className="flex gap-3 items-center p-2 hover:bg-white/3 border border-transparent hover:border-white/5 rounded-xl transition-all duration-300 animate-in slide-in-from-right-3"
                        >
                          <div className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded border shrink-0 ${ratingColor}`}>
                            {log.metric}
                          </div>

                          <div className="min-w-0 flex-1 flex justify-between items-center">
                            <div>
                              <span className="text-[10px] font-black text-text-main">
                                {log.value}{log.metric === "CLS" ? "" : " ms"}
                              </span>
                              <span className="text-[8px] font-bold text-text-muted/65 uppercase tracking-wide ml-2">
                                rating: {log.rating}
                              </span>
                            </div>
                            <span className="text-[8px] text-text-muted/60 flex items-center gap-1 font-bold whitespace-nowrap">
                              <LuClock size={8} />
                              {getRelativeTime(log.timestamp)}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center text-text-muted py-6">
                      <LuActivity size={20} className="text-text-muted/40 mb-2 animate-pulse" />
                      <p className="text-[10px] font-black uppercase tracking-widest">Awaiting Vitals</p>
                      <p className="text-[8px] mt-1 text-text-muted/60">No Core Web Vitals telemetry received yet.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
