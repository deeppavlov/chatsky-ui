import React from "react";
import { SVGElementInterface } from "../../types/components";

export const PlusSquare = ({ className }: SVGElementInterface) => {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M1.98544 4.52209C1.81315 5.38351 1.75 6.50956 1.75 8C1.75 9.49044 1.81315 10.6165 1.98544 11.4779C2.15613 12.3314 2.42182 12.8612 2.78033 13.2197C3.13884 13.5782 3.66862 13.8439 4.52209 14.0146C5.38351 14.1868 6.50956 14.25 8 14.25C9.49044 14.25 10.6165 14.1868 11.4779 14.0146C12.3314 13.8439 12.8612 13.5782 13.2197 13.2197C13.5782 12.8612 13.8439 12.3314 14.0146 11.4779C14.1868 10.6165 14.25 9.49044 14.25 8C14.25 6.50956 14.1868 5.38351 14.0146 4.52209C13.8439 3.66862 13.5782 3.13884 13.2197 2.78033C12.8612 2.42182 12.3314 2.15613 11.4779 1.98544C10.6165 1.81315 9.49044 1.75 8 1.75C6.50956 1.75 5.38351 1.81315 4.52209 1.98544C3.66862 2.15613 3.13884 2.42182 2.78033 2.78033C2.42182 3.13884 2.15613 3.66862 1.98544 4.52209ZM4.22791 0.514564C5.24149 0.311848 6.49044 0.25 8 0.25C9.50956 0.25 10.7585 0.311848 11.7721 0.514564C12.7936 0.718871 13.6388 1.07818 14.2803 1.71967C14.9218 2.36116 15.2811 3.20638 15.4854 4.22791C15.6882 5.24149 15.75 6.49044 15.75 8C15.75 9.50956 15.6882 10.7585 15.4854 11.7721C15.2811 12.7936 14.9218 13.6388 14.2803 14.2803C13.6388 14.9218 12.7936 15.2811 11.7721 15.4854C10.7585 15.6882 9.50956 15.75 8 15.75C6.49044 15.75 5.24149 15.6882 4.22791 15.4854C3.20638 15.2811 2.36116 14.9218 1.71967 14.2803C1.07818 13.6388 0.718871 12.7936 0.514564 11.7721C0.311848 10.7585 0.25 9.50956 0.25 8C0.25 6.49044 0.311848 5.24149 0.514564 4.22791C0.718871 3.20638 1.07818 2.36116 1.71967 1.71967C2.36116 1.07818 3.20638 0.718871 4.22791 0.514564ZM7.25 7.25V4H8.75V7.25H12V8.75H8.75V12H7.25V8.75H4V7.25H7.25Z"
      />
    </svg>
  );
};
