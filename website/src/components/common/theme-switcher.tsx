"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { ChevronDownIcon, LaptopIcon, MoonIcon, SunIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const THEMES = [
    { value: "light", label: "Light", Icon: SunIcon },
    { value: "dark", label: "Dark", Icon: MoonIcon },
    { value: "system", label: "Auto", Icon: LaptopIcon },
];

const noop = () => () => {};

export function ThemeSwitcher() {
    const { theme, setTheme } = useTheme();
    // theme is unknown on the server; render the neutral "Auto" until hydrated
    const mounted = useSyncExternalStore(
        noop,
        () => true,
        () => false,
    );
    const current =
        THEMES.find((t) => t.value === (mounted ? theme : "system")) ??
        THEMES[2];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                render={
                    <Button
                        variant="secondary"
                        size="lg"
                        className="gap-2 px-3"
                        aria-label="Change theme"
                    />
                }
            >
                <current.Icon className="size-4" />
                <span className="hidden sm:inline">{current.label}</span>
                <ChevronDownIcon className="hidden size-4 opacity-60 sm:block" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuRadioGroup
                    value={current.value}
                    onValueChange={(v) => setTheme(String(v))}
                >
                    {THEMES.map(({ value, label, Icon }) => (
                        <DropdownMenuRadioItem key={value} value={value}>
                            <Icon /> {label}
                        </DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
