"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import Link from "next/link";
import {
  AlertTriangle,
  Bell,
  CheckCheck,
  CheckCircle2,
  ChevronDown,
  Info,
  LogOut,
  Menu,
  RotateCcw,
  ScrollText,
  Search,
  Settings,
  ShieldAlert,
  Store,
  Users,
  X,
} from "lucide-react";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { quickSearchLinks } from "@/components/cpos/navigation";
import { Sidebar } from "@/components/cpos/sidebar";
import { clearSessionCookie, initials, type SessionUser } from "@/lib/auth";
import { demoHeaderNotifications } from "@/lib/cpos/dashboard-demo-data";
import { CposProvider, useCpos } from "@/lib/cpos/store";
import { SessionProvider, useSession } from "@/lib/session";
import { cn } from "@/lib/utils";
import type { DashboardNotification } from "@/types/cpos";

function ToastNotification() {
  const { notice, dismissNotice } = useCpos();
  if (!notice) return null;

  const isSuccess = notice.tone === "success";
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed right-4 bottom-4 z-50 w-[min(420px,calc(100vw-2rem))]"
    >
      <div
        className={cn(
          "flex items-start justify-between gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg",
          isSuccess
            ? "border-[#087f8c]/30 bg-white text-ink"
            : "border-red-300 bg-red-50 text-red-900",
        )}
      >
        <div className="flex items-start gap-2.5">
          {isSuccess ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#1D9E75]" />
          ) : (
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
          )}
          <div>
            <p className="text-xs font-semibold">{notice.title}</p>
            <p className="mt-0.5 text-xs text-muted">{notice.message}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={dismissNotice}
          aria-label="Dismiss notification"
          className="rounded p-1 text-muted hover:bg-canvas hover:text-ink"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function NotificationIcon({ severity }: { severity: DashboardNotification["severity"] }) {
  switch (severity) {
    case "danger":
      return <ShieldAlert className="h-4 w-4 text-red-600" />;
    case "warning":
      return <AlertTriangle className="h-4 w-4 text-amber-600" />;
    case "success":
      return <CheckCircle2 className="h-4 w-4 text-[#1D9E75]" />;
    default:
      return <Info className="h-4 w-4 text-[#087f8c]" />;
  }
}

