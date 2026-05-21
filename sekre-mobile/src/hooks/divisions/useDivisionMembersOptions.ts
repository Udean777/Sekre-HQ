import { useDivisionQuery } from './useDivisionQuery';
import type { SelectOption } from '@presentation/components/SelectField';
import type { DivisionId } from '@core/domain/entities/Division';

/**
 * Fetch members dari divisi tertentu dan return sebagai SelectOption[].
 * Dipakai untuk assignee picker di form task.
 */
export const useDivisionMembersOptions = (
  divisionId: string | null,
): { options: SelectOption[]; isLoading: boolean } => {
  const { data, isLoading } = useDivisionQuery((divisionId ?? '') as DivisionId);

  if (!divisionId || !data) return { options: [], isLoading: divisionId ? isLoading : false };

  const options: SelectOption[] = data.members.map(m => ({
    label: m.fullName,
    value: m.userId,
    description: m.email,
  }));

  return { options, isLoading };
};
