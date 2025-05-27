'use client';

import { useContext } from "react";
import { Switch } from "@/ui/switch";
import { ThemeContext } from "@/app/ThemeContext";

export default function Settings() {
    const { theme, toggleTheme } = useContext(ThemeContext);

    return (
        <div>
            <h1 className="text-xl font-bold">Settings</h1>
            <div>language</div>
            <div>vehicule type</div>
            <div>restart/shutdown</div>
            <div>app version / update</div>
            <div>ODB settings / restart server</div>

            <div>
                Theme: 
                <Switch
                    checked={theme === 'dark'}
                    onCheckedChange={() => toggleTheme(theme === 'dark' ? 'light' : 'dark')}
                />
            </div>
        </div>
    )
}