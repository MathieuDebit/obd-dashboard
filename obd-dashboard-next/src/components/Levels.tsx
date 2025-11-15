/**
 * @file Contains simple presentational components that depict temperature and
 * fuel levels with stacked bars for use in dashboards.
 */
import { Fuel, Thermometer } from "lucide-react";

/**
 * LevelThermometer renders a thermometer icon with stylized level bars to
 * represent coolant or battery temperature.
 *
 * @returns Thermometer indicator markup.
 */
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

/**
 * LevelFuel renders a fuel icon with stacked bars to show an approximate fuel
 * level visualization.
 *
 * @returns Fuel indicator markup.
 */
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
