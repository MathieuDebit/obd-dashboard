import { Navigation, ChartLine, Wrench, Settings } from "lucide-react";
import Link from "next/link";


export default function Nav() {
    return (
        <div className="flex h-15 mb-2">
            <Link className="bg-background border rounded-lg flex justify-center items-center flex-1 h-full" href="/"><Navigation /></Link>
            <Link className="bg-background border rounded-lg flex justify-center items-center flex-1 h-full mx-2" href="/commands"><ChartLine /></Link>
            <Link className="bg-background border rounded-lg flex justify-center items-center flex-1 h-full mr-2" href="/diagnostics"><Wrench /></Link>
            <Link className="bg-background border rounded-lg flex justify-center items-center flex-none aspect-square" href="/settings"><Settings /></Link>
        </div>
    )
}