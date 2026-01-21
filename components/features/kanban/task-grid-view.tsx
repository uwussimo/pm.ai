"use client";

import React, { useMemo, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import {
    ColDef,
    CellClickedEvent,
    RowDragEvent,
    ValueFormatterParams,
    ModuleRegistry,
    AllCommunityModule,
    themeQuartz,
} from "ag-grid-community";
import { Badge } from "@/components/ui/badge";
import { UserAvatar, getUserDisplayName } from "@/components/ui/user-avatar";
import { CalendarIcon, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

// Create custom theme based on Quartz
const customTheme = themeQuartz.withParams({
    // Colors
    backgroundColor: "hsl(var(--background))",
    foregroundColor: "hsl(var(--foreground))",
    borderColor: "hsl(var(--border))",
    headerBackgroundColor: "hsl(var(--muted))",
    headerTextColor: "hsl(var(--foreground))",
    oddRowBackgroundColor: "hsl(var(--background))",

    // Interactive states
    rowHoverColor: "hsl(var(--accent) / 0.5)",
    selectedRowBackgroundColor: "hsl(var(--accent))",

    // Spacing & Typography
    fontFamily: "var(--font-geist-sans)",
    fontSize: 14,
    cellHorizontalPadding: 16,
    headerFontWeight: 600,
    borderRadius: 8,

    // Row styling
    rowBorder: true,
    wrapperBorder: true,
});

interface Task {
    id: string;
    title: string;
    description: string | null;
    statusId: string;
    priority: string;
    order: number;
    assignee: {
        id: string;
        email: string;
        name?: string | null;
        githubUrl?: string | null;
    } | null;
    dueDate: string | null;
    status: {
        id: string;
        name: string;
        color: string;
        unicode: string;
    };
    _count: { comments: number };
    createdAt: string;
    updatedAt: string;
}

interface User {
    id: string;
    email: string;
    name?: string | null;
    githubUrl?: string | null;
}

interface TaskGridViewProps {
    tasks: Task[];
    statuses: Array<{
        id: string;
        name: string;
        color: string;
        unicode: string;
    }>;
    projectUsers: User[];
    onTaskClick: (taskId: string) => void;
    onTaskUpdate?: (taskId: string, updates: Record<string, unknown>) => void;
    onTaskReorder?: (taskId: string, newOrder: number, statusId: string) => void;
}

const PriorityBadge = ({ priority }: { priority: string }) => {
    const colors: Record<string, string> = {
        low: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
        medium:
            "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
        high: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
        urgent: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    };

    return (
        <Badge
            className={cn(
                "text-xs font-medium px-2 py-0.5",
                colors[priority] || colors.medium
            )}
        >
            {priority.charAt(0).toUpperCase() + priority.slice(1)}
        </Badge>
    );
};

export function TaskGridView({
    tasks,
    statuses,
    onTaskClick,
    onTaskUpdate,
    onTaskReorder,
}: TaskGridViewProps) {
    // Sort tasks by order to maintain proper display order
    const sortedTasks = useMemo(() => {
        return [...tasks].sort((a, b) => a.order - b.order);
    }, [tasks]);

    const columnDefs = useMemo<ColDef[]>(
        () => [
            {
                field: "title",
                headerName: "Task",
                flex: 2,
                cellRenderer: (params: ValueFormatterParams) => {
                    const data = params.data as Task;
                    return (
                        <div className="flex flex-col py-2">
                            <span className="font-medium text-sm">{params.value}</span>
                            {data.description && (
                                <span className="text-xs text-muted-foreground line-clamp-1">
                                    {data.description}
                                </span>
                            )}
                        </div>
                    );
                },
                rowDrag: true,
            },
            {
                field: "status.name",
                headerName: "Status",
                flex: 1,
                cellRenderer: (params: ValueFormatterParams) => {
                    const status = params.data.status;
                    return (
                        <div className="flex items-center gap-2">
                            <span>{status.unicode}</span>
                            <span className="text-sm">{status.name}</span>
                        </div>
                    );
                },
                editable: true,
                cellEditor: "agSelectCellEditor",
                cellEditorParams: {
                    values: statuses.map((s) => s.name),
                },
            },
            {
                field: "priority",
                headerName: "Priority",
                flex: 0.8,
                cellRenderer: (params: ValueFormatterParams) => {
                    return <PriorityBadge priority={params.value} />;
                },
                editable: true,
                cellEditor: "agSelectCellEditor",
                cellEditorParams: {
                    values: ["low", "medium", "high", "urgent"],
                },
            },
            {
                field: "assignee",
                headerName: "Assignee",
                flex: 1,
                cellRenderer: (params: ValueFormatterParams) => {
                    const assignee = params.value;
                    if (!assignee) {
                        return (
                            <span className="text-sm text-muted-foreground">Unassigned</span>
                        );
                    }
                    return (
                        <div className="flex items-center gap-2">
                            <UserAvatar user={assignee} size="sm" className="h-6 w-6" />
                            <span className="text-sm">{getUserDisplayName(assignee)}</span>
                        </div>
                    );
                },
            },
            {
                field: "dueDate",
                headerName: "Due Date",
                flex: 1,
                cellRenderer: (params: ValueFormatterParams) => {
                    if (!params.value) {
                        return (
                            <span className="text-sm text-muted-foreground">No due date</span>
                        );
                    }
                    const dateStr = params.value.split("T")[0];
                    const date = new Date(dateStr + "T00:00:00");
                    const isOverdue = date < new Date();
                    return (
                        <div
                            className={cn(
                                "inline-flex items-center gap-1.5 text-sm",
                                isOverdue && "text-red-600 dark:text-red-400"
                            )}
                        >
                            <CalendarIcon className="h-4 w-4" />
                            <span>
                                {date.toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                })}
                            </span>
                        </div>
                    );
                },
            },
            {
                field: "_count.comments",
                headerName: "Comments",
                flex: 0.6,
                cellRenderer: (params: ValueFormatterParams) => {
                    if (params.value === 0) return null;
                    return (
                        <div className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                            <MessageSquare className="h-4 w-4" />
                            <span>{params.value}</span>
                        </div>
                    );
                },
            },
            {
                field: "createdAt",
                headerName: "Created",
                flex: 1,
                cellRenderer: (params: ValueFormatterParams) => {
                    const date = new Date(params.value);
                    return (
                        <span className="text-sm text-muted-foreground">
                            {date.toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                            })}
                        </span>
                    );
                },
            },
        ],
        [statuses]
    );

    const defaultColDef = useMemo<ColDef>(
        () => ({
            sortable: true,
            filter: true,
            resizable: true,
        }),
        []
    );

    const onCellClicked = useCallback(
        (event: CellClickedEvent) => {
            if (event.column.getColId() !== "title") return;
            onTaskClick(event.data.id);
        },
        [onTaskClick]
    );

    const onCellValueChanged = useCallback(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (event: any) => {
            if (!onTaskUpdate) return;

            const updates: Record<string, unknown> = {};
            const field = event.column.getColId();

            if (field === "status.name") {
                const status = statuses.find((s) => s.name === event.newValue);
                if (status) {
                    updates.statusId = status.id;
                }
            } else if (field === "priority") {
                updates.priority = event.newValue;
            }

            if (Object.keys(updates).length > 0) {
                onTaskUpdate(event.data.id, updates);
            }
        },
        [onTaskUpdate, statuses]
    );

    const onRowDragEnd = useCallback(
        (event: RowDragEvent) => {
            if (!onTaskReorder || !event.node.data || event.overIndex === undefined)
                return;

            const taskId = event.node.data.id;
            const newOrder = event.overIndex;
            const statusId = event.node.data.statusId;

            onTaskReorder(taskId, newOrder, statusId);
        },
        [onTaskReorder]
    );

    return (
        <div style={{ height: 600, width: "100%" }}>
            <AgGridReact
                theme={customTheme}
                rowData={sortedTasks}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                onCellClicked={onCellClicked}
                onCellValueChanged={onCellValueChanged}
                onRowDragEnd={onRowDragEnd}
                rowDragManaged={false}
                animateRows={true}
                pagination={true}
                paginationPageSize={20}
                domLayout="autoHeight"
                rowHeight={60}
                getRowId={(params) => params.data.id}
            />
        </div>
    );
}
