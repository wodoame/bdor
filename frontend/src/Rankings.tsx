import * as React from "react";
import type { CSSProperties } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnPinningState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  type PaginationState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import {
  ArrowUp,
  ArrowDown,
  Circle,
  ChevronDown,
  FilterIcon,
  SearchIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { cn } from "@/lib/utils";

interface ApiResponse {
  success: boolean;
  total_players: number;
  players: Player[];
}

const fetchPlayerRankings = async (): Promise<ApiResponse> => {
  const response = await axios.get("/api/rankings/");
  return response.data;
};

type Player = {
  rank: number;
  rank_change: "up" | "down" | "same";
  previous_rank: number | null;
  name: string;
  position: string;
  points: number;
  goals: number;
  assists: number;
  team_name: string;
  yellow_cards: number;
  red_cards: number;
  man_of_the_match: number;
  rating: number;
  appearances: number;
  player_id: number;
};

type SheetFiltersState = {
  team: string | null;
  positions: string[];
  movements: string[];
};

const EMPTY_SHEET_FILTERS: SheetFiltersState = {
  team: null,
  positions: [],
  movements: [],
};

const buildFilterSummary = (filters: SheetFiltersState) => {
  const parts: string[] = [];

  if (filters.team) {
    parts.push(`Team: ${filters.team}`);
  }
  if (filters.positions.length > 0) {
    parts.push(
      `Position: ${filters.positions.map((position) => position.toUpperCase()).join(", ")}`,
    );
  }
  if (filters.movements.length > 0) {
    parts.push(
      `Movement: ${filters.movements.map((m) => m.charAt(0).toUpperCase() + m.slice(1)).join(", ")}`,
    );
  }

  if (parts.length === 0) {
    return "Filter players...";
  }

  return parts.join(" • ");
};

const countActiveFilters = (filters: SheetFiltersState) => {
  let count = 0;

  if (filters.team) {
    count += 1;
  }
  if (filters.positions.length > 0) {
    count += 1;
  }
  if (filters.movements.length > 0) {
    count += 1;
  }

  return count;
};

const PreviousRankDisplay = ({
  previousRank,
}: {
  previousRank: number | null;
}) => {
  if (previousRank === null) return null;
  return <span className="text-orange-400 opacity-70">{previousRank}</span>;
};

const RankChangeIcon = ({
  rankChange,
  previousRank,
}: {
  rankChange: "up" | "down" | "same";
  previousRank: number | null;
}) => {
  switch (rankChange) {
    case "up":
      return (
        <div className="flex items-center gap-2">
          <ArrowUp className="w-4 h-4 text-green-600" />
          <PreviousRankDisplay previousRank={previousRank} />
        </div>
      );
    case "down":
      return (
        <div className="flex items-center gap-2">
          <ArrowDown className="w-4 h-4 text-red-600" />
          <PreviousRankDisplay previousRank={previousRank} />
        </div>
      );
    case "same":
      return (
        <div className="flex items-center gap-2">
          <Circle className="w-2 h-2 text-gray-500 fill-gray-500" />
          <PreviousRankDisplay previousRank={previousRank} />
        </div>
      );
    default:
      return null;
  }
};

const columns: ColumnDef<Player>[] = [
  // {
  //   id: "select",
  //   header: ({ table }) => (
  //     <Checkbox
  //       checked={
  //         table.getIsAllPageRowsSelected() ||
  //         (table.getIsSomePageRowsSelected() && "indeterminate")
  //       }
  //       onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
  //       aria-label="Select all"
  //     />
  //   ),
  //   cell: ({ row }) => (
  //     <Checkbox
  //       checked={row.getIsSelected()}
  //       onCheckedChange={(value) => row.toggleSelected(!!value)}
  //       aria-label="Select row"
  //     />
  //   ),
  //   enableSorting: false,
  //   enableHiding: false,
  // },
  {
    id: "rank",
    accessorKey: "rank",
    size: 144,
    minSize: 144,
    maxSize: 144,
    header: () => <div className="text-center">Rank</div>,
    cell: ({ row }) => (
      <div className="flex items-center justify-center gap-2">
        <span className="font-medium">{row.getValue("rank")}</span>
        <RankChangeIcon
          rankChange={row.original.rank_change}
          previousRank={row.original.previous_rank}
        />
      </div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "name",
    size: 224,
    minSize: 224,
    header: "Name",
    cell: ({ row }) => <div>{row.getValue("name")}</div>,
  },
  {
    accessorKey: "position",
    header: "Position",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("position")}</div>
    ),
    filterFn: (row, columnId, filterValue: string[]) => {
      if (!filterValue || filterValue.length === 0) return true;
      return filterValue.includes(row.getValue<string>(columnId)?.toLowerCase());
    },
  },
  {
    accessorKey: "team_name",
    header: "Team",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("team_name")}</div>
    ),
  },
  {
    accessorKey: "points",
    header: () => <div className="text-right">Points</div>,
    cell: ({ row }) => {
      const points = parseFloat(row.getValue("points"));
      return <div className="text-right font-medium">{points.toFixed(2)}</div>;
    },
  },
  {
    accessorKey: "goals",
    header: () => <div className="text-right">Goals</div>,
    cell: ({ row }) => (
      <div className="text-right">{row.getValue("goals")}</div>
    ),
  },
  {
    accessorKey: "assists",
    header: () => <div className="text-right">Assists</div>,
    cell: ({ row }) => (
      <div className="text-right">{row.getValue("assists")}</div>
    ),
  },
  {
    accessorKey: "yellow_cards",
    header: () => <div className="text-right">Yellow Cards</div>,
    cell: ({ row }) => (
      <div className="text-right">{row.getValue("yellow_cards")}</div>
    ),
  },
  {
    accessorKey: "red_cards",
    header: () => <div className="text-right">Red Cards</div>,
    cell: ({ row }) => (
      <div className="text-right">{row.getValue("red_cards")}</div>
    ),
  },
  {
    accessorKey: "man_of_the_match",
    header: () => <div className="text-right">MOTM</div>,
    cell: ({ row }) => (
      <div className="text-right">{row.getValue("man_of_the_match")}</div>
    ),
  },
  {
    accessorKey: "rating",
    header: () => <div className="text-right">Rating</div>,
    cell: ({ row }) => (
      <div className="text-right">{row.getValue("rating")}</div>
    ),
  },
  {
    accessorKey: "appearances",
    header: () => <div className="text-right">Appearances</div>,
    cell: ({ row }) => (
      <div className="text-right">{row.getValue("appearances")}</div>
    ),
  },
  {
    accessorKey: "rank_change",
    enableHiding: true,
    filterFn: (row, columnId, filterValue: string[]) => {
      if (!filterValue || filterValue.length === 0) return true;
      return filterValue.includes(row.getValue<string>(columnId));
    },
  },
];

