"use client"

import { Command } from "@/types/commands"
import { ColumnDef } from "@tanstack/react-table"


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
