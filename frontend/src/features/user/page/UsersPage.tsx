import { useState, useMemo } from "react";
import { Plus, Search, Users, GraduationCap, UserCheck, ShieldCheck, Filter, X, CheckCircle, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader as UiCardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
type VerificationFilter = "ALL" | "VERIFIED" | "UNVERIFIED";

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
  const [verificationFilter, setVerificationFilter] = useState<VerificationFilter>("ALL");

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

  const users = useMemo(() => {
    const filtered = (usersResponse?.data ?? []).filter((user) => !user.roles.includes("SYS_ADMIN"));

    if (verificationFilter === "VERIFIED") {
      return filtered.filter((u) => u.is_verified);
    }
    if (verificationFilter === "UNVERIFIED") {
      return filtered.filter((u) => !u.is_verified);
    }
    return filtered;
  }, [usersResponse?.data, verificationFilter]);

  const rawList = usersResponse?.data ?? [];
  const stats = useMemo(
    () => ({
      total: usersResponse?.pagination?.totalItems ?? rawList.length,
      students: rawList.filter((u) => u.roles.includes("STUDENT")).length,
      faculty: rawList.filter((u) => u.roles.includes("FACULTY")).length,
      supervisors: rawList.filter((u) => u.roles.includes("SUPERVISOR")).length,
      verified: rawList.filter((u) => u.is_verified).length,
      unverified: rawList.filter((u) => !u.is_verified).length,
    }),
    [usersResponse, rawList],
  );

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (personaTab !== "ALL") count++;
    if (verificationFilter !== "ALL") count++;
    if (search.trim()) count++;
    return count;
  }, [personaTab, verificationFilter, search]);

  const handleClearFilters = () => {
    setPersonaTab("ALL");
    setVerificationFilter("ALL");
    setSearch("");
    setPage(1);
  };

  const handleStatCardClick = (filterType: PersonaTab) => {
    setPersonaTab(filterType);
    setPage(1);
  };

  return (
    <div className="flex h-full flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
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

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <button
            onClick={() => handleStatCardClick("ALL")}
            className="text-left transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl"
          >
            <StatCard
              title="Total Accounts"
              value={stats.total}
              subtitle="Registered users"
              icon={Users}
              accent="violet"
              isLoading={isUsersPending}
            />
          </button>
          <button
            onClick={() => handleStatCardClick("STUDENT")}
            className="text-left transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl"
          >
            <StatCard
              title="Students"
              value={stats.students}
              subtitle="Enrolled student body"
              icon={GraduationCap}
              accent="emerald"
              isLoading={isUsersPending}
            />
          </button>
          <button
            onClick={() => handleStatCardClick("FACULTY")}
            className="text-left transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl"
          >
            <StatCard
              title="Faculty Members"
              value={stats.faculty}
              subtitle="Teaching staff"
              icon={UserCheck}
              accent="sky"
              isLoading={isUsersPending}
            />
          </button>
          <button
            onClick={() => handleStatCardClick("ADMIN")}
            className="text-left transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl"
          >
            <StatCard
              title="Supervisors"
              value={stats.supervisors}
              subtitle="Deans & Chairs"
              icon={ShieldCheck}
              accent="indigo"
              isLoading={isUsersPending}
            />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <Tabs
              value={personaTab}
              onValueChange={(val) => {
                setPersonaTab(val as PersonaTab);
                setPage(1);
              }}
              className="w-full lg:w-auto"
            >
              <TabsList className="grid h-9 w-full grid-cols-4 rounded-lg bg-muted/60 p-1 lg:w-[440px]">
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

            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative flex-1 lg:flex-initial lg:w-64">
                <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search name or ID..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="h-9 rounded-lg pl-8 text-xs bg-card"
                />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 rounded-lg text-xs font-medium gap-1.5 relative"
                  >
                    <Filter className="size-3.5" />
                    Filters
                    {activeFiltersCount > 0 && (
                      <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-[10px] font-bold">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl">
                  <DropdownMenuLabel className="text-xs font-semibold">Verification Status</DropdownMenuLabel>
                  <DropdownMenuCheckboxItem
                    checked={verificationFilter === "ALL"}
                    onCheckedChange={() => {
                      setVerificationFilter("ALL");
                      setPage(1);
                    }}
                    className="text-xs"
                  >
                    All Users ({stats.total})
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={verificationFilter === "VERIFIED"}
                    onCheckedChange={() => {
                      setVerificationFilter("VERIFIED");
                      setPage(1);
                    }}
                    className="text-xs"
                  >
                    <CheckCircle className="mr-2 size-3.5 text-emerald-500" />
                    Verified ({stats.verified})
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={verificationFilter === "UNVERIFIED"}
                    onCheckedChange={() => {
                      setVerificationFilter("UNVERIFIED");
                      setPage(1);
                    }}
                    className="text-xs"
                  >
                    <AlertCircle className="mr-2 size-3.5 text-amber-500" />
                    Unverified ({stats.unverified})
                  </DropdownMenuCheckboxItem>
                  {activeFiltersCount > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      <button
                        onClick={handleClearFilters}
                        className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                      >
                        <X className="size-3.5" />
                        Clear all filters
                      </button>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <ViewSwitcher mode={viewMode} onChange={setViewMode} />
            </div>
          </div>

          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground font-medium">Active filters:</span>
              {personaTab !== "ALL" && (
                <Badge
                  variant="secondary"
                  className="gap-1.5 text-xs font-medium cursor-pointer hover:bg-secondary/80"
                  onClick={() => {
                    setPersonaTab("ALL");
                    setPage(1);
                  }}
                >
                  Role: {personaTab}
                  <X className="size-3" />
                </Badge>
              )}
              {verificationFilter !== "ALL" && (
                <Badge
                  variant="secondary"
                  className="gap-1.5 text-xs font-medium cursor-pointer hover:bg-secondary/80"
                  onClick={() => {
                    setVerificationFilter("ALL");
                    setPage(1);
                  }}
                >
                  Status: {verificationFilter}
                  <X className="size-3" />
                </Badge>
              )}
              {search.trim() && (
                <Badge
                  variant="secondary"
                  className="gap-1.5 text-xs font-medium cursor-pointer hover:bg-secondary/80"
                  onClick={() => {
                    setSearch("");
                    setPage(1);
                  }}
                >
                  Search: "{search.trim()}"
                  <X className="size-3" />
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="h-7 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                Clear all
              </Button>
            </div>
          )}

          {viewMode === "grid" ? (
            isUsersPending ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-52 rounded-xl border bg-card animate-pulse" />
                ))}
              </div>
            ) : users.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed bg-card/50 text-center">
                <Users className="size-12 text-muted-foreground/40 mb-3" />
                <p className="text-sm font-medium text-foreground mb-1">No users found</p>
                <p className="text-xs text-muted-foreground max-w-sm">
                  {activeFiltersCount > 0
                    ? "Try adjusting your filters or search criteria"
                    : "Get started by adding your first user account"}
                </p>
                {activeFiltersCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearFilters}
                    className="mt-4 h-8 text-xs"
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
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
            <Card className="overflow-hidden rounded-xl pb-0 shadow-sm">
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

      <TablePagination
        pagination={usersResponse?.pagination}
        isPending={isUsersPending}
        onPageChange={setPage}
      />

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
