import { useDivisionQuery } from './useDivisionQuery';
import type { SelectOption } from '@presentation/components/SelectField';
import type { DivisionId } from '@core/domain/ids';

/**
 * Fetch members dari divisi tertentu dan return sebagai SelectOption[].
 * Dipakai untuk assignee picker di form task.
 */
export const useDivisionMembersOptions = (
  divisionId: string | null,
): { options: SelectOption[]; isLoading: boolean } => {
  // divisionId dari navigation params adalah string — treat sebagai DivisionId
  // di hook boundary ini (bukan mapper, tapi nilai datang dari entity yang sudah typed)
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const id = (divisionId ?? '') as DivisionId;
  const { data, isLoading } = useDivisionQuery(id);

  if (!divisionId || !data) return { options: [], isLoading: divisionId ? isLoading : false };

  const options: SelectOption[] = data.members.map(m => ({
    label: m.fullName,
    value: m.userId,
    description: m.email,
  }));

  return { options, isLoading };
};
