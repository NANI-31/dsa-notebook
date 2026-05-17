import React from 'react';

import { useProblemDetails } from '../../context/ProblemDetailsContext';

const ProblemFooter: React.FC = () => {
  const { problem } = useProblemDetails();
  
  if (!problem) return null;

  return (
    <footer className="pt-12 border-t border-border-subtle/20 flex flex-col md:flex-row md:items-center justify-between gap-6 opacity-40">
      <p className="text-[9px] text-text-muted tracking-[0.3em] font-black uppercase">
        Object ID: {problem._id}
      </p>
      <p className="text-[9px] text-text-muted tracking-[0.3em] font-black uppercase">
        Logged into ledger on {problem.addedDate}
      </p>
    </footer>
  );
};

export default ProblemFooter;
