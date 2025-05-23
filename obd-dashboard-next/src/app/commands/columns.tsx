"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Command } from "../hooks/useOBD"

export const columns: ColumnDef<Command>[] = [
  {
    accessorKey: "pid",
    header: () => "PID",
  },
  {
    accessorKey: "value",
    header: "Value"
  }
]
