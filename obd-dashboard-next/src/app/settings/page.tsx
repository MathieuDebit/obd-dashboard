'use client';

import { useContext } from "react";
import { Theme, ThemeContext } from "@/app/ThemeContext";
import { useLanguage } from "@/app/LanguageContext";
import { usePowerMode, type PowerMode } from "@/app/PowerModeContext";
import { useDevtoolsPreferences } from "@/app/DevtoolsPreferencesContext";
import type { Locale } from "@/utils/i18n";
import { translateUi } from "@/utils/i18n";
import { Card, CardContent } from "@/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import { Button } from "@/ui/button";
import { Separator } from "@/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs"

export default function Settings() {
    const { theme, changeTheme } = useContext(ThemeContext);
    const { locale, changeLocale } = useLanguage();
    const { mode: powerMode, changeMode } = usePowerMode();
    const { showPerformanceOverlay, setShowPerformanceOverlay } = useDevtoolsPreferences();
    const t = (key: string, fallback: string) => translateUi(key, locale, fallback);

    const onThemeChange = (newTheme: Theme) => {
        changeTheme(newTheme);
    }

    const onPowerModeChange = (newMode: PowerMode) => {
        changeMode(newMode);
    }

    return (
        <div>
            <Tabs defaultValue="general" className="w-full">
                <TabsList className="w-full h-13 mb-5">
                    <TabsTrigger value="general">{t("settings.tab.general", "General")}</TabsTrigger>
                    <TabsTrigger value="vehicle">{t("settings.tab.vehicle", "Vehicle")}</TabsTrigger>
                    <TabsTrigger value="obd">{t("settings.tab.obd", "OBD")}</TabsTrigger>
                    <TabsTrigger value="about">{t("settings.tab.about", "About")}</TabsTrigger>
                </TabsList>
                <TabsContent value="general">
                    <Card className="mb-5">
                        <CardContent className="flex justify-between">
                            <div>{t("settings.language.label", "Language")}</div>
                            <Select value={locale} onValueChange={(value) => changeLocale(value as Locale)}>
                                <SelectTrigger className="w-30">
                                    <SelectValue placeholder="" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="fr">Français</SelectItem>
                                    <SelectItem value="en">English</SelectItem>
                                </SelectContent>
                            </Select>
                        </CardContent>

                        <Separator />

                        <CardContent className="flex justify-between">
                            <div>{t("settings.theme.label", "Theme")}</div>
                            <Select onValueChange={onThemeChange} defaultValue={theme}>
                                <SelectTrigger className="w-30">
                                    <SelectValue placeholder={t("settings.theme.placeholder", "Select theme")} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="light">{t("settings.theme.light", "Light")}</SelectItem>
                                    <SelectItem value="dark">{t("settings.theme.dark", "Dark")}</SelectItem>
                                </SelectContent>
                            </Select>
                        </CardContent>

                        <Separator />

                        <CardContent className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <div>{t("settings.power.label", "Power mode")}</div>
                                <Select onValueChange={(value) => onPowerModeChange(value as PowerMode)} defaultValue={powerMode}>
                                    <SelectTrigger className="w-35">
                                        <SelectValue placeholder={t("settings.power.placeholder", "Select mode")} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="performance">{t("settings.power.performance", "Performance")}</SelectItem>
                                        <SelectItem value="powersave">{t("settings.power.save", "Power save")}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {t(
                                    "settings.power.refresh_hint",
                                    "Chart refresh rate is automatically slowed down in Power save mode to match the OBD sample interval."
                                )}
                            </p>
                        </CardContent>

                        <Separator />

                        <CardContent className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <div>{t("settings.devtools.overlay.label", "Performance overlay")}</div>
                                <Select
                                    value={showPerformanceOverlay ? "visible" : "hidden"}
                                    onValueChange={(value) =>
                                        setShowPerformanceOverlay(value === "visible")
                                    }
                                >
                                    <SelectTrigger className="w-45">
                                        <SelectValue
                                            placeholder={t(
                                                "settings.devtools.overlay.placeholder",
                                                "Select behavior"
                                            )}
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="hidden">
                                            {t(
                                                "settings.devtools.overlay.hidden",
                                                "Hidden (default)"
                                            )}
                                        </SelectItem>
                                        <SelectItem value="visible">
                                            {t(
                                                "settings.devtools.overlay.visible",
                                                "Visible"
                                            )}
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {t(
                                    "settings.devtools.overlay.description",
                                    "Show the FPS/CPU overlay when debugging performance in development builds."
                                )}
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="vehicle">
                    <Card className="">
                        <CardContent className="flex justify-between">
                            <div>{t("settings.vehicle.model", "Model")}</div>
                            <Select defaultValue="nissan-skyliner34gtr">
                                <SelectTrigger className="w-55">
                                    <SelectValue placeholder="" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>{t("settings.vehicle.brand.nissan", "Nissan")}</SelectLabel>
                                        <SelectItem value="nissan-skyliner34gtr">{t("settings.vehicle.model.nissan_r34", "Nissan Skyline R34 GT-R")}</SelectItem>
                                        <SelectItem value="nissan-200sx">{t("settings.vehicle.model.nissan_200sx", "Nissan 200SX")}</SelectItem>
                                    </SelectGroup>
                                    <SelectGroup>
                                        <SelectLabel>{t("settings.vehicle.brand.toyota", "Toyota")}</SelectLabel>
                                        <SelectItem value="toyota-supramk4">{t("settings.vehicle.model.toyota_supra", "Toyota Supra MK4")}</SelectItem>
                                        <SelectItem value="toyota-ae86">{t("settings.vehicle.model.toyota_ae86", "Toyota AE86")}</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </CardContent>

                        <Separator />

                        <CardContent className="flex justify-between">
                            <div>{t("settings.vehicle.color", "Color")}</div>
                            <Select defaultValue="red">
                                <SelectTrigger className="w-30">
                                    <SelectValue placeholder="" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="red">{t("settings.vehicle.color.red", "Red")}</SelectItem>
                                    <SelectItem value="green">{t("settings.vehicle.color.green", "Green")}</SelectItem>
                                    <SelectItem value="blue">{t("settings.vehicle.color.blue", "Blue")}</SelectItem>
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>
                </TabsContent>
                
                <TabsContent value='obd'>
                    <Card className="">
                        <CardContent className="flex justify-between">
                            <div>{t("settings.obd.restart.label", "Restart server")}</div>
                            <Button>{t("settings.obd.restart.button", "Restart")}</Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value='about'>
                    <Card className="">
                        <CardContent className="flex justify-between">
                            <div>{t("settings.about.version", "App version")}</div>
                            <div className="mr-1">0.1.0</div>
                        </CardContent>

                        <Separator />

                        <CardContent className="flex justify-between">
                            <div>{t("settings.about.check", "Check for updates")}</div>
                            <Button>{t("settings.about.check.button", "Check")}</Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
