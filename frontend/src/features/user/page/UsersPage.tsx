import { useState, useMemo } from "react";
import { Plus, Search, Users, GraduationCap, UserCheck, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader as UiCardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { TablePagination } from "@/components/table-pagination";
import { StatCard } from "@/components/ui/stat-card";
import { ViewSwitcher, type ViewMode } from "@/components/ui/view-switcher";
import { PageHeader } from "@/components/ui/page-header";

import type { UserWithDetails, SystemRole } from "backend/types/user.type";
import { useUsers, useDeleteUser } from "../api/user.service";
import { formatFullName } from "@/lib/nameFormatter";
import { getUserColumns } from "../components/UserColumns";
import { UserCard } from "../components/UserCard";
import { UserProfileDrawer } from "../components/UserProfileDrawer";
import { UserCreateDialog } from "../components/UserCreate";
import { UserEditDialog } from "../components/UserEdit";
import { useUser } from "@/features/auth/context/user.context";
import { CSVImportDialog } from "@/features/bulk-import/components/CSVImportDialog";

type PersonaTab = "ALL" | "STUDENT" | "FACULTY" | "ADMIN";

export const UsersPage = () => {
  const { user: currentUser } = useUser();
  const isSysAdmin = useMemo(
    () => currentUser?.roles?.includes("SYS_ADMIN") ?? false,
    [currentUser],
  );

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [personaTab, setPersonaTab] = useState<PersonaTab>("ALL");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // Inspection & Dialog States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [inspectUser, setInspectUser] = useState<UserWithDetails | null>(null);
  const [editingUser, setEditingUser] = useState<UserWithDetails | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserWithDetails | null>(null);

  const roleFilter = personaTab === "ALL" ? undefined : (personaTab as SystemRole);

  const {
    data: usersResponse,
    isPending: isUsersPending,
    isError: isUsersError,
    error: usersError,
    refetch,
  } = useUsers({
    page,
    search: search.trim() || undefined,
    role: roleFilter,
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
    isSysAdmin,
  });

  const users = useMemo(
    () => (usersResponse?.data ?? []).filter((user) => !user.roles.includes("SYS_ADMIN")),
    [usersResponse?.data],
  );

  const rawList = usersResponse?.data ?? [];
  const stats = useMemo(
    () => ({
      total: usersResponse?.pagination?.totalItems ?? rawList.length,
      students: rawList.filter((u) => u.roles.includes("STUDENT")).length,
      faculty: rawList.filter((u) => u.roles.includes("FACULTY")).length,
      supervisors: rawList.filter((u) => u.roles.includes("SUPERVISOR")).length,
    }),
    [usersResponse, rawList],
  );

  return (
    <div className="flex h-full flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
        {/* Header */}
        <PageHeader
          title="User Accounts"
          description="Manage system accounts, user profiles, and role access permissions."
          actions={
            <div className="flex items-center gap-2">
              <CSVImportDialog entity="users" title="Import Users" onSuccess={() => refetch()} />
              <Button
                size="sm"
                className="h-8 rounded-lg text-xs font-medium gap-1.5 cursor-pointer"
                onClick={() => setIsCreateOpen(true)}
              >
                <Plus className="size-3.5" /> Add User
              </Button>
            </div>
          }
        />

        {/* Stat Cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Accounts"
            value={stats.total}
            subtitle="Registered users"
            icon={Users}
            accent="violet"
            isLoading={isUsersPending}
          />
          <StatCard
            title="Students"
            value={stats.students}
            subtitle="Enrolled student body"
            icon={GraduationCap}
            accent="emerald"
            isLoading={isUsersPending}
          />
          <StatCard
            title="Faculty Members"
            value={stats.faculty}
            subtitle="Teaching staff"
            icon={UserCheck}
            accent="sky"
            isLoading={isUsersPending}
          />
          <StatCard
            title="Supervisors"
            value={stats.supervisors}
            subtitle="Deans & Chairs"
            icon={ShieldCheck}
            accent="indigo"
            isLoading={isUsersPending}
          />
        </div>

        {/* Persona Tabs & Controls */}
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Tabs
              value={personaTab}
              onValueChange={(val) => {
                setPersonaTab(val as PersonaTab);
                setPage(1);
              }}
              className="w-full sm:w-auto"
            >
              <TabsList className="grid h-9 w-full grid-cols-4 rounded-lg bg-muted/60 p-1 sm:w-110">
                <TabsTrigger value="ALL" className="text-xs font-medium rounded-md">
                  All Users
                </TabsTrigger>
                <TabsTrigger value="STUDENT" className="text-xs font-medium rounded-md">
                  Students
                </TabsTrigger>
                <TabsTrigger value="FACULTY" className="text-xs font-medium rounded-md">
                  Faculty
                </TabsTrigger>
                <TabsTrigger value="ADMIN" className="text-xs font-medium rounded-md">
                  Admins
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search name or ID..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="h-8 rounded-lg pl-8 text-xs bg-card"
                />
              </div>

              <ViewSwitcher mode={viewMode} onChange={setViewMode} />
            </div>
          </div>

          {/* Grid View vs Table View */}
          {viewMode === "grid" ? (
            isUsersPending ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-44 rounded-xl border bg-card animate-pulse" />
                ))}
              </div>
            ) : users.length === 0 ? (
              <div className="flex h-48 flex-col items-center justify-center rounded-xl border border-dashed bg-card text-center text-xs text-muted-foreground">
                No user accounts found matching criteria.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {users.map((u: UserWithDetails) => (
                  <UserCard
                    key={u.id}
                    user={u}
                    onViewProfile={(selected) => setInspectUser(selected)}
                    onEdit={(selected) => setEditingUser(selected)}
                    onDelete={(selected) => setDeletingUser(selected)}
                    canManage={isSysAdmin || !u.roles.includes("ADMIN")}
                  />
                ))}
              </div>
            )
          ) : (
            <Card className="overflow-hidden rounded-xl pb-0 shadow-2xs">
              <UiCardHeader className="hidden" />
              <CardContent className="p-0">
                <DataTable
                  columns={columns}
                  data={users}
                  getRowId={(row) => row.id}
                  isLoading={isUsersPending}
                  isError={isUsersError}
                  error={usersError}
                  emptyMessage="No user accounts found."
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Pagination */}
      <TablePagination
        pagination={usersResponse?.pagination}
        isPending={isUsersPending}
        onPageChange={setPage}
      />

      {/* Modals & Inspection Drawers */}
      <UserCreateDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />

      <UserEditDialog
        user={editingUser}
        open={!!editingUser}
        onOpenChange={(open) => {
          if (!open) setEditingUser(null);
        }}
      />

      <UserProfileDrawer
        user={inspectUser}
        onClose={() => setInspectUser(null)}
        onEdit={(u) => setEditingUser(u)}
        onDelete={(u) => setDeletingUser(u)}
        canManage={isSysAdmin || (inspectUser ? !inspectUser.roles.includes("ADMIN") : false)}
      />

      {/* Delete Confirmation Alert */}
      <AlertDialog open={!!deletingUser} onOpenChange={(open) => !open && setDeletingUser(null)}>
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-semibold">
              Delete User Account?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              {deletingUser && (
                <>
                  Are you sure you want to soft-delete the account for{" "}
                  <strong className="text-foreground">
                    {formatFullName({
                      first_name: deletingUser.first_name,
                      middle_name: deletingUser.middle_name ?? "",
                      last_name: deletingUser.last_name,
                      suffix: deletingUser.suffix ?? "",
                    })}
                  </strong>
                  ? This will revoke login access.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={deleteMutation.isPending}
              className="h-8 rounded-lg text-xs"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
              className="h-8 rounded-lg bg-destructive text-xs text-destructive-foreground hover:bg-destructive/90"
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
