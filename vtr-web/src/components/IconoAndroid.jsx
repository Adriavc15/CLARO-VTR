import React from 'react'

export default function IconoAndroid({ size = 24, className = '' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="2.2 6 19.6 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M6.7 11.2 3.7 8.2" />
      <path d="M17.3 11.2 20.3 8.2" />
      <path d="M4.5 16.5a7.5 7.5 0 0 1 15 0Z" />
      <circle cx="9.5" cy="13.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="13.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}