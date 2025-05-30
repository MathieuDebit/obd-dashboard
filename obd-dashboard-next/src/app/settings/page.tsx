'use client';

import { useContext } from "react";
import { Theme, ThemeContext } from "@/app/ThemeContext";
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

    const onThemeChange = (newTheme: Theme) => {
        changeTheme(newTheme);
    }

    return (
        <div>
            <Tabs defaultValue="general" className="w-full">
                <TabsList className="w-full h-13 mb-5">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="vehicule">Vehicule</TabsTrigger>
                    <TabsTrigger value="obd">OBD</TabsTrigger>
                    <TabsTrigger value="about">About</TabsTrigger>
                </TabsList>
                <TabsContent value="general">
                    <Card className="mb-5">
                        <CardContent className="flex justify-between">
                            <div>Language</div>
                            <Select defaultValue="français">
                                <SelectTrigger className="w-30">
                                    <SelectValue placeholder="" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="français">Français</SelectItem>
                                    <SelectItem value="english">English</SelectItem>
                                </SelectContent>
                            </Select>
                        </CardContent>

                        <Separator />

                        <CardContent className="flex justify-between">
                            <div>Theme</div>
                            <Select onValueChange={onThemeChange} defaultValue={theme}>
                                <SelectTrigger className="w-30">
                                    <SelectValue placeholder="Select theme" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="light">Light</SelectItem>
                                    <SelectItem value="dark">Dark</SelectItem>
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="vehicule">
                    <Card className="">
                        <CardContent className="flex justify-between">
                            <div>Model</div>
                            <Select defaultValue="nissan-skyliner34gtr">
                                <SelectTrigger className="w-55">
                                    <SelectValue placeholder="" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Nissan</SelectLabel>
                                        <SelectItem value="nissan-skyliner34gtr">Nissan Skyline R34 GT-R</SelectItem>
                                        <SelectItem value="nissan-200sx">Nissan 200SX</SelectItem>
                                    </SelectGroup>
                                    <SelectGroup>
                                        <SelectLabel>Toyota</SelectLabel>
                                        <SelectItem value="toyota-supramk4">Toyota Supra MK4</SelectItem>
                                        <SelectItem value="toyota-ae86">Toyota AE86</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </CardContent>

                        <Separator />

                        <CardContent className="flex justify-between">
                            <div>Color</div>
                            <Select defaultValue="red">
                                <SelectTrigger className="w-30">
                                    <SelectValue placeholder="" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="red">Red</SelectItem>
                                    <SelectItem value="green">Green</SelectItem>
                                    <SelectItem value="blue">Blue</SelectItem>
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>
                </TabsContent>
                
                <TabsContent value='obd'>
                    <Card className="">
                        <CardContent className="flex justify-between">
                            <div>Restart server</div>
                            <Button>Restart</Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value='about'>
                    <Card className="">
                        <CardContent className="flex justify-between">
                            <div>App version</div>
                            <div className="mr-1">0.1.0</div>
                        </CardContent>

                        <Separator />

                        <CardContent className="flex justify-between">
                            <div>Check for updates</div>
                            <Button>Check</Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}