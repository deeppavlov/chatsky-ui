import React from 'react';

const BasicConditionIcon = ({ className }: React.SVGAttributes<SVGSVGElement>) => {
  return (
    <svg
      className={className}
      width="19"
      height="19"
      viewBox="0 0 19 19"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1 17.5L9 9.5M9 3.5L8 2.5M15 3.5L16 2.5M15 9.5L16 10.5M7.5 6.5H6M12 2.5V1M16.5 6.5H18M12 10.5V12M12 6L11.5 6.5L12 7L12.5 6.5L12 6ZM12.7071 7.29289L12.7929 7.20711C13.1834 6.81658 13.1834 6.18342 12.7929 5.79289L12.7071 5.70711C12.3166 5.31658 11.6834 5.31658 11.2929 5.70711L11.2071 5.79289C10.8166 6.18342 10.8166 6.81658 11.2071 7.20711L11.2929 7.29289C11.6834 7.68342 12.3166 7.68342 12.7071 7.29289Z"
        stroke="#8D96B5"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default BasicConditionIcon;
