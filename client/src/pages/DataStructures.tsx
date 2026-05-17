import React, { useEffect, useState, useMemo, Suspense, useRef, lazy } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../app/store";
import { fetchTaxonomyStats } from "../features/categories/categoriesSlice";
import { getIcon, prefetchIcons } from "../components/IconLoader";
import { BarChart, Bar, XAxis, Cell, ResponsiveContainer } from "recharts";

import { 
  LuDatabase,
  LuChevronRight,
  LuPlus,
  LuLoader
} from "react-icons/lu";

const ProblemExplorer = lazy(() => import("../components/ProblemExplorer"));

const MasteryOverlay: React.FC<{ ds: any; active: boolean }> = ({ ds, active }) => {
  const data = useMemo(() => {
    if (!ds.difficulties) return [];
    return [
      { name: "Easy", count: ds.difficulties.Easy, color: "#10b981" },
      { name: "Med", count: ds.difficulties.Medium, color: "#f59e0b" },
      { name: "Hard", count: ds.difficulties.Hard, color: "#ef4444" },
    ];
  }, [ds.difficulties]);

  if (!active || ds.count === 0) return null;

  return (
    <div className="absolute inset-0 z-20 bg-sidebar/95 backdrop-blur-sm p-6 flex flex-col justify-center animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-4">
         <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Mastery Status</span>
         <span className="text-xs font-bold text-brand">{ds.count} Total</span>
      </div>
      <div className="h-32 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={9} stroke="var(--text-muted)" dy={5} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={20}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const MagneticCard: React.FC<{
  ds: any;
  onClick: () => void;
}> = ({ ds, onClick }) => {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  
  // Observability: Dwell Time Tracking
  const hoverStartTime = useRef<number | null>(null);

  const trackInteraction = (type: 'hover' | 'click' | 'dwell', metadata?: any) => {
    const logPrefix = `[Telemetry] ${type.toUpperCase()}`;
    const payload = {
      category: ds.name,
      timestamp: new Date().toISOString(),
      ...metadata
    };
    
    if (type === 'dwell') {
      console.log(`${logPrefix} engagement_dwell_time: ${metadata.duration}ms | category: ${ds.name}`);
    } else {
      console.log(`${logPrefix} on ${ds.name} | ${JSON.stringify(payload)}`);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const rotateX = (centerY - e.clientY) / 10;
    const rotateY = (e.clientX - centerX) / 10;
    
    const mx = (e.clientX - centerX) / 15;
    const my = (e.clientY - centerY) / 15;

    setRotate({ x: rotateX, y: rotateY });
    setMousePos({ x: mx, y: my });
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
    hoverStartTime.current = performance.now();
    trackInteraction('hover');
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    if (hoverStartTime.current) {
      const duration = Math.round(performance.now() - hoverStartTime.current);
      trackInteraction('dwell', { duration });
      hoverStartTime.current = null;
    }
    setRotate({ x: 0, y: 0 });
    setMousePos({ x: 0, y: 0 });
  };

  // Icon Registry Integration
  const IconComponent = useMemo(() => getIcon(ds.name), [ds.name]);

  return (
    <div
      onClick={() => { trackInteraction('click'); onClick(); }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group relative bg-sidebar border border-border-subtle p-8 rounded-4xl hover:border-brand/40 transition-all duration-500 cursor-pointer shadow-sm hover:shadow-2xl hover:shadow-brand/5 flex flex-col justify-between min-h-[220px] overflow-hidden"
      style={{
        perspective: "1000px",
        transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
        transition: isHovering ? "none" : "transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1), border-color 0.3s ease"
      }}
    >
      {/* Mastery Dashboard Overlay */}
      <MasteryOverlay ds={ds} active={isHovering} />

      {/* Decorative background element with Magnetic Parallax */}
      <div 
        className="absolute -right-4 -bottom-4 text-brand/5 transition-transform duration-300 pointer-events-none"
        style={{
          transform: isHovering 
            ? `translate(${mousePos.x * 2}px, ${mousePos.y * 2}px) scale(1.6) rotate(${rotate.y * 0.5}deg)` 
            : `translate(0, 0) scale(1) rotate(12deg)`
        }}
      >
        <Suspense fallback={<div className="w-[140px] h-[140px]" />}>
          {IconComponent && <IconComponent size={140} isGap={ds.count === 0} />}
        </Suspense>
      </div>

      <div className="relative z-10 flex justify-between items-start">
        <div 
          className="p-4 bg-brand/10 text-brand rounded-2xl transition-all duration-500 group-hover:bg-brand group-hover:text-white group-hover:scale-110 shadow-lg shadow-brand/0 group-hover:shadow-brand/20"
          style={{
            transform: `translate(${mousePos.x}px, ${mousePos.y}px)`
          }}
        >
          <Suspense fallback={<div className="w-6 h-6" />}>
            {IconComponent && <IconComponent size={24} isGap={ds.count === 0} />}
          </Suspense>
        </div>
        {ds.count === 0 ? (
          <span className="text-[10px] font-black uppercase tracking-widest text-red-400 bg-red-400/10 px-3 py-1.5 rounded-full border border-red-400/20">
            Gap
          </span>
        ) : (
          <div className="flex flex-col items-end">
            <span className="text-3xl font-black text-text-main tracking-tighter">
              {ds.count}
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-text-muted/60">
              Problems
            </span>
          </div>
        )}
      </div>

      <div className="relative z-10">
        <h3 className="text-2xl font-black text-text-main tracking-tight mb-2 group-hover:text-brand transition-colors">
          {ds.name}
        </h3>
        <div className="flex items-center gap-2 text-xs font-bold text-text-muted group-hover:text-brand/80 transition-all">
          <span>Explore Mastery</span>
          <LuChevronRight size={14} className="transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </div>
  );
};

const DataStructures: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeDS = searchParams.get("view");
  
  const { taxonomyStats, status } = useSelector((state: RootState) => state.categories);

  const dsStats = useMemo(() => {
    const dsCategory = taxonomyStats.find(c => c.name === "Data Structures");
    return dsCategory ? dsCategory.subCategories : [];
  }, [taxonomyStats]);

  useEffect(() => {
    dispatch(fetchTaxonomyStats());
  }, [dispatch]);

  // Performance: Refined Priority Prefetching
  useEffect(() => {
    if (dsStats.length > 0) {
      const sortedStats = [...dsStats].sort((a, b) => b.count - a.count);
      const topCategoryNames = sortedStats.slice(0, 5).map(c => c.name);
      prefetchIcons(topCategoryNames);
    }
  }, [dsStats]);

  const handleCardClick = (name: string) => {
    setSearchParams({ view: name });
  };

  const handleBack = () => {
    setSearchParams({});
  };

  const loading = status === "loading" && taxonomyStats.length === 0;

  if (activeDS) {
    return (
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
           <LuLoader className="animate-spin text-brand" size={40} />
           <p className="text-text-muted font-medium">Priming problem library...</p>
        </div>
      }>
        <ProblemExplorer 
          categoryName="Data Structures" 
          subCategory={activeDS} 
          onBack={handleBack} 
        />
      </Suspense>
    );
  }

  if (loading) {
// ... existing loading UI
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="h-10 w-64 bg-sidebar-bg/50 rounded-2xl animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="h-48 bg-sidebar-bg/30 border border-border-subtle rounded-3xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight text-text-main">
            Data Structures
          </h1>
          <p className="text-text-muted font-medium max-w-2xl text-balance">
            The foundation of computer science. Explore your mastery across fundamental organizational patterns and abstract types.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => handleCardClick("All")}
            className="bg-brand hover:opacity-90 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-bold transition-all shadow-lg shadow-brand/20 active:scale-95 whitespace-nowrap"
          >
            <LuPlus size={20} />
            <span>Add Problem</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {dsStats.map((ds) => (
          <MagneticCard 
            key={ds.name} 
            ds={ds} 
            onClick={() => handleCardClick(ds.name)} 
          />
        ))}
      </div>

      {dsStats.length === 0 && status !== "loading" && (
        <div className="bg-sidebar border border-dashed border-border-subtle p-12 rounded-4xl flex flex-col items-center text-center space-y-4 shadow-inner">
          <div className="bg-brand/5 p-6 rounded-full text-brand/40 animate-pulse">
            <LuDatabase size={48} />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-text-main">No Data Structures Found</h3>
            <p className="text-text-muted max-w-sm">
              We couldn't find any data structure categories. Try resetting your database or adding them manually in Taxonomy.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataStructures;