import MainLayout from "@/layouts/MainLayout"

const getPinnedColumnStyles = (
  column: Column<Player>,
): CSSProperties => {
  const pinnedSide = column.getIsPinned();

  if (!pinnedSide) {
    return {
      width: column.getSize(),
    };
  }

  return {
    isolation: "isolate",
    left: `${column.getStart("left")}px`,
    position: "sticky",
    width: column.getSize(),
    zIndex: column.id === "rank" ? 30 : 20,
  };
};

const getPinnedColumnClasses = (column: Column<Player>, isHeader = false) => {
  if (!column.getIsPinned()) {
    return "";
  }

  const shadowClass = column.getIsLastColumn("left")
    ? "shadow-none border-r border-border"
    : "";
  const backgroundClass = isHeader
    ? "bg-muted"
    : "bg-background group-hover:bg-muted";

  return `relative ${backgroundClass} bg-clip-padding overflow-hidden ${shadowClass}`;
};

const getColumnDividerClasses = (
  column: Column<Player>,
  isHeader = false,
) => {
  const dividerClass = column.getIsPinned() ? "border-border" : "border-border/70";
  const rightDividerClass = column.getIsLastColumn("left")
    ? ""
    : "border-r";
  const bottomDividerClass = isHeader ? "border-b" : "border-b";

  return `${rightDividerClass} ${bottomDividerClass} ${dividerClass}`.trim();
};

