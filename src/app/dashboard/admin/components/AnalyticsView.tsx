import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Building, Search, TrendingUp, User, UserCheck } from "lucide-react";
import type { AdminStats, Business, Professional } from "../types";

interface AnalyticsViewProps {
  stats: AdminStats;
  businesses: Business[];
  professionals: Professional[];
  registrationInquiries: any[];
  searchTerm: string;
}

export default function AnalyticsView({
  stats,
  businesses,
  professionals,
  registrationInquiries,
  searchTerm,
}: AnalyticsViewProps) {
  const normalizedSearch = searchTerm.trim().toLowerCase();

  const matchingCounts = useMemo(() => {
    if (!normalizedSearch) {
      return {
        businesses: businesses.length,
        professionals: professionals.length,
        registrations: registrationInquiries.length,
      };
    }

    return {
      businesses: businesses.filter((business) => {
        return (
          business.name.toLowerCase().includes(normalizedSearch) ||
          business.admin.email.toLowerCase().includes(normalizedSearch) ||
          business.category?.name.toLowerCase().includes(normalizedSearch)
        );
      }).length,
      professionals: professionals.filter((professional) => {
        return (
          professional.name.toLowerCase().includes(normalizedSearch) ||
          professional.admin.email.toLowerCase().includes(normalizedSearch) ||
          professional.professionalHeadline?.toLowerCase().includes(normalizedSearch)
        );
      }).length,
      registrations: registrationInquiries.filter((inquiry) => {
        return (
          inquiry.name?.toLowerCase().includes(normalizedSearch) ||
          inquiry.email?.toLowerCase().includes(normalizedSearch) ||
          inquiry.businessName?.toLowerCase().includes(normalizedSearch)
        );
      }).length,
    };
  }, [businesses, professionals, registrationInquiries, normalizedSearch]);

  const activeBusinessRate = stats.totalBusinesses > 0
    ? Math.round((stats.activeBusinesses / stats.totalBusinesses) * 100)
    : 0;
  const activeProfessionalRate = stats.totalProfessionals > 0
    ? Math.round((stats.activeProfessionals / stats.totalProfessionals) * 100)
    : 0;

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="mb-8">
        <h1 className="text-lg font-bold text-gray-900">Platform Analytics</h1>
        <p className="text-md text-gray-600">Detailed analytics and insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="bg-white border border-gray-200 shadow-sm rounded-3xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900">Businesses</CardTitle>
            <Building className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.totalBusinesses}</div>
            <p className="mt-1 text-xs text-gray-500">{activeBusinessRate}% are active</p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm rounded-3xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900">Professionals</CardTitle>
            <User className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.totalProfessionals}</div>
            <p className="mt-1 text-xs text-gray-500">{activeProfessionalRate}% are active</p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm rounded-3xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900">Requests</CardTitle>
            <UserCheck className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.totalInquiries}</div>
            <p className="mt-1 text-xs text-gray-500">Registration and contact traffic</p>
          </CardContent>
        </Card>

        <Card className="bg-[#080322] text-white border-none shadow-sm rounded-3xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/90">Search Signal</CardTitle>
            <Search className="h-4 w-4 text-white/70" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{matchingCounts.businesses + matchingCounts.professionals + matchingCounts.registrations}</div>
            <p className="mt-1 text-xs text-white/70">
              {normalizedSearch ? `Matches for "${searchTerm}"` : "All dashboard records"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="bg-white border border-gray-200 shadow-sm rounded-3xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900">Platform Health</CardTitle>
            <Activity className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl bg-gray-50 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Active businesses</span>
                <span className="font-semibold text-gray-900">{stats.activeBusinesses}</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-gray-200">
                <div className="h-2 rounded-full bg-[#080322]" style={{ width: `${activeBusinessRate}%` }} />
              </div>
            </div>
            <div className="rounded-2xl bg-gray-50 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Active professionals</span>
                <span className="font-semibold text-gray-900">{stats.activeProfessionals}</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-gray-200">
                <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${activeProfessionalRate}%` }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm rounded-3xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900">Operational Overview</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-500">Search matches</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">{matchingCounts.businesses + matchingCounts.professionals + matchingCounts.registrations}</p>
              </div>
              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-500">Pending requests</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">{stats.totalInquiries}</p>
              </div>
            </div>
            <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/60 p-4 text-sm text-gray-600">
              {normalizedSearch
                ? `The header search is filtering what you see in the dashboard and highlighting ${matchingCounts.businesses + matchingCounts.professionals + matchingCounts.registrations} matching records.`
                : "The dashboard search bar is active and ready to filter the current admin view."}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
