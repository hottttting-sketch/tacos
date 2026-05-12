import React from 'react';

export const TacosLogo = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 15L85 75H15L50 15Z" fill="#E21C26"/>
    <path d="M50 15L70 75H30L50 15Z" fill="#B9181F"/>
    <circle cx="50" cy="50" r="10" fill="white" fillOpacity="0.2"/>
  </svg>
);

export const PuddingLogo = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="25" y="45" width="50" height="35" rx="8" fill="#FFD93D"/>
    <path d="M25 45C25 35 75 35 75 45H25Z" fill="#8B4513"/>
    <circle cx="40" cy="60" r="4" fill="white" fillOpacity="0.3"/>
  </svg>
);

export const TempraLogo = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M30 70C30 70 40 30 70 30" stroke="#FFB74D" strokeWidth="12" strokeLinecap="round"/>
    <path d="M70 30L85 15M70 30L85 45" stroke="#FFB74D" strokeWidth="8" strokeLinecap="round"/>
    <circle cx="50" cy="50" r="8" fill="#FFB74D" fillOpacity="0.5"/>
  </svg>
);
