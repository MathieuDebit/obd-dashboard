'use client'

import { DataTable } from "@/ui/data-table";
import useOBD from "@/hooks/useOBD";
import { columns } from "./columns";

export default function CommandsPage() {
    const { pids, error, isLoading } = useOBD();

    if (error) return <div>failed to load</div>
    if (isLoading) return <div>loading...</div>

    return (
        <div>
            <div className="py-3 w-1/3">
                <DataTable columns={columns} data={pids} />
            </div>
        </div>
    );
}