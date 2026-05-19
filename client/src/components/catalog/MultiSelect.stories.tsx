import React, { useState } from "react";
import MultiSelect from "../MultiSelect";

export default {
  title: "Catalog/MultiSelect",
  component: MultiSelect,
  decorators: [
    (Story: React.ComponentType) => (
      <div className="max-w-[300px] p-12 bg-sidebar rounded-3xl border border-border-subtle">
        <Story />
      </div>
    ),
  ],
};

const optionsList = [
  "Arrays",
  "Two Pointers",
  "Sliding Window",
  "Binary Search",
  "Depth First Search",
  "Breadth First Search",
];

export const EmptyState = () => {
  const [selected, setSelected] = useState<string[]>([]);
  return (
    <MultiSelect
      label="Sub-categories"
      options={optionsList}
      selected={selected}
      onChange={setSelected}
    />
  );
};

export const SingleSelected = () => {
  const [selected, setSelected] = useState<string[]>(["Arrays"]);
  return (
    <MultiSelect
      label="Sub-categories"
      options={optionsList}
      selected={selected}
      onChange={setSelected}
    />
  );
};

export const MultipleSelected = () => {
  const [selected, setSelected] = useState<string[]>([
    "Arrays",
    "Two Pointers",
    "Sliding Window",
  ]);
  return (
    <MultiSelect
      label="Sub-categories"
      options={optionsList}
      selected={selected}
      onChange={setSelected}
    />
  );
};
