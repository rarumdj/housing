import { Checkbox } from '@/components/ui/checkbox';
import type { BaseRowData, SelectionProps } from '../types';

const SelectionType = <T extends BaseRowData>({
  selectedRows,
  handleSelectRow,
  index,
  item,
}: SelectionProps<T>) => {
  return (
    <Checkbox
      checked={selectedRows.has(item)}
      onCheckedChange={() => handleSelectRow?.(item)}
      key={index}
    />
  );
};

export default SelectionType;
