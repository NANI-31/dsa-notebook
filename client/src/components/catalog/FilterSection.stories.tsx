import React, { useState } from "react";
import FilterSection from "./FilterSection";

export default {
  title: "Catalog/FilterSection",
  component: FilterSection,
  decorators: [
    (Story: React.ComponentType) => (
      <div className="max-w-[800px] p-6 bg-app-bg">
        <Story />
      </div>
    ),
  ],
};

const subCategoriesList = ["Arrays", "Sliding Window", "Binary Search", "Two Pointers"];
const difficultiesList = ["Easy", "Medium", "Hard"];
const techniquesList = ["Two Pointers", "Sliding Window", "Dynamic Programming"];

export const ActiveState = () => {
  const [search, setSearch] = useState("Two Sum");
  const [selectedSubs, setSelectedSubs] = useState<string[]>(["Arrays"]);
  const [selectedDiffs, setSelectedDiffs] = useState<string[]>(["Easy"]);
  const [selectedTechs, setSelectedTechs] = useState<string[]>([]);

  const resetFilters = () => {
    setSearch("");
    setSelectedSubs([]);
    setSelectedDiffs([]);
    setSelectedTechs([]);
  };

  return (
    <FilterSection
      search={search}
      onSearchChange={setSearch}
      selectedSubCategories={selectedSubs}
      onSubCategoriesChange={setSelectedSubs}
      selectedDifficulties={selectedDiffs}
      onDifficultiesChange={setSelectedDiffs}
      selectedTechniques={selectedTechs}
      onTechniquesChange={setSelectedTechs}
      subCategoriesOptions={subCategoriesList}
      difficultyOptions={difficultiesList}
      techniquesOptions={techniquesList}
      resetFilters={resetFilters}
      isFilterActive={true}
    />
  );
};

export const InactiveState = () => {
  const [search, setSearch] = useState("");
  const [selectedSubs, setSelectedSubs] = useState<string[]>([]);
  const [selectedDiffs, setSelectedDiffs] = useState<string[]>([]);
  const [selectedTechs, setSelectedTechs] = useState<string[]>([]);

  const resetFilters = () => {
    setSearch("");
    setSelectedSubs([]);
    setSelectedDiffs([]);
    setSelectedTechs([]);
  };

  return (
    <FilterSection
      search={search}
      onSearchChange={setSearch}
      selectedSubCategories={selectedSubs}
      onSubCategoriesChange={setSelectedSubs}
      selectedDifficulties={selectedDiffs}
      onDifficultiesChange={setSelectedDiffs}
      selectedTechniques={selectedTechs}
      onTechniquesChange={setSelectedTechs}
      subCategoriesOptions={subCategoriesList}
      difficultyOptions={difficultiesList}
      techniquesOptions={techniquesList}
      resetFilters={resetFilters}
      isFilterActive={false}
    />
  );
};
