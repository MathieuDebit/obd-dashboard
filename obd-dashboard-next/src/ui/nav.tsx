import { Navigation, ChartLine, Wrench, Settings } from "lucide-react";
import Link from "next/link";


export default function Nav() {
    return (
        <div className="flex flex-col w-20 justify-around pr-3">
            <Link className="bg-background border rounded-lg flex justify-center items-center flex-1 h-full" href="/"><Navigation /></Link>
            <Link className="bg-background border rounded-lg flex justify-center items-center flex-1 h-full my-2" href="/commands"><ChartLine /></Link>
            <Link className="bg-background border rounded-lg flex justify-center items-center flex-1 h-full mb-2" href="/diagnostics"><Wrench /></Link>
            <Link className="bg-background border rounded-lg flex justify-center items-center flex-none aspect-square" href="/settings"><Settings /></Link>
        </div>
    )
}