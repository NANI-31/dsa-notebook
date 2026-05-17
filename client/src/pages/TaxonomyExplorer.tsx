import React, { useEffect, useState } from "react";
import api from "../services/api";
import { LuDatabase, LuWorkflow, LuPlus, LuInfo } from "react-icons/lu";

interface SubCategoryStat {
  name: string;
  count: number;
}

interface CategoryStat {
  id: string;
  name: string;
  subCategories: SubCategoryStat[];
  totalCount: number;
}

const TaxonomyExplorer: React.FC = () => {
  const [stats, setStats] = useState<CategoryStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/categories/stats");
        setStats(response.data);
      } catch (err: any) {
        setError(err.message || "Failed to load taxonomy stats");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-400 flex items-center gap-2">
        <LuPlus className="rotate-45" size={20} />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-3xl font-bold text-text-main mb-2">
          Taxonomy Explorer
        </h1>
        <p className="text-text-muted">
          Analyze and manage your problem collections across Data Structures and
          Algorithms.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {stats.map((cat) => (
          <div
            key={cat.id}
            className="group relative rounded-3xl border border-border-subtle bg-sidebar-bg/40 backdrop-blur-xl p-8 hover:border-brand/40 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-brand/10 text-brand">
                  {cat.name.includes("Data") ? (
                    <LuDatabase size={24} />
                  ) : (
                    <LuWorkflow size={24} />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-text-main">
                    {cat.name}
                  </h2>
                  <span className="text-sm text-text-muted">
                    {cat.totalCount} problems total
                  </span>
                </div>
              </div>
              <button className="p-2 rounded-xl bg-white/5 hover:bg-brand/10 text-text-muted hover:text-brand transition-colors">
                <LuPlus size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {cat.subCategories.map((sub) => (
                <div
                  key={sub.name}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 ${
                    sub.count === 0
                      ? "bg-red-500/5 border-red-500/20 opacity-60 grayscale-[0.5]"
                      : "bg-white/5 border-transparent hover:border-border-subtle"
                  }`}
                >
                  <span className="text-sm font-medium text-text-main">
                    {sub.name}
                  </span>
                  <div className="flex items-center gap-2">
                    {sub.count === 0 ? (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full">
                        Gap
                      </span>
                    ) : (
                      <span className="text-sm font-mono text-brand bg-brand/10 px-2 py-0.5 rounded-lg">
                        {sub.count}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-brand/5 border border-brand/10 p-6 flex items-start gap-4">
        <div className="p-2 rounded-lg bg-brand text-white">
          <LuInfo size={20} />
        </div>
        <div>
          <h3 className="font-bold text-text-main">Hierarchy Insights</h3>
          <p className="text-sm text-text-muted mt-1">
            Categories highlighted as <span className="text-red-400">Gap</span> have no problems associated with them. Consider adding problems for these sub-categories to maintain a balanced collection.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TaxonomyExplorer;
