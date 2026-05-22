import React from "react";
import CopyToClipboard from "@/components/copy-to-clipboard";
import {
  cellType,
  type BaseRowData,
  type RenderComponentsProps,
} from "../types";
import ModifyType from "./action-type";
import BadgeType from "./badge-type";
import SelectionType from "./selection-type";
import StringType from "./string-type";

function normalizeCopyKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function isCopyableTableField(
  column: RenderComponentsProps<BaseRowData>["column"],
) {
  const accessorKey = normalizeCopyKey(String(column.accessor ?? ""));
  const headerKey =
    typeof column.header === "string" ? normalizeCopyKey(column.header) : "";

  return ["employeeid", "employeenumber", "phonenumber"].some(
    (key) => key === accessorKey || key === headerKey,
  );
}

const RenderComponents = <T extends BaseRowData>({
  column,
  row,
  value,
  index,
  handleActionClick,
  isLoading,
  selectedRows,
  handleSelectRow,
  listActions,
}: RenderComponentsProps<T>) => {
  const shouldShowCopy =
    column.type === cellType.STRING &&
    !React.isValidElement(value) &&
    (typeof value === "string" || typeof value === "number") &&
    isCopyableTableField(
      column as RenderComponentsProps<BaseRowData>["column"],
    );

  const components = {
    [cellType.STRING]: shouldShowCopy ? (
      <CopyToClipboard value={String(value)} />
    ) : (
      <StringType value={value} />
    ),
    [cellType.BADGE]: <BadgeType value={String(value)} />,
    [cellType.SELECTIONS]: (
      <SelectionType
        selectedRows={selectedRows}
        handleSelectRow={handleSelectRow}
        index={index}
        item={row}
      />
    ),
    [cellType.ACTIONS]: (
      <ModifyType<T>
        handleActionClick={handleActionClick}
        index={index}
        item={row}
        actions={column.actions}
        isLoading={isLoading}
        listActions={listActions}
      />
    ),
  };
  return (
    components[column?.type] || (
      <span className="text-muted-foreground">Enter Valid type</span>
    )
  );
};
export default RenderComponents;
