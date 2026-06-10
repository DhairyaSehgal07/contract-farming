"use client";

import { Loader2, LogOut, Moon, Sun, User } from "lucide-react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useSyncExternalStore, useTransition } from "react";
import { toast } from "sonner";
import { signOutAction } from "@/app/actions/auth";
import { getPageTitle } from "@/components/layout/nav-config";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type DashboardUser = {
  name: string;
  email: string;
  image?: string | null;
};

function getInitials(name?: string) {
  if (!name) return "?";

  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

function useResolvedThemeMode() {
  const { theme, resolvedTheme } = useTheme();

  if (theme === "light" || theme === "dark") {
    return theme;
  }

  return resolvedTheme === "dark" ? "dark" : "light";
}

function ThemeToggle() {
  const { setTheme } = useTheme();
  const isClient = useIsClient();
  const resolvedMode = useResolvedThemeMode();

  if (!isClient) {
    return (
      <Button variant="ghost" size="icon" disabled aria-label="Theme">
        <Sun className="size-4 text-muted-foreground" />
      </Button>
    );
  }

  const isDark = resolvedMode === "dark";

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              aria-label="Change theme"
            >
              {isDark ? (
                <Moon className="size-4" />
              ) : (
                <Sun className="size-4" />
              )}
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom">Theme</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={resolvedMode}
          onValueChange={(value) => setTheme(value)}
        >
          <DropdownMenuRadioItem value="light">
            <Sun className="mr-2 size-4" />
            Light
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">
            <Moon className="mr-2 size-4" />
            Dark
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppTopbar({ user }: { user: DashboardUser }) {
  const pathname = usePathname();
  const [isSigningOut, startSignOut] = useTransition();
  const pageTitle = getPageTitle(pathname);

  function handleSignOut() {
    toast.success("Signing out", {
      description: "Please wait while we sign you out.",
    });
    startSignOut(() => {
      void signOutAction();
    });
  }

  return (
    <header
      className={cn(
        "flex h-14 shrink-0 items-center border-b bg-background px-4",
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-1">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 h-6" />
        <h1
          className="truncate text-lg font-semibold tracking-tight"
          title={pageTitle}
        >
          {pageTitle}
        </h1>
      </div>

      <div className="ml-3 flex shrink-0 items-center gap-2">
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-9 gap-2 rounded-md px-2 hover:bg-accent hover:text-accent-foreground"
            >
              <Avatar className="size-7">
                <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <span className="hidden max-w-24 truncate text-sm font-medium lg:inline">
                {user.name}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground tabular-nums">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem disabled>
                <User className="mr-2 size-4" />
                Profile
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              disabled={isSigningOut}
              onClick={handleSignOut}
            >
              {isSigningOut ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <LogOut className="mr-2 size-4" />
              )}
              {isSigningOut ? "Signing out…" : "Log out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
