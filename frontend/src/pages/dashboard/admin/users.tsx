import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { dashboardKeys } from "@/routes/keys";
import TabView from "@/components/tabs";
import SortItems from "@/components/sort-items";
import TableComponent from "@/components/table/table-component";
import {
  useAdminUsersQuery,
  useVerifyUserMutation,
  useToggleActiveMutation,
} from "@/services/admin/queries";
import type { AdminUser } from "@/types/domain";
import {
  getUsersConfig,
  getVerificationStatus,
  type AdminUsersTableRow,
} from "./users-table-config";
import { adminUsersFilterConfig } from "./users-filter-config";

const { usersColumns, UsersHelper } = getUsersConfig();

const ROLE_TABS = [
  { key: "ALL", name: "All" },
  { key: "ADMIN", name: "Admins" },
  { key: "LANDLORD", name: "Landlord" },
  { key: "TENANT", name: "Tenants" },
] as const;

const SORT_OPTIONS = [
  { title: "Full Name", sortKey: "fullName" },
  { title: "Email", sortKey: "email" },
  { title: "Role", sortKey: "role" },
  { title: "Joined", sortKey: "joined" },
];

const USER_LIST_ACTIONS = [
  { name: "View details", action: "view" },
  { name: "Approve verification", action: "approve" },
  { name: "Toggle active status", action: "toggle", isDelete: true },
];

