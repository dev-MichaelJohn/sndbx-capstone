import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DataTable } from "@/components/main-data-table";

import type { UserWithDetails, SystemRole } from "backend/types/user.type";
import { useUsers, useDeleteUser } from "../api/user.service";
import { formatFullName } from "@/lib/nameFormatter";
import { getUserColumns } from "../components/UserColumns";
import { UserCreateDialog } from "../components/UserCreate";
import { UserEditDialog } from "../components/UserEdit";
import { UserStatsCards } from "../components/UserStatsCards";

export const UsersPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<Exclude<SystemRole, "SYS_ADMIN"> | "ALL">("ALL");

  // Dialog state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithDetails | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserWithDetails | null>(null);

  const {
    data: usersResponse,
    isPending: isUsersPending,
    isError: isUsersError,
    error: usersError,
  } = useUsers({
    page,
    search: search.trim() || undefined,
    role: roleFilter === "ALL" ? undefined : roleFilter,
  });

  const deleteMutation = useDeleteUser();

  const handleConfirmDelete = async () => {
    if (!deletingUser) return;
    try {
      await deleteMutation.mutateAsync(deletingUser.id);
      toast.success("User account deleted successfully.");
      setDeletingUser(null);
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const columns = getUserColumns({
    onEdit: (user) => setEditingUser(user),
    onDelete: (user) => setDeletingUser(user),
  });

  // Filter out system administrator accounts from display
  const users = useMemo(
    () => (usersResponse?.data ?? []).filter((user) => !user.roles.includes("SYS_ADMIN")),
    [usersResponse?.data],
  );

  // Compute live metrics for the cards
  const stats = useMemo(() => {
    const rawList = usersResponse?.data ?? [];
    return {
      total: usersResponse?.pagination?.totalItems ?? rawList.length,
      students: rawList.filter((u) => u.roles.includes("STUDENT")).length,
      faculty: rawList.filter((u) => u.roles.includes("FACULTY")).length,
      supervisors: rawList.filter((u) => u.roles.includes("SUPERVISOR")).length,
    };
  }, [usersResponse]);

  return (
    <div className="flex h-full flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">User Accounts</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage system accounts, user details, and system role access permissions.
            </p>
          </div>
          <Button
            size="sm"
            className="h-8 rounded-lg text-xs font-medium w-full sm:w-auto gap-1.5"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus className="size-3.5" /> Add User
          </Button>
        </div>

        {/* Dedicated Stat Cards Component */}
        <UserStatsCards
          total={stats.total}
          students={stats.students}
          faculty={stats.faculty}
          supervisors={stats.supervisors}
        />

        {/* Table Section */}
        <Card className="overflow-hidden rounded-xl shadow-xs gap-0 pb-0">
          <CardHeader className="flex items-center justify-between border-b px-6 flex-col gap-2.5 sm:flex-row sm:items-center">
            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search name or ID..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="pl-8 h-8 rounded-lg text-xs"
                />
              </div>

              <Select
                value={roleFilter}
                onValueChange={(val) => {
                  setRoleFilter(val as Exclude<SystemRole, "SYS_ADMIN"> | "ALL");
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-8 w-full sm:w-40 text-xs rounded-lg">
                  <SelectValue placeholder="Filter by Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL" className="text-xs">
                    All Roles
                  </SelectItem>
                  <SelectItem value="STUDENT" className="text-xs">
                    Student
                  </SelectItem>
                  <SelectItem value="FACULTY" className="text-xs">
                    Faculty
                  </SelectItem>
                  <SelectItem value="SUPERVISOR" className="text-xs">
                    Supervisor
                  </SelectItem>
                  <SelectItem value="ADMIN" className="text-xs">
                    Admin
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <DataTable
              columns={columns}
              data={users}
              getRowId={(row) => row.id}
              isLoading={isUsersPending}
              isError={isUsersError}
              error={usersError}
              emptyMessage="No user accounts found matching the criteria."
            />
          </CardContent>
        </Card>
      </div>

      {/* Pagination Footer */}
      <div className="shrink-0 border-t bg-card px-6 py-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {usersResponse?.pagination
              ? `Page ${usersResponse.pagination.currentPage} of ${usersResponse.pagination.totalPage}`
              : "Loading page info..."}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-7 rounded-lg p-0"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!usersResponse?.pagination?.hasPrev || isUsersPending}
            >
              <ChevronLeft className="size-3.5" />
            </Button>
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-xs font-medium text-primary">
              {usersResponse?.pagination?.currentPage ?? 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-7 rounded-lg p-0"
              onClick={() => setPage((p) => p + 1)}
              disabled={!usersResponse?.pagination?.hasNext || isUsersPending}
            >
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Dialog Modals */}
      <UserCreateDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />

      <UserEditDialog
        user={editingUser}
        open={!!editingUser}
        onOpenChange={(open) => {
          if (!open) setEditingUser(null);
        }}
      />

      {/* Delete Confirmation Alert */}
      <AlertDialog open={!!deletingUser} onOpenChange={(open) => !open && setDeletingUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User Account?</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingUser && (
                <>
                  Are you sure you want to soft-delete the account for{" "}
                  <strong>
                    {formatFullName({
                      first_name: deletingUser.first_name,
                      middle_name: deletingUser.middle_name ?? "",
                      last_name: deletingUser.last_name,
                      suffix: deletingUser.suffix ?? "",
                    })}
                  </strong>
                  ? This action will revoke login credentials and system access.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {deleteMutation.isPending ? "Deleting..." : "Yes, delete account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UsersPage;
