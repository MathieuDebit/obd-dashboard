import { Fuel, Thermometer } from "lucide-react";

export function LevelThermometer() {
    return (
        <div className="flex flex-none flex-col items-center">
            <Thermometer className="mb-4"/>
            <div className="mb-1 h-3 w-9 rounded-sm bg-red-200" />
            <div className="mb-1 h-3 w-9 rounded-sm bg-red-200" />
            <div className="mb-1 h-3 w-9 rounded-sm bg-red-400" />
            <div className="mb-1 h-3 w-9 rounded-sm bg-red-400" />
            <div className="mb-1 h-3 w-9 rounded-sm bg-red-400" />
        </div>
    )
}

export function LevelFuel() {
    return (
        <div className="flex flex-none flex-col items-center">
            <Fuel className="mb-4 ml-1" />
            <div className="mb-1 h-3 w-9 rounded-sm bg-orange-200" />
            <div className="mb-1 h-3 w-9 rounded-sm bg-orange-400" />
            <div className="mb-1 h-3 w-9 rounded-sm bg-orange-400" />
            <div className="mb-1 h-3 w-9 rounded-sm bg-orange-400" />
            <div className="mb-1 h-3 w-9 rounded-sm bg-orange-400" />
        </div>
    )
}