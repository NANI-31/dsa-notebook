import React from 'react';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  title?: string;
  isGap?: boolean;
}

const BaseSVG: React.FC<IconProps> = ({ 
  children, 
  size = 24, 
  className, 
  title, 
  isGap, 
  ...props 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`ds-svg-icon ${isGap ? 'ds-svg-gap' : ''} ${className || ''}`}
    aria-hidden={!title}
    role={title ? "img" : "presentation"}
    {...props}
  >
    {title && <title>{title}</title>}
    <g className="ds-icon-glow-group">
      {children}
    </g>
  </svg>
);

export const ArrayIcon: React.FC<IconProps> = (props) => (
  <BaseSVG title="Array Data Structure" {...props}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18M3 15h18" />
  </BaseSVG>
);

export const StringIcon: React.FC<IconProps> = (props) => (
  <BaseSVG title="String Data Structure" {...props}>
    <path d="M17 5H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z" />
    <path d="M12 9v6M9 12h6" className="ds-icon-detail" />
  </BaseSVG>
);

export const LinkedListIcon: React.FC<IconProps> = (props) => (
  <BaseSVG title="Linked List Data Structure" {...props}>
    <circle cx="5" cy="12" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="19" cy="12" r="2" />
    <path d="M7 12h3M14 12h3" />
  </BaseSVG>
);

export const StackIcon: React.FC<IconProps> = (props) => (
  <BaseSVG title="Stack Data Structure" {...props}>
    <path d="m2 17 10 5 10-5M2 12l10 5 10-5M12 2 2 7l10 5 10-5-10-5Z" />
  </BaseSVG>
);

export const QueueIcon: React.FC<IconProps> = (props) => (
  <BaseSVG title="Queue Data Structure" {...props}>
    <path d="M21 12H3M21 12l-4-4M21 12l-4 4" />
    <rect x="3" y="10" width="4" height="4" rx="1" />
    <rect x="10" y="10" width="4" height="4" rx="1" />
  </BaseSVG>
);

export const DequeIcon: React.FC<IconProps> = (props) => (
  <BaseSVG title="Deque Data Structure" {...props}>
    <path d="M21 12H3M21 12l-4-4M21 12l-4 4M3 12l4-4M3 12l4 4" />
    <rect x="10" y="10" width="4" height="4" rx="1" />
  </BaseSVG>
);

export const TreeIcon: React.FC<IconProps> = (props) => (
  <BaseSVG title="Tree Data Structure" {...props}>
    <circle cx="12" cy="5" r="3" />
    <circle cx="6" cy="15" r="3" />
    <circle cx="18" cy="15" r="3" />
    <path d="M10 8l-2 4M14 8l2 4" />
  </BaseSVG>
);

export const BinaryTreeIcon: React.FC<IconProps> = (props) => (
  <BaseSVG title="Binary Tree Data Structure" {...props}>
    <circle cx="12" cy="7" r="2" />
    <circle cx="8" cy="13" r="2" />
    <circle cx="16" cy="13" r="2" />
    <circle cx="6" cy="19" r="2" />
    <circle cx="10" cy="19" r="2" />
    <path d="M11 9l-2 3M13 9l2 3M7 15l-1 2M9 15l1 2" />
  </BaseSVG>
);

export const BSTIcon: React.FC<IconProps> = (props) => (
  <BaseSVG title="Binary Search Tree" {...props}>
    <circle cx="12" cy="5" r="2" />
    <circle cx="7" cy="10" r="2" />
    <circle cx="17" cy="10" r="2" />
    <path d="m11 7-2 2m6-2 2 2M12 14v6m-3-3h6" />
  </BaseSVG>
);

export const HeapIcon: React.FC<IconProps> = (props) => (
  <BaseSVG title="Heap Data Structure" {...props}>
    <path d="M12 3L4 12h16L12 3z" />
    <circle cx="12" cy="9" r="2" />
    <path d="M12 11v5M8 17l8-8" />
  </BaseSVG>
);

export const GraphIcon: React.FC<IconProps> = (props) => (
  <BaseSVG title="Graph Data Structure" {...props}>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="9" r="3" />
    <circle cx="18" cy="19" r="3" />
    <path d="M9 10l6-3M9 12l6 5M18 8v8" />
  </BaseSVG>
);

export const TrieIcon: React.FC<IconProps> = (props) => (
  <BaseSVG title="Trie Data Structure" {...props}>
    <circle cx="12" cy="3" r="2" />
    <path d="M12 5v4M12 13v4M12 21v1M8 11l8-4M8 7l8 4" />
    <circle cx="12" cy="11" r="2" />
    <circle cx="12" cy="19" r="2" />
  </BaseSVG>
);

// --- Algorithms Icons ---

export const SortingIcon: React.FC<IconProps> = (props) => (
  <BaseSVG title="Sorting Algorithm" {...props}>
    <path d="M11 5h10M11 9h7M11 13h4M11 17h10" />
    <path d="m3 17 3 3 3-3M6 18V4" className="ds-icon-detail" />
  </BaseSVG>
);

export const SearchingIcon: React.FC<IconProps> = (props) => (
  <BaseSVG title="Searching Algorithm" {...props}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
    <path d="M8 11h6" className="ds-icon-detail" />
  </BaseSVG>
);

export const RecursionIcon: React.FC<IconProps> = (props) => (
  <BaseSVG title="Recursion / Iteration" {...props}>
    <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M12 7a5 5 0 1 0 5 5" className="ds-icon-detail" />
  </BaseSVG>
);

export const DynamicProgrammingIcon: React.FC<IconProps> = (props) => (
  <BaseSVG title="Dynamic Programming" {...props}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
    <circle cx="6" cy="6" r="1" fill="currentColor" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
    <circle cx="18" cy="18" r="1" fill="currentColor" />
  </BaseSVG>
);

export const BacktrackingIcon: React.FC<IconProps> = (props) => (
  <BaseSVG title="Backtracking Algorithm" {...props}>
    <path d="M9 14 4 9l5-5" />
    <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11" />
  </BaseSVG>
);

export const GreedyIcon: React.FC<IconProps> = (props) => (
  <BaseSVG title="Greedy Approach" {...props}>
    <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 8l4 4-4 4" />
    <path d="M8 12h8" />
  </BaseSVG>
);

export const DivideAndConquerIcon: React.FC<IconProps> = (props) => (
  <BaseSVG title="Divide and Conquer" {...props}>
    <path d="M20 7h-9m0 0H2m9 0V2m0 5v15" />
    <path d="m16 4 4 3-4 3M6 10l-4-3 4-3" className="ds-icon-detail" />
  </BaseSVG>
);
