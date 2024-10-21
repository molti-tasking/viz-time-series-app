/**
 *
 * @param values Each record in the list has a "timestamp" value and further values.
 * @param groups The length of the return array
 * @returns A list of list of records. Each record should have again the timestamp value but the further values should be distributed evenly across the list of records.
 */
export const clustering = (
  values: Record<string, number>[],
  groups: number
): Record<string, number>[][] => {
  // Prepare the result array with the specified number of groups.
  const res: Record<string, number>[][] = Array.from(
    { length: groups },
    () => []
  );

  // Extract all column names except for 'timestamp'.
  const allColumns = Object.keys(values[0] || {}).filter(
    (key) => key !== "timestamp"
  );

  // Calculate how many columns per group (distribute as evenly as possible).
  const columnsPerGroup = Math.ceil(allColumns.length / groups);

  // Create the column groups.
  const columnGroups = Array.from({ length: groups }, (_, i) =>
    allColumns.slice(i * columnsPerGroup, (i + 1) * columnsPerGroup)
  );

  // Iterate over each record and split into groups based on the column groups.
  values.forEach((record) => {
    columnGroups.forEach((columns, groupIndex) => {
      // Create a new record for the group containing the timestamp and the selected columns.
      const groupRecord: Record<string, number> = {
        timestamp: record.timestamp,
      };
      columns.forEach((col) => {
        if (col in record) {
          groupRecord[col] = record[col];
        }
      });
      // Push the grouped record into the respective group.
      res[groupIndex].push(groupRecord);
    });
  });

  return res;
};