function Rankings() {
  const [filterSheetContainer, setFilterSheetContainer] =
    React.useState<HTMLDivElement | null>(null);
  const {
    data: apiData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["playerRankings"],
    queryFn: fetchPlayerRankings,
  });

  const data = React.useMemo(() => apiData?.players ?? [], [apiData?.players]);

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({ rank_change: false });
  const [isFilterSheetOpen, setIsFilterSheetOpen] = React.useState(false);
  const [nameFilterInput, setNameFilterInput] = React.useState("");
  const [appliedFilters, setAppliedFilters] =
    React.useState<SheetFiltersState>(EMPTY_SHEET_FILTERS);
  const [draftFilters, setDraftFilters] =
    React.useState<SheetFiltersState>(EMPTY_SHEET_FILTERS);
  // Responsive column pinning: pin the first two columns on md+ screens,
  // but disable pinning on smaller screens so the full table can scroll.
  const [columnPinning, setColumnPinning] = React.useState<
    ColumnPinningState
  >(() => {
    if (typeof window === "undefined") return {};
    const mql = window.matchMedia("(min-width: 768px)"); // Tailwind 'md' breakpoint
    return mql.matches ? { left: ["rank", "name"] } : {};
  });

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(min-width: 768px)");
    const syncColumnPinning = (matches: boolean) => {
      setColumnPinning(matches ? { left: ["rank", "name"] } : {});
    };
    const handleChange = (event: MediaQueryListEvent) => {
      syncColumnPinning(event.matches);
    };

    // Initial sync (in case of SSR hydration differences)
    syncColumnPinning(mql.matches);

    // Prefer modern addEventListener when available
    if (typeof mql.addEventListener === "function") {
      mql.addEventListener("change", handleChange);
      return () => mql.removeEventListener("change", handleChange);
    }

    // Fallback for older browsers
    mql.addListener(handleChange);
    return () => mql.removeListener(handleChange);
  }, []);
  const [rowSelection, setRowSelection] = React.useState({});
  const [currentPage, setCurrentPage] = React.useState(1);

  const teamNames = React.useMemo(
    () =>
      [...new Set(data.map((p) => p.team_name))]
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b)),
    [data],
  );

  const positions = React.useMemo(
    () =>
      [...new Set(data.map((p) => p.position?.toLowerCase()))]
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b)),
    [data],
  );
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 50,
  });

  const table = useReactTable({
    data,
    columns,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      columnPinning,
      rowSelection,
      pagination,
    },
  });

  React.useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      table.getColumn("name")?.setFilterValue(nameFilterInput || undefined);
      table.setPageIndex(0);
      setCurrentPage(1);
    }, 200);

    return () => window.clearTimeout(timeoutId);
  }, [nameFilterInput, table]);

  React.useEffect(() => {
    table
      .getColumn("team_name")
      ?.setFilterValue(appliedFilters.team ?? undefined);
  }, [appliedFilters.team, table]);

  React.useEffect(() => {
    table.getColumn("position")?.setFilterValue(
      appliedFilters.positions.length > 0 ? appliedFilters.positions : undefined,
    );
  }, [appliedFilters.positions, table]);

  React.useEffect(() => {
    table.getColumn("rank_change")?.setFilterValue(
      appliedFilters.movements.length > 0 ? appliedFilters.movements : undefined,
    );
  }, [appliedFilters.movements, table]);

  React.useEffect(() => {
    table.setPageIndex(0);
    setCurrentPage(1);
  }, [appliedFilters, table]);

  const scrollToTop = React.useCallback(() => {
    try {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (_e) { // eslint-disable-line @typescript-eslint/no-unused-vars
      // fallback for environments where window might be undefined
      // ignore silently
    }
  }, []);

  const activeFilterCount = React.useMemo(
    () => countActiveFilters(appliedFilters),
    [appliedFilters],
  );
  const filterSummary = React.useMemo(
    () => buildFilterSummary(appliedFilters),
    [appliedFilters],
  );

  const handleFilterSheetOpenChange = React.useCallback(
    (open: boolean) => {
      if (open) {
        setDraftFilters(appliedFilters);
      }
      setIsFilterSheetOpen(open);
    },
    [appliedFilters],
  );

  const handleApplyFilters = React.useCallback(() => {
    setAppliedFilters({
      team: draftFilters.team,
      positions: [...draftFilters.positions].sort(),
      movements: [...draftFilters.movements].sort(),
    });
    setIsFilterSheetOpen(false);
  }, [draftFilters]);

  const handleClearDraftFilters = React.useCallback(() => {
    setDraftFilters(EMPTY_SHEET_FILTERS);
  }, []);

  if (isLoading) {
    return (
      <div className="w-full p-4">
        <div className="text-center py-8">Loading player data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-4">
        <div className="text-center py-8 text-red-500">
          Error loading player data:{" "}
          {error instanceof Error ? error.message : "Unknown error"}
        </div>
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="w-full">
        <div className="pb-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <InputGroup className="h-11 flex-1 rounded-lg border-2 has-[[data-slot=input-group-control]:focus-visible]:border-blue-500 has-[[data-slot=input-group-control]:focus-visible]:ring-0">
              <InputGroupAddon align="inline-start">
                <InputGroupText>
                  <SearchIcon className="size-4" />
                </InputGroupText>
              </InputGroupAddon>
              <InputGroupInput
                aria-label="Filter players by name"
                placeholder="Filter players by name..."
                value={nameFilterInput}
                onChange={(event) => setNameFilterInput(event.target.value)}
                className="text-sm"
              />
            </InputGroup>

            <Sheet
              open={isFilterSheetOpen}
              onOpenChange={handleFilterSheetOpenChange}
            >
              <Button
                type="button"
                variant="outline"
                aria-label="Open filters"
                onClick={() => handleFilterSheetOpenChange(true)}
                className={cn(
                  "h-11 min-w-[132px] justify-between rounded-lg border-2 sm:w-auto",
                  activeFilterCount > 0 && "border-blue-500/40",
                )}
              >
                <span className="flex items-center gap-2">
                  <FilterIcon className="size-4" />
                  Filters
                </span>
                <span className="text-muted-foreground text-xs font-medium">
                  {activeFilterCount > 0 ? `${activeFilterCount} active` : ""}
                </span>
              </Button>

              <SheetContent
                ref={setFilterSheetContainer}
                side="right"
                className="overflow-x-hidden sm:max-w-xl"
              >
                <SheetHeader>
                  <SheetTitle>Filter rankings</SheetTitle>
                  <SheetDescription className="truncate">
                    {activeFilterCount > 0
                      ? filterSummary
                      : "Narrow down players"}
                  </SheetDescription>
                </SheetHeader>

                <div className="flex flex-1 flex-col gap-6 overflow-x-hidden overflow-y-auto py-2">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Team</label>
                    <Combobox
                      value={draftFilters.team}
                      onValueChange={(value: string | null) =>
                        setDraftFilters((prev) => ({
                          ...prev,
                          team: value,
                        }))
                      }
                      items={teamNames}
                    >
                      <ComboboxInput
                        placeholder="Filter teams..."
                        showClear={!!draftFilters.team}
                        className="w-full rounded-lg border-2 has-[[data-slot=input-group-control]:focus-visible]:border-blue-500 has-[[data-slot=input-group-control]:focus-visible]:ring-0"
                      />
                      <ComboboxContent container={filterSheetContainer}>
                        <ComboboxEmpty>No teams found.</ComboboxEmpty>
                        <ComboboxList>
                          {(team: string) => (
                            <ComboboxItem key={team} value={team}>
                              {team}
                            </ComboboxItem>
                          )}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Position</label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="h-10 w-full justify-between rounded-lg border-2 focus-visible:border-blue-500 focus-visible:ring-0 focus-visible:outline-none"
                        >
                          {draftFilters.positions.length === 0
                            ? "Select positions"
                            : draftFilters.positions
                              .map((position) => position.toUpperCase())
                              .join(", ")}
                          <ChevronDown className="ml-2 size-4 opacity-50" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56">
                        <DropdownMenuLabel>Position</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {positions.map((pos) => (
                          <DropdownMenuCheckboxItem
                            key={pos}
                            className="uppercase"
                            indicatorSide="right"
                            checked={draftFilters.positions.includes(pos)}
                            onCheckedChange={(checked) => {
                              setDraftFilters((prev) => ({
                                ...prev,
                                positions: checked
                                  ? [...prev.positions, pos]
                                  : prev.positions.filter(
                                    (position) => position !== pos,
                                  ),
                              }));
                            }}
                          >
                            {pos.toUpperCase()}
                          </DropdownMenuCheckboxItem>
                        ))}
                        {draftFilters.positions.length > 0 && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuCheckboxItem
                              indicatorSide="right"
                              checked={false}
                              onCheckedChange={() =>
                                setDraftFilters((prev) => ({ ...prev, positions: [] }))
                              }
                            >
                              Clear
                            </DropdownMenuCheckboxItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Movement</label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="h-10 w-full justify-between rounded-lg border-2 focus-visible:border-blue-500 focus-visible:ring-0 focus-visible:outline-none"
                        >
                          {draftFilters.movements.length === 0
                            ? "Select movements"
                            : draftFilters.movements
                              .map((m) => m.charAt(0).toUpperCase() + m.slice(1))
                              .join(", ")}
                          <ChevronDown className="ml-2 size-4 opacity-50" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56">
                        <DropdownMenuLabel>Movement</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {(["up", "down", "same"] as const).map((movement) => (
                          <DropdownMenuCheckboxItem
                            key={movement}
                            indicatorSide="right"
                            checked={draftFilters.movements.includes(movement)}
                            onCheckedChange={(checked) => {
                              setDraftFilters((prev) => ({
                                ...prev,
                                movements: checked
                                  ? [...prev.movements, movement]
                                  : prev.movements.filter((m) => m !== movement),
                              }));
                            }}
                          >
                            <span className="flex items-center gap-2">
                              {movement === "up" && <ArrowUp className="w-4 h-4 text-green-600" />}
                              {movement === "down" && <ArrowDown className="w-4 h-4 text-red-600" />}
                              {movement === "same" && <Circle className="w-2 h-2 text-gray-500 fill-gray-500" />}
                              {movement.charAt(0).toUpperCase() + movement.slice(1)}
                            </span>
                          </DropdownMenuCheckboxItem>
                        ))}
                        {draftFilters.movements.length > 0 && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuCheckboxItem
                              indicatorSide="right"
                              checked={false}
                              onCheckedChange={() =>
                                setDraftFilters((prev) => ({ ...prev, movements: [] }))
                              }
                            >
                              Clear
                            </DropdownMenuCheckboxItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <SheetFooter>
                  <Button onClick={handleApplyFilters}>Apply</Button>
                  <Button
                    variant="outline"
                    onClick={() => handleFilterSheetOpenChange(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleClearDraftFilters}
                    disabled={countActiveFilters(draftFilters) === 0}
                  >
                    Clear all
                  </Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        <div className="overflow-x-auto rounded-md border">
          <Table className="min-w-max border-separate border-spacing-0">
            <TableHeader className="bg-muted">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        className={`${getPinnedColumnClasses(header.column, true)} ${getColumnDividerClasses(header.column, true)}`}
                        style={{
                          ...getPinnedColumnStyles(header.column),
                          zIndex: header.column.id === "rank" ? 50 : 40,
                        }}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="group bg-background hover:bg-muted"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={`${getPinnedColumnClasses(cell.column)} ${getColumnDividerClasses(cell.column)}`}
                        style={getPinnedColumnStyles(cell.column)}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex flex-col items-center justify-end gap-4 py-4 md:flex-row">
          {/* Commented out selection count UI per request. If you want it back,
            uncomment the block below. */}
          {/**
        <div className="text-muted-foreground text-sm order-3 md:order-1">
          {table.getFilteredSelectedRowModel().rows.length} of {" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        */}
          <div className="flex flex-col items-center gap-4 md:flex-row">
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  table.previousPage();
                  scrollToTop();
                }}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  table.nextPage();
                  scrollToTop();
                }}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <form
              className="flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                const pageIndex = currentPage - 1;
                if (currentPage > 0 && currentPage <= table.getPageCount()) {
                  table.setPageIndex(pageIndex);
                  scrollToTop();
                }
              }}
            >
              <span className="text-sm text-muted-foreground">Go to:</span>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min="1"
                  max={table.getPageCount()}
                  value={currentPage || ""}
                  onChange={(e) => {
                    const value = +e.target.value;
                    setCurrentPage(value);
                  }}
                  onBlur={() => {
                    if (currentPage < 1 || currentPage > table.getPageCount()) {
                      setCurrentPage(1);
                    }
                  }}
                  className="w-16 rounded-lg border-2"
                />
                <Button type="submit" size="sm" className="rounded-lg">
                  Go
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default Rankings;