function exportUsersCsv(users: AdminUser[]) {
  const headers = [
    "Full Name",
    "Email",
    "Phone",
    "Role",
    "Verification",
    "Status",
    "Joined",
  ];
  const rows = users.map((user) => [
    `${user.firstName} ${user.lastName}`.trim(),
    user.email,
    user.phone,
    user.role,
    getVerificationStatus(user),
    user.isActive ? "Active" : "Deactivated",
    user.createdAt,
  ]);
  const csv = [headers, ...rows]
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
    )
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `users-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function sortUsers(users: AdminUser[], sortParams: Record<string, string>) {
  const entry = Object.entries(sortParams).find(([key]) =>
    key.startsWith("sort_"),
  );
  if (!entry) return users;

  const sortKey = entry[0].replace("sort_", "");
  const direction = entry[1] === "desc" ? -1 : 1;

  const getValue = (user: AdminUser): string => {
    switch (sortKey) {
      case "fullName":
        return `${user.firstName} ${user.lastName}`.toLowerCase();
      case "email":
        return user.email.toLowerCase();
      case "role":
        return user.role;
      case "joined":
        return user.createdAt;
      default:
        return "";
    }
  };

  return [...users].sort((a, b) => {
    const left = getValue(a);
    const right = getValue(b);
    if (left < right) return -1 * direction;
    if (left > right) return 1 * direction;
    return 0;
  });
}

export default function AdminUsersPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get("role")?.toUpperCase() ?? "ALL";
  const validRole = ROLE_TABS.some((tab) => tab.key === initialRole)
    ? initialRole
    : "ALL";

  const [activeTab, setActiveTab] = useState(validRole);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortParams, setSortParams] = useState<Record<string, string>>({});
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>();

  const params: Record<string, unknown> = { page, limit: pageSize };
  if (activeTab !== "ALL") params.role = activeTab;
  if (searchQuery.trim()) params.search = searchQuery.trim();
  if (isActiveFilter !== undefined) params.isActive = isActiveFilter;

  const { data, isLoading, isFetching } = useAdminUsersQuery(params);
  const verifyMutation = useVerifyUserMutation();
  const toggleMutation = useToggleActiveMutation();

  const users = data?.users ?? [];
  const meta = data?.meta;

  const tableData = useMemo(
    () => UsersHelper(sortUsers(users, sortParams)),
    [users, sortParams],
  );

  const selectedSortEntry = Object.entries(sortParams).find(([key]) =>
    key.startsWith("sort_"),
  );
  const selectedSort = selectedSortEntry?.[0].replace("sort_", "") ?? "";
  const selectedSortDirection =
    (selectedSortEntry?.[1] as "asc" | "desc" | undefined) ?? undefined;

  const handleFilterChange = (filters: Record<string, string>) => {
    const activeCount = Object.keys(filters).length;
    setActiveFilterCount(activeCount);

    const status = filters.filter_isActive;
    if (status === "true") setIsActiveFilter(true);
    else if (status === "false") setIsActiveFilter(false);
    else setIsActiveFilter(undefined);

    setPage(1);
  };

  const handleActionClick = (action?: string, row?: AdminUsersTableRow) => {
    const user = row?.row;
    if (!user) return;

    if (action === "view") {
      navigate(dashboardKeys.admin.userDetail.build(user.id));
      return;
    }

    if (action === "approve") {
      const verification = getVerificationStatus(user);
      if (user.role === "ADMIN" || verification !== "PENDING") return;
      verifyMutation.mutate({ id: user.id, status: "VERIFIED" });
      return;
    }

    if (action === "toggle" && user.role !== "ADMIN") {
      toggleMutation.mutate(user.id);
    }
  };

  const tableSection = (
    <div className="space-y-4">
      <SortItems
        searchValue={searchQuery}
        searchPlaceholder="Search by name or email..."
        onSearchChange={(value) => {
          setSearchQuery(value);
          setPage(1);
        }}
        sortOptions={SORT_OPTIONS}
        selectedSort={selectedSort}
        selectedSortDirection={selectedSortDirection}
        activeSortCount={selectedSort ? 1 : 0}
        onSortChange={(next) => {
          setSortParams(next);
        }}
        filterConfig={adminUsersFilterConfig}
        activeFilterCount={activeFilterCount}
        onFilterChange={handleFilterChange}
        onExport={() => exportUsersCsv(users)}
      />

      <TableComponent
        data={tableData}
        columns={usersColumns}
        loading={isLoading || isFetching}
        isFiltered={
          !!searchQuery || activeFilterCount > 0 || activeTab !== "ALL"
        }
        emptyState={{
          title: "No users found",
          description:
            searchQuery.trim() || activeFilterCount > 0
              ? "Try a different search term or clear your filters to see more users."
              : "There are no users in this category yet.",
          ...(searchQuery.trim() || activeFilterCount > 0
            ? {
                buttonName: "Clear filters",
                onButtonClick: () => {
                  setSearchQuery("");
                  setActiveFilterCount(0);
                  setIsActiveFilter(undefined);
                  setPage(1);
                },
              }
            : {}),
        }}
        paginate
        meta={{
          total: meta?.total ?? 0,
          page: meta?.page ?? page,
          limit: meta?.limit ?? pageSize,
          hasNext: (meta?.page ?? page) < (meta?.pages ?? 1),
        }}
        handlePaginate={setPage}
        pageSize={pageSize}
        setPageSize={(size) => {
          const next = typeof size === "function" ? size(pageSize) : size;
          setPageSize(next);
          setPage(1);
        }}
        onClickRow={(row) =>
          navigate(dashboardKeys.admin.userDetail.build(row.row.id))
        }
        handleActionClick={handleActionClick}
        isLoadingAction={verifyMutation.isPending || toggleMutation.isPending}
        listActions={USER_LIST_ACTIONS}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/10">
      <div className="container py-8">
        <Link
          to={dashboardKeys.admin.home.path}
          className="mb-6 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>

        <h1 className="mb-6 font-display text-2xl font-bold">
          User Management
        </h1>

        <TabView
          activeTab={activeTab}
          onSelect={(tabKey) => {
            setActiveTab(tabKey);
            setPage(1);
          }}
          tabLabels={ROLE_TABS.map((tab) => ({ name: tab.name, key: tab.key }))}
          tabs={ROLE_TABS.map(() => tableSection)}
        />
      </div>
    </div>
  );
}
