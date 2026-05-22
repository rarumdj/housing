import { MoreVertical, Pencil } from 'lucide-react';
import { Fragment, useCallback } from "react";
import { Button, buttonVariants } from "../../ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import type { BaseRowData, ModifyProps } from "../types";

const ModifyType = <T extends BaseRowData>({
  handleActionClick,
  item,
  actions,
  listActions,
}: ModifyProps<T>) => {
  const memoizedHandleActionClick = useCallback(
    (action: string, item: T) => handleActionClick?.(action, item),
    [handleActionClick],
  );

  const show = actions || ["edit", "delete"];

  return (
    <div
      className="flex items-center justify-end"
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      {show.includes("kebab") && listActions?.length ? (
        <DropdownMenu modal>
          <DropdownMenuTrigger
            type="button"
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon-sm" }),
              "text-muted-foreground data-popup-open:bg-muted",
            )}
          >
            <MoreVertical className="size-4" />
            <span className="sr-only">Open menu</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 whitespace-nowrap">
            {listActions.map((list) =>
              list.isDelete ? (
                <Fragment key={`${list.action}-${list.name}`}>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() =>
                      memoizedHandleActionClick(list.action, item)
                    }
                  >
                    {list.name}
                  </DropdownMenuItem>
                </Fragment>
              ) : (
                <DropdownMenuItem
                  key={`${list.action}-${list.name}`}
                  onClick={() => memoizedHandleActionClick(list.action, item)}
                >
                  {list.name}
                </DropdownMenuItem>
              ),
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
      {show.includes("edit") && (
        <Button
          variant="ghost"
          className="text-muted-foreground flex size-8"
          size="icon"
          onClick={() => memoizedHandleActionClick("edit", item)}>
          <Pencil className="size-4" />
          <span className="sr-only">Edit</span>
        </Button>
      )}
    </div>
  );
};
export default ModifyType;
