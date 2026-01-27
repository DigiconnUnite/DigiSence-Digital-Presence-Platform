"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardSkeletonProps {
  role: "SUPER_ADMIN" | "BUSINESS_ADMIN" | "PROFESSIONAL_ADMIN";
}

export default function DashboardSkeleton({ role }: DashboardSkeletonProps) {
  return (
    <div className="min-h-screen flex flex-col w-full">
       {/* Skeleton Header */}
       <div className="bg-white border border-gray-200 shadow-sm h-16 mb-4">
         <div className="flex justify-between items-center px-4 h-full">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-6 w-32" />
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Skeleton className="h-8 w-24 rounded-2xl hidden sm:flex" />
              <Skeleton className="h-8 w-8 rounded-2xl" />
            </div>
         </div>
       </div>

       {/* Skeleton Main Layout */}
       <div className="flex flex-1 gap-4 px-4 pb-20 overflow-hidden">
         {/* Skeleton Sidebar */}
         <div className="w-64 bg-white border border-gray-200 rounded-3xl hidden md:flex flex-col">
            <div className="p-4 border-b border-gray-200 h-16">
                 <Skeleton className="h-6 w-24" />
            </div>
            <div className="flex-1 p-4 space-y-3">
               {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                     <Skeleton className="h-5 w-5 rounded" />
                     <Skeleton className="h-4 w-32" />
                  </div>
               ))}
            </div>
         </div>

         {/* Skeleton Content */}
         <div className="flex-1 bg-white/50 backdrop-blur-xl border border-gray-200 rounded-3xl p-6 overflow-hidden">
            <div className="space-y-6">
              <Skeleton className="h-8 w-64 mb-2" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                 {Array.from({ length: 4 }).map((_, i) => (
                   <div key={i} className="bg-white border border-gray-200 p-6 rounded-3xl">
                     <Skeleton className="h-4 w-24 mb-4" />
                     <Skeleton className="h-8 w-16 mb-2" />
                     <Skeleton className="h-3 w-32" />
                   </div>
                 ))}
              </div>
              
              {/* Table Skeleton */}
              <div className="bg-white border border-gray-200 rounded-3xl p-6 mt-8">
                 <div className="flex space-x-4 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                       <Skeleton key={i} className="h-4 w-32" />
                    ))}
                 </div>
                 <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                       <div key={i} className="flex space-x-4">
                         <Skeleton className="h-4 w-12" />
                         <Skeleton className="h-4 w-32" />
                         <Skeleton className="h-4 w-24" />
                         <Skeleton className="h-6 w-20 rounded-full" />
                       </div>
                    ))}
                 </div>
              </div>
            </div>
         </div>
       </div>
    </div>
  );
}