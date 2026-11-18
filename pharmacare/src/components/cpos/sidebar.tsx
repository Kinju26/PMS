"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, LogOut, PanelLeftClose, PanelLeftOpen, Plus, X } from "lucide-react";
import { useState } from "react";
import { sidebarSections, type NavGroup } from "@/components/cpos/navigation";
import { initials } from "@/lib/auth";
import { useSession } from "@/lib/session";
import { cn } from "@/lib/utils";

function isActiveRoute(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === href;
  if (href === "/configuration/master") {
    return pathname === href || pathname.startsWith("/configuration/master/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function groupContainsActive(pathname: string, group: NavGroup) {
  return group.children.some((child) => isActiveRoute(pathname, child.href));
}

export function Sidebar({
  collapsed,
  onToggle,
  mobileOpen,
  onNavigate,
  onLogout,
}: {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onNavigate: () => void;
  onLogout: () => void;
}) {
  const pathname = usePathname();
  const session = useSession();

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    "pharmacy-configuration": true,
    "users-and-roles": false,
  });
  const [dismissedAutoOpen, setDismissedAutoOpen] = useState<Record<string, string>>({});

  function isGroupOpen(group: NavGroup) {
    const hasActiveChild = groupContainsActive(pathname, group);
    if (hasActiveChild && dismissedAutoOpen[group.id] !== pathname) {
      return true;
    }
    return !!openGroups[group.id];
  }

  function toggleGroup(group: NavGroup) {
    if (collapsed) {
      onToggle();
      setOpenGroups((prev) => ({ ...prev, [group.id]: true }));
      setDismissedAutoOpen((prev) => {
        const next = { ...prev };
        delete next[group.id];
        return next;
      });
      return;
    }
    const currentlyOpen = isGroupOpen(group);
    if (currentlyOpen) {
      setOpenGroups((prev) => ({ ...prev, [group.id]: false }));
      setDismissedAutoOpen((prev) => ({ ...prev, [group.id]: pathname }));
    } else {
      setOpenGroups((prev) => ({ ...prev, [group.id]: true }));
      setDismissedAutoOpen((prev) => {
        const next = { ...prev };
        delete next[group.id];
        return next;
      });
    }
  }

  return (
    <aside
      aria-label="Primary application navigation"
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex w-[264px] shrink-0 flex-col border-r border-white/10 bg-[#0F2137] text-slate-200 transition-[width,transform] duration-150 lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:translate-x-0",
        collapsed && "lg:w-[72px]",
        mobileOpen
          ? "pointer-events-auto translate-x-0"
          : "pointer-events-none -translate-x-full lg:pointer-events-auto lg:translate-x-0",
      )}
    >
      {/* Enterprise Software Header */}
      <div
        className={cn(
          "flex h-16 shrink-0 items-center border-b border-white/10 px-4",
          collapsed ? "lg:justify-center lg:px-2" : "justify-between gap-2",
        )}
      >
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className={cn("flex min-w-0 items-center gap-2.5 focus-visible:outline-none", collapsed && "lg:justify-center")}
          title="CPOS — Pharmacy Operating System"
        >
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-[#087f8c] text-white">
            <Plus className="h-4 w-4 stroke-[2.5]" aria-hidden="true" />
          </span>
          <span className={cn("min-w-0", collapsed && "lg:hidden")}>
            <span className="block truncate text-sm font-semibold tracking-tight text-white">
              CPOS Rx
            </span>
            <span className="block truncate text-[11px] text-slate-400">
              Pharmacy Operating System
            </span>
          </span>
        </Link>

        <button
          type="button"
          onClick={onNavigate}
          aria-label="Close navigation menu"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"
        >
          <X className="h-4 w-4" />
        </button>

        {!collapsed ? (
          <button
            type="button"
            onClick={onToggle}
            aria-label="Collapse sidebar"
            title="Collapse sidebar"
            className="hidden h-7 w-7 shrink-0 place-items-center rounded-md text-slate-400 hover:bg-white/10 hover:text-white lg:grid"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {collapsed ? (
        <div className="hidden justify-center border-b border-white/10 py-2 lg:flex">
          <button
            type="button"
            onClick={onToggle}
            aria-label="Expand sidebar"
            title="Expand sidebar"
            className="grid h-7 w-7 place-items-center rounded-md text-slate-400 hover:bg-white/10 hover:text-white"
          >
            <PanelLeftOpen className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      {/* Navigation Tree */}
      <nav className="flex-1 space-y-4 overflow-y-auto px-2.5 py-3.5 [scrollbar-color:rgba(255,255,255,0.16)_transparent] [scrollbar-width:thin]">
        {sidebarSections.map((section) => (
          <div key={section.id} className="space-y-0.5">
            {!collapsed ? (
              <p className="px-2.5 pb-1 text-[10px] font-semibold tracking-wider text-slate-400/90 uppercase">
                {section.heading}
              </p>
            ) : (
              <div className="mx-auto my-1.5 h-px w-6 bg-white/10" aria-hidden="true" />
            )}

            <div className="space-y-0.5">
              {section.entries.map((entry) => {
                if (entry.kind === "item") {
                  const { item } = entry;
                  const Icon = item.icon;
                  const active = isActiveRoute(pathname, item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onNavigate}
                      title={collapsed ? item.label : undefined}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4bf]/60",
                        collapsed && "lg:justify-center lg:px-0",
                        active
                          ? "bg-[#087f8c] text-white"
                          : "text-slate-300 hover:bg-white/[0.07] hover:text-white",
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0",
                          active ? "text-white" : "text-slate-400 group-hover:text-slate-200",
                        )}
                      />
                      <span className={cn("truncate", collapsed && "lg:hidden")}>{item.label}</span>
                    </Link>
                  );
                }

                const { group } = entry;
                const GroupIcon = group.icon;
                const isOpen = isGroupOpen(group);
                const hasActiveChild = groupContainsActive(pathname, group);

                return (
                  <div key={group.id} className="space-y-0.5">
                    <button
                      type="button"
                      onClick={() => toggleGroup(group)}
                      aria-expanded={collapsed ? false : isOpen}
                      title={collapsed ? group.label : undefined}
                      className={cn(
                        "group flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4bf]/60",
                        collapsed && "lg:justify-center lg:px-0",
                        hasActiveChild
                          ? "bg-white/[0.09] text-white"
                          : "text-slate-300 hover:bg-white/[0.07] hover:text-white",
                      )}
                    >
                      <GroupIcon
                        className={cn(
                          "h-4 w-4 shrink-0",
                          hasActiveChild ? "text-[#2dd4bf]" : "text-slate-400 group-hover:text-slate-200",
                        )}
                      />
                      <span className={cn("flex-1 truncate text-left", collapsed && "lg:hidden")}>
                        {group.label}
                      </span>
                      <ChevronDown
                        className={cn(
                          "h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform duration-150",
                          isOpen && "rotate-180 text-slate-200",
                          collapsed && "lg:hidden",
                        )}
                      />
                    </button>

                    <div
                      className={cn(
                        "grid transition-[grid-template-rows,opacity] duration-150",
                        !collapsed && isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                        collapsed && "lg:hidden",
                      )}
                    >
                      <div className="overflow-hidden">
                        <div className="mt-0.5 ml-3.5 space-y-0.5 border-l border-white/10 py-0.5 pl-2.5">
                          {group.children.map((child) => {
                            const ChildIcon = child.icon;
                            const childActive = isActiveRoute(pathname, child.href);
                            return (
                              <Link
                                key={child.href}
                                href={child.href}
                                onClick={onNavigate}
                                aria-current={childActive ? "page" : undefined}
                                className={cn(
                                  "flex items-center gap-2 rounded-md px-2 py-1.5 text-[12.5px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4bf]/60",
                                  childActive
                                    ? "bg-[#087f8c]/25 text-[#5eead4]"
                                    : "text-slate-400 hover:bg-white/[0.06] hover:text-slate-100",
                                )}
                              >
                                <ChildIcon
                                  className={cn(
                                    "h-3.5 w-3.5 shrink-0",
                                    childActive ? "text-[#5eead4]" : "text-slate-500",
                                  )}
                                />
                                <span className="truncate">{child.label}</span>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Profile + Sign Out */}
      <div className="shrink-0 border-t border-white/10 p-2.5">
        <div
          className={cn(
            "rounded-lg bg-[#162C46] p-2.5",
            collapsed && "lg:flex lg:flex-col lg:items-center lg:gap-2 lg:bg-transparent lg:p-0",
          )}
        >
          <div className={cn("flex items-center gap-2.5", collapsed && "lg:justify-center")}>
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-[#087f8c] text-xs font-semibold text-white">
              {initials(session.name)}
            </span>
            <div className={cn("min-w-0 flex-1", collapsed && "lg:hidden")}>
              <p className="truncate text-xs font-semibold text-white">{session.name}</p>
              <p className="truncate text-[11px] text-slate-400">Pharmacy Administrator</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            title="Log out"
            className={cn(
              "mt-2 flex w-full items-center justify-center gap-1.5 rounded-md border border-white/10 bg-white/[0.05] px-2.5 py-1.5 text-xs font-medium text-slate-200 transition hover:border-red-400/40 hover:bg-red-500/15 hover:text-red-200",
              collapsed && "lg:mt-0 lg:h-8 lg:w-8 lg:px-0",
            )}
          >
            <LogOut className="h-3.5 w-3.5 shrink-0" />
            <span className={cn(collapsed && "lg:hidden")}>Sign out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
