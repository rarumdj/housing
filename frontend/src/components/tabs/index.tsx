import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

interface TabLabel {
  name: string;
  key: string;
  badgeCount?: number;
}

interface TabProps {
  tabLabels: TabLabel[];
  activeTab: string;
  onSelect: (tabKey: string) => void;
  tabs: React.ReactNode[];
  isLoading?: boolean;
  skeleton?: React.ReactNode;
  className?: string;
  listClassName?: string;
  variant?: 'line' | 'default';
  triggerClassName?: string;
  contentClassName?: string;
}

/** Line tabs: orange active label + thick underline on full-width grey border (reference design). */
const lineTabsListClass =
  'h-auto w-full justify-start rounded-none border-b border-border bg-transparent p-0';

const lineTabsTriggerClass =
  'min-w-0 flex-none shadow-none focus-visible:ring-0';

const TabView = ({
  tabLabels,
  activeTab,
  onSelect,
  tabs,
  isLoading,
  skeleton,
  className,
  listClassName,
  triggerClassName,
  variant = 'line',
  contentClassName,
}: TabProps) => {
  const isLine = variant === 'line';

  return (
    <Tabs
      defaultValue={activeTab}
      value={activeTab}
      onValueChange={onSelect}
      className={cn('w-full', className)}
    >
      <TabsList
        variant={variant}
        className={cn(
          isLine ? lineTabsListClass : 'w-full justify-start border-b border-border',
          listClassName
        )}
      >
        {tabLabels.map((tab) => (
          <TabsTrigger
            key={tab.key}
            value={tab.key}
            className={cn(isLine && lineTabsTriggerClass, triggerClassName)}
          >
            {tab.name}
            {tab.badgeCount ? (
              <Badge variant="destructive">{tab.badgeCount}</Badge>
            ) : null}
          </TabsTrigger>
        ))}
      </TabsList>

      {isLoading ? (
        <TabsContent value={activeTab} className={cn('mt-6 space-y-8', contentClassName)}>
          {skeleton}
        </TabsContent>
      ) : (
        tabLabels.map((tab, idx) => (
          <TabsContent
            key={tab.key}
            value={tab.key}
            className={cn('mt-6 space-y-8', contentClassName)}
          >
            {tabs[idx]}
          </TabsContent>
        ))
      )}
    </Tabs>
  );
};

export default TabView;
