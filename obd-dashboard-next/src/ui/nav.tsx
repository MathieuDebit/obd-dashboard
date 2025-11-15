import { Navigation, ChartLine, Wrench, Settings } from "lucide-react";
import Link from "next/link";


export default function Nav() {
    return (
        <div className="h-15 mb-2 flex">
            <Link className="bg-background flex h-full flex-1 items-center justify-center rounded-lg border" href="/"><Navigation /></Link>
            <Link className="bg-background mx-2 flex h-full flex-1 items-center justify-center rounded-lg border" href="/commands"><ChartLine /></Link>
            <Link className="bg-background mr-2 flex h-full flex-1 items-center justify-center rounded-lg border" href="/diagnostics"><Wrench /></Link>
            <Link className="bg-background flex aspect-square flex-none items-center justify-center rounded-lg border" href="/settings"><Settings /></Link>
        </div>
    )
}