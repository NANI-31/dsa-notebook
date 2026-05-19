import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import SectionHeader from './SectionHeader';

import { useProblemDetails } from '../../context/ProblemDetailsContext';

const ProblemDescription: React.FC = () => {
  const { problem } = useProblemDetails();
  const description = problem?.description || "";
  return (
    <section className="animate-in slide-in-from-bottom-6 duration-700">
      <SectionHeader title="Description" colorClass="bg-brand" />
      <div className="bg-sidebar/40 border border-white/15 p-card-padding rounded-3xl shadow-sm">
        <div className="max-w-none prose prose-invert prose-brand prose-headings:font-black prose-p:font-medium text-text-main/80 leading-relaxed">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {description}
          </ReactMarkdown>
        </div>
      </div>
    </section>
  );
};

export default ProblemDescription;
