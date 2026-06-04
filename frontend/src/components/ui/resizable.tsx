import type * as React from 'react';
import * as ResizablePrimitive from 'react-resizable-panels';

import { cn } from '@/lib/utils';

type PrimitivePanelGroupComponent = React.ComponentType<{
  children?: React.ReactNode;
  className?: string;
}>;

type PrimitivePanelComponent = React.ComponentType<{
  children?: React.ReactNode;
}>;

type PrimitivePanelResizeHandleComponent = React.ComponentType<{
  children?: React.ReactNode;
  className?: string;
}>;

const {
  PanelGroup: PrimitivePanelGroup,
  Panel: PrimitivePanel,
  PanelResizeHandle: PrimitivePanelResizeHandle,
} = ResizablePrimitive as unknown as {
  PanelGroup: PrimitivePanelGroupComponent;
  Panel: PrimitivePanelComponent;
  PanelResizeHandle: PrimitivePanelResizeHandleComponent;
};

const ResizablePanelGroup = ({
  className,
  ...props
}: React.ComponentProps<PrimitivePanelGroupComponent>) => {
  return (
    <PrimitivePanelGroup
      data-slot="resizable-panel-group"
      className={cn(
        'flex h-full w-full data-[panel-group-direction=vertical]:flex-col',
        className
      )}
      {...props}
    />
  );
};

const ResizablePanel = ({ ...props }: React.ComponentProps<PrimitivePanelComponent>) => {
  return <PrimitivePanel data-slot="resizable-panel" {...props} />;
};

const ResizableHandle = ({
  withHandle,
  className,
  ...props
}: React.ComponentProps<PrimitivePanelResizeHandleComponent> & {
  withHandle?: boolean;
}) => {
  return (
    <PrimitivePanelResizeHandle
      data-slot="resizable-handle"
      className={cn(
        'bg-border focus-visible:ring-ring relative flex w-px items-center justify-center after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:outline-hidden data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:translate-x-0 data-[panel-group-direction=vertical]:after:-translate-y-1/2 [&[data-panel-group-direction=vertical]>div]:rotate-90',
        className
      )}
      {...props}
    >
      {withHandle && <div className="bg-border h-6 w-1 rounded-lg z-10 flex shrink-0" />}
    </PrimitivePanelResizeHandle>
  );
};

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
