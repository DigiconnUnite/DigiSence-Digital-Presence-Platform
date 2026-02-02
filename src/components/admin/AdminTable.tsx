"use client"

import { ReactNode } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface AdminTableProps {
  title: string
  children: ReactNode
  className?: string
  showHeader?: boolean
}

export function AdminTable({
  title,
  children,
  className,
  showHeader = true,
}: AdminTableProps) {
  return (
    <div className={`bg-white rounded-md  overflow-hidden ${className || ""}`}>
      {showHeader && (
        <div className="bg-[#080322] px-4 sm:px-6 py-3 sm:py-4">
          <h2 className="text-white text-base sm:text-lg font-semibold">{title}</h2>
        </div>
      )}
      <div className="overflow-x-auto">
        <Table>{children}</Table>
      </div>
    </div>
  )
}