function Frame({ children }: { children: React.ReactNode }) {
  const session = useSession();
  const { state, resetDemoData } = useCpos();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState<DashboardNotification[]>(demoHeaderNotifications);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications],
  );

  const filteredLinks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return quickSearchLinks.slice(0, 7);
    return quickSearchLinks
      .filter(
        (item) =>
          item.label.toLowerCase().includes(q) ||
          item.section.toLowerCase().includes(q) ||
          item.keywords.some((kw) => kw.includes(q)),
      )
      .slice(0, 8);
  }, [searchQuery]);

  function logout() {
    clearSessionCookie();
    window.location.assign("/");
  }

  function markAllRead() {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  }

  function markOneRead(id: string) {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item)),
    );
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
        setSearchFocused(true);
      }
      if (event.key === "Escape") {
        setSearchFocused(false);
        setMobileOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-[#F3F5F8] text-ink">
      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-[#0F2137]/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <div className="flex min-h-screen">
        <Suspense
          fallback={
            <aside className="hidden w-[264px] shrink-0 bg-[#0F2137] lg:block" aria-hidden="true" />
          }
        >
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed((current) => !current)}
            mobileOpen={mobileOpen}
            onNavigate={() => setMobileOpen(false)}
            onLogout={logout}
          />
        </Suspense>

        <div className="flex min-w-0 flex-1 flex-col overflow-x-clip">
          {/* Persistent Top Header */}
          <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-[#DCE3EA] bg-white px-4 lg:px-6">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <button
                type="button"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-[#DCE3EA] bg-white text-ink hover:bg-[#F3F5F8] lg:hidden"
                onClick={() => setMobileOpen(true)}
                aria-label="Open navigation menu"
              >
                <Menu className="h-4 w-4" />
              </button>

              <div className="min-w-0 md:hidden">
                <p className="truncate text-xs font-semibold text-ink">
                  {state.pharmacy.operatingName}
                </p>
                <p className="truncate text-[11px] text-muted">Phase 0 Configuration</p>
              </div>

              {/* Global Search */}
              <div ref={searchContainerRef} className="relative hidden w-full max-w-md md:block">
                <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  ref={searchRef}
                  value={searchQuery}
                  onFocus={() => setSearchFocused(true)}
                  onChange={(event) => {
                    setSearchQuery(event.target.value);
                    setSearchFocused(true);
                  }}
                  className="h-9 w-full rounded-md border border-[#DCE3EA] bg-[#F8FAFC] pr-14 pl-9 text-sm text-ink outline-none transition placeholder:text-muted/80 focus:border-[#087f8c] focus:bg-white focus:ring-2 focus:ring-[#087f8c]/15"
                  placeholder="Search modules, configuration screens, reference tables..."
                  type="search"
                  aria-label="Global search"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    aria-label="Clear search"
                    className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded p-0.5 text-muted hover:text-ink"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <kbd className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 rounded border border-[#DCE3EA] bg-white px-1.5 py-0.5 text-[10px] font-medium text-muted">
                    Ctrl K
                  </kbd>
                )}

                {searchFocused ? (
                  <div className="absolute top-11 left-0 z-40 w-full overflow-hidden rounded-lg border border-[#DCE3EA] bg-white p-1.5 shadow-lg">
                    <p className="px-2.5 py-1 text-[10px] font-semibold tracking-wider text-muted uppercase">
                      {searchQuery.trim() ? "Matching Screens" : "Quick Navigation"}
                    </p>
                    {filteredLinks.length === 0 ? (
                      <p className="px-3 py-4 text-center text-xs text-muted">
                        No matching configuration modules found.
                      </p>
                    ) : (
                      <ul className="max-h-64 overflow-y-auto">
                        {filteredLinks.map((item) => (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              onClick={() => {
                                setSearchFocused(false);
                                setSearchQuery("");
                              }}
                              className="flex items-center justify-between rounded-md px-2.5 py-2 text-xs text-ink hover:bg-[#F3F5F8]"
                            >
                              <span className="font-medium">{item.label}</span>
                              <span className="text-[11px] text-muted">{item.section}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : null}
              </div>
            </div>

            {/* Right Header Controls */}
            <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
              <span className="hidden items-center gap-1.5 rounded-md border border-[#DCE3EA] bg-[#F8FAFC] px-2.5 py-1 text-xs font-medium text-muted xl:inline-flex">
                <Store className="h-3.5 w-3.5 text-[#087f8c]" />
                {state.pharmacy.operatingName}
              </span>

              {/* Notifications Dropdown */}
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button
                    type="button"
                    aria-label={`Notifications (${unreadCount} unread)`}
                    className="relative grid h-9 w-9 place-items-center rounded-md border border-[#DCE3EA] bg-white text-ink transition hover:bg-[#F3F5F8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087f8c]/30"
                  >
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 ? (
                      <span className="absolute -top-1 -right-1 grid h-4 min-w-4 place-items-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white">
                        {unreadCount}
                      </span>
                    ) : null}
                  </button>
                </DropdownMenu.Trigger>

                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    align="end"
                    sideOffset={8}
                    className="z-50 w-[min(350px,calc(100vw-2rem))] overflow-hidden rounded-lg border border-[#DCE3EA] bg-white shadow-xl"
                  >
                    <div className="flex items-center justify-between border-b border-[#E6ECF1] px-3.5 py-2.5">
                      <div>
                        <p className="text-xs font-semibold text-ink">System Notifications</p>
                        <p className="text-[11px] text-muted">
                          {unreadCount > 0 ? `${unreadCount} unread · Demo notices` : "All caught up"}
                        </p>
                      </div>
                      {unreadCount > 0 ? (
                        <button
                          type="button"
                          onClick={markAllRead}
                          className="inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-semibold text-[#087f8c] hover:bg-teal-surface"
                        >
                          <CheckCheck className="h-3.5 w-3.5" />
                          Mark read
                        </button>
                      ) : null}
                    </div>
                    <div className="max-h-72 divide-y divide-[#EEF2F6] overflow-y-auto">
                      {notifications.map((item) => (
                        <DropdownMenu.Item
                          key={item.id}
                          asChild
                          onSelect={() => markOneRead(item.id)}
                        >
                          <Link
                            href={item.href}
                            className={cn(
                              "flex items-start gap-2.5 px-3.5 py-2.5 text-left outline-none hover:bg-[#F8FAFC] focus:bg-[#F8FAFC]",
                              !item.read && "bg-[#F4F9FA]",
                            )}
                          >
                            <span className="mt-0.5 shrink-0">
                              <NotificationIcon severity={item.severity} />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-xs font-semibold text-ink">
                                {item.title}
                              </span>
                              <span className="mt-0.5 block text-[11px] text-muted">
                                {item.description}
                              </span>
                              <span className="mt-1 block text-[10px] text-muted/80">{item.time}</span>
                            </span>
                          </Link>
                        </DropdownMenu.Item>
                      ))}
                    </div>
                    <div className="border-t border-[#E6ECF1] bg-[#F8FAFC] px-3.5 py-2 text-center">
                      <DropdownMenu.Item asChild>
                        <Link
                          href="/configuration/master/notifications"
                          className="block text-xs font-semibold text-[#087f8c] outline-none hover:underline"
                        >
                          Notification Preferences
                        </Link>
                      </DropdownMenu.Item>
                    </div>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>

              {/* Logged-in User Profile + Role Label + Account Dropdown */}
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button
                    type="button"
                    aria-label="Account menu"
                    className="flex items-center gap-2 rounded-md border border-[#DCE3EA] bg-white py-1 pr-2.5 pl-1.5 text-left transition hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087f8c]/30"
                  >
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded bg-[#0F2137] text-[11px] font-semibold text-white">
                      {initials(session.name)}
                    </span>
                    <span className="hidden min-w-0 sm:block">
                      <span className="block max-w-[130px] truncate text-xs font-semibold text-ink">
                        {session.name}
                      </span>
                      <span className="block text-[10px] font-medium text-[#087f8c]">
                        Pharmacy Administrator
                      </span>
                    </span>
                    <ChevronDown className="hidden h-3.5 w-3.5 text-muted sm:block" />
                  </button>
                </DropdownMenu.Trigger>

                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    align="end"
                    sideOffset={8}
                    className="z-50 w-60 overflow-hidden rounded-lg border border-[#DCE3EA] bg-white p-1.5 shadow-xl"
                  >
                    <div className="border-b border-[#EEF2F6] px-2.5 py-2">
                      <p className="truncate text-xs font-semibold text-ink">{session.name}</p>
                      <p className="truncate text-[11px] text-muted">{session.email}</p>
                      <span className="mt-1 inline-block rounded bg-teal-surface px-1.5 py-0.5 text-[10px] font-semibold text-[#066b77]">
                        Pharmacy Administrator
                      </span>
                    </div>

                    <div className="py-1">
                      <DropdownMenu.Item asChild>
                        <Link
                          href="/configuration/pharmacy"
                          className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-ink outline-none hover:bg-[#F3F5F8] focus:bg-[#F3F5F8]"
                        >
                          <Store className="h-3.5 w-3.5 text-muted" />
                          Pharmacy Details
                        </Link>
                      </DropdownMenu.Item>
                      <DropdownMenu.Item asChild>
                        <Link
                          href="/locations/users"
                          className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-ink outline-none hover:bg-[#F3F5F8] focus:bg-[#F3F5F8]"
                        >
                          <Users className="h-3.5 w-3.5 text-muted" />
                          Users &amp; Roles
                        </Link>
                      </DropdownMenu.Item>
                      <DropdownMenu.Item asChild>
                        <Link
                          href="/audit-logs"
                          className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-ink outline-none hover:bg-[#F3F5F8] focus:bg-[#F3F5F8]"
                        >
                          <ScrollText className="h-3.5 w-3.5 text-muted" />
                          Audit Logs
                        </Link>
                      </DropdownMenu.Item>
                      <DropdownMenu.Item asChild>
                        <Link
                          href="/configuration/contact"
                          className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-ink outline-none hover:bg-[#F3F5F8] focus:bg-[#F3F5F8]"
                        >
                          <Settings className="h-3.5 w-3.5 text-muted" />
                          Regional Settings
                        </Link>
                      </DropdownMenu.Item>
                      <DropdownMenu.Item
                        onSelect={resetDemoData}
                        className="flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-ink outline-none hover:bg-[#F3F5F8] focus:bg-[#F3F5F8]"
                      >
                        <RotateCcw className="h-3.5 w-3.5 text-muted" />
                        Reset Demonstration Data
                      </DropdownMenu.Item>
                    </div>

                    <DropdownMenu.Separator className="my-1 h-px bg-[#EEF2F6]" />

                    <DropdownMenu.Item
                      onSelect={logout}
                      className="flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-medium text-red-700 outline-none hover:bg-red-50 focus:bg-red-50"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Sign out
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </div>
          </header>

          <main className="flex-1 px-4 py-5 sm:px-5 lg:px-6 lg:py-6">{children}</main>
          <ToastNotification />
        </div>
      </div>
    </div>
  );
}

export function WorkspaceShell({
  session,
  children,
}: {
  session: SessionUser;
  children: React.ReactNode;
}) {
  return (
    <SessionProvider session={session}>
      <CposProvider>
        <Frame>{children}</Frame>
      </CposProvider>
    </SessionProvider>
  );
}
