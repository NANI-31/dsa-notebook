import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../app/store";
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../features/categories/categoriesSlice";
import {
  createTechnique,
  deleteTechnique,
} from "../../features/techniques/techniquesSlice";
import {
  LuPlus,
  LuTrash2,
  LuLightbulb,
  LuDatabase,
} from "react-icons/lu";
import { SettingSection } from "./SettingSection";

export const TaxonomySettings: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const categories = useSelector((state: RootState) => state.categories.list);
  const techniques = useSelector((state: RootState) => state.techniques.list);

  const [newCatName, setNewCatName] = useState("");
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [newSubName, setNewSubName] = useState("");
  const [newTechName, setNewTechName] = useState("");

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    dispatch(createCategory({ name: newCatName, subCategories: [] }));
    setNewCatName("");
  };

  const handleAddSubCategory = (catId: string) => {
    if (!newSubName.trim()) return;
    const category = categories.find((c) => c._id === catId);
    if (category) {
      const updatedSubs = [...category.subCategories, newSubName.trim()];
      dispatch(
        updateCategory({ id: catId, data: { subCategories: updatedSubs } }),
      );
      setNewSubName("");
    }
  };

  const handleRemoveSubCategory = (catId: string, sub: string) => {
    const category = categories.find((c) => c._id === catId);
    if (category) {
      const updatedSubs = category.subCategories.filter((s) => s !== sub);
      dispatch(
        updateCategory({ id: catId, data: { subCategories: updatedSubs } }),
      );
    }
  };

  const handleAddTechnique = () => {
    if (!newTechName.trim()) return;
    dispatch(createTechnique(newTechName.trim()));
    setNewTechName("");
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-6 duration-700">
      <SettingSection title="Taxonomy Infrastructure" icon={LuDatabase} fullWidth>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 md:gap-16">
          <div className="space-y-10">
            <div>
              <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] mb-6 px-4 italic opacity-40">
                Primary Categories
              </h3>
              <div className="space-y-2.5">
                {categories.map((cat) => (
                  <div
                    key={cat._id}
                    className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${selectedCatId === cat._id ? "bg-brand/5 border-brand text-brand shadow-lg" : "bg-white/5 border-transparent hover:border-border-subtle"}`}
                    onClick={() => setSelectedCatId(cat._id)}
                  >
                    <span className="font-bold text-sm uppercase tracking-widest">
                      {cat.name}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch(deleteCategory(cat._id));
                      }}
                      className="p-2.5 rounded-xl hover:bg-red-500/10 text-text-muted hover:text-red-400 transition-all active:scale-90"
                    >
                      <LuTrash2 size={18} />
                    </button>
                  </div>
                ))}
                <div className="flex items-center gap-3 mt-8 px-2">
                  <input
                    type="text"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="Provision new category..."
                    className="flex-1 bg-white/5 border-2 border-border-subtle rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-brand transition-all placeholder:text-text-muted/20"
                  />
                  <button
                    onClick={handleAddCategory}
                    className="p-4 bg-brand text-white rounded-2xl hover:opacity-90 transition-all shadow-xl shadow-brand/20 active:scale-95"
                  >
                    <LuPlus size={24} />
                  </button>
                </div>
              </div>
            </div>
            {selectedCatId && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] mb-6 px-4 italic opacity-40">
                  Sub Taxonomy for {categories.find((c) => c._id === selectedCatId)?.name}
                </h3>
                <div className="flex flex-wrap gap-3 px-2">
                  {categories
                    .find((c) => c._id === selectedCatId)
                    ?.subCategories.map((sub) => (
                      <div
                        key={sub}
                        className="flex items-center gap-3 bg-brand/5 border-2 border-brand/20 rounded-2xl px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-brand"
                      >
                        <span>{sub}</span>
                        <button
                          onClick={() =>
                            handleRemoveSubCategory(selectedCatId, sub)
                          }
                          className="text-brand/40 hover:text-red-400 transition-colors p-1"
                        >
                          <LuPlus size={16} className="rotate-45" />
                        </button>
                      </div>
                    ))}
                  <div className="flex items-center gap-3 mt-4 w-full">
                    <input
                      type="text"
                      value={newSubName}
                      onChange={(e) => setNewSubName(e.target.value)}
                      placeholder="Append sub-category..."
                      className="flex-1 bg-white/5 border-2 border-border-subtle rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-brand transition-all placeholder:text-text-muted/20"
                    />
                    <button
                      onClick={() => handleAddSubCategory(selectedCatId)}
                      className="p-4 bg-brand/10 text-brand rounded-2xl hover:bg-brand/20 transition-all border-2 border-brand/20 active:scale-95"
                    >
                      <LuPlus size={24} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div>
            <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] mb-6 px-4 italic opacity-40 flex items-center gap-2">
              <LuLightbulb size={16} className="text-brand" /> Patterns & Techniques
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {techniques.map((tech) => (
                  <div
                    key={tech._id}
                    className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border-2 border-transparent hover:border-border-subtle transition-all group shadow-sm"
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {tech.name}
                    </span>
                    <button
                      onClick={() => dispatch(deleteTechnique(tech._id))}
                      className="p-2 rounded-xl hover:bg-red-500/10 text-text-muted hover:text-red-400 opacity-20 group-hover:opacity-100 transition-all"
                    >
                      <LuTrash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3 mt-8 px-2">
                <input
                  type="text"
                  value={newTechName}
                  onChange={(e) => setNewTechName(e.target.value)}
                  placeholder="Define new technique..."
                  className="flex-1 bg-white/5 border-2 border-border-subtle rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-brand transition-all placeholder:text-text-muted/20"
                />
                <button
                  onClick={handleAddTechnique}
                  className="p-4 bg-brand text-white rounded-2xl hover:opacity-90 transition-all shadow-xl shadow-brand/20 active:scale-95"
                >
                  <LuPlus size={24} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </SettingSection>
    </div>
  );
};
