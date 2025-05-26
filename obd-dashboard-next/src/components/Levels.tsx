import { Fuel, Thermometer } from "lucide-react";

export function LevelThermometer() {
    return (
        <div className="flex flex-col flex-none items-center">
            <Thermometer className="mb-4"/>
            <div className="w-9 h-3 mb-1 rounded-sm bg-red-200" />
            <div className="w-9 h-3 mb-1 rounded-sm bg-red-200" />
            <div className="w-9 h-3 mb-1 rounded-sm bg-red-400" />
            <div className="w-9 h-3 mb-1 rounded-sm bg-red-400" />
            <div className="w-9 h-3 mb-1 rounded-sm bg-red-400" />
        </div>
    )
}

export function LevelFuel() {
    return (
        <div className="flex flex-col flex-none items-center">
            <Fuel className="mb-4 ml-1" />
            <div className="w-9 h-3 mb-1 rounded-sm bg-orange-200" />
            <div className="w-9 h-3 mb-1 rounded-sm bg-orange-400" />
            <div className="w-9 h-3 mb-1 rounded-sm bg-orange-400" />
            <div className="w-9 h-3 mb-1 rounded-sm bg-orange-400" />
            <div className="w-9 h-3 mb-1 rounded-sm bg-orange-400" />
        </div>
    )
}