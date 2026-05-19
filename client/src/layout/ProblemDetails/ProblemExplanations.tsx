import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import SectionHeader from './SectionHeader';

import { useProblemDetails } from '../../context/ProblemDetailsContext';

const ProblemExplanations: React.FC = () => {
  const { problem } = useProblemDetails();
  const explanation = problem?.explanation || "";
  const notes = problem?.notes || "";
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 md:gap-20">
      <section>
        <SectionHeader
          title="Execution Strategy"
          colorClass="bg-accent-strategy"
        />
        <div className="bg-sidebar border border-border-subtle p-card-padding rounded-3xl shadow-sm h-full">
          <div className="max-w-none prose prose-invert prose-blue prose-p:font-medium text-text-main/80 leading-relaxed italic md:text-lg">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {explanation || "*No strategy provided.*"}
            </ReactMarkdown>
          </div>
        </div>
      </section>

      <section>
        <SectionHeader
          title="Post-Mortem Notes"
          colorClass="bg-accent-notes"
        />
        <div className="bg-sidebar border border-border-subtle p-card-padding rounded-3xl shadow-sm h-full">
          <div className="max-w-none prose prose-invert prose-slate prose-p:font-medium text-text-main/80 leading-relaxed md:text-lg">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {notes || "*Initialization notes.*"}
            </ReactMarkdown>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProblemExplanations;
