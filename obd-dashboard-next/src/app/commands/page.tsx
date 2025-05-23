'use client'

import { DataTable } from "./data-table";
import { columns } from "./columns";
import useOBD from "@/app/hooks/useOBD";

export default function CommandsPage() {
    const { timestamp, pids, error, isLoading } = useOBD();

    if (error) return <div>failed to load</div>
    if (isLoading) return <div>loading...</div>

    return (
        <div>
            <h1 className="text-2xl font-bold">Commands</h1>

            <p>{timestamp}</p>

            <div className="container mx-auto py-10">
                <DataTable columns={columns} data={pids} />
            </div>
        </div>
    );
}