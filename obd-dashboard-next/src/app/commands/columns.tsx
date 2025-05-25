"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Command } from "../hooks/useOBD"

export const columns: ColumnDef<Command>[] = [
  {
    accessorKey: "name",
    header: "Commands",
  },
  {
    accessorKey: "value",
    header: "",
    cell: ({ row }) => <div className="text-right font-medium">{row.getValue('value')}</div>
  }
]
