export type ChartWrappingSettings = {
  /**
   * A number between 0 and 1 to be used as a percentage and based on it there will be different clusters created, but the resulting cluster count will be unknown
   */
  eps: number;
};

export const wrapper = (
  rawData: Record<string, number>[],
  dimensions: string[],
  settings: ChartWrappingSettings
) => {
  console.count("Called wrapper");

  const filteredData = [];
  for (let entryIndex = 0; entryIndex < rawData.length; entryIndex++) {
    if (entryIndex === 0 || entryIndex > rawData.length - 2) {
      const entry = rawData[entryIndex];
      filteredData.push(entry);
    } else {
      const prevEntry = rawData[entryIndex - 1];
      const currentEntry = rawData[entryIndex];
      const nextEntry = rawData[entryIndex + 1];

      let shouldSetValueToUndefined = true;
      for (
        let dimensionIndex = 0;
        dimensionIndex < dimensions.length;
        dimensionIndex++
      ) {
        const dimension = dimensions[dimensionIndex];
        const prevValue = prevEntry[dimension];
        const currentValue = currentEntry[dimension];
        const nextValue = nextEntry[dimension];
        const relativeRange = calculateRelativeRangeB(
          prevValue,
          currentValue,
          nextValue
        );
        if (settings.eps > relativeRange) {
        } else {
          shouldSetValueToUndefined = false;
          break;
        }
      }
      if (shouldSetValueToUndefined) {
        // This has to be defined like this in order to create a new object, rather than just copying the reference.
        const undefinedObject = { ...currentEntry };
        for (
          let dimensionIndex = 0;
          dimensionIndex < dimensions.length;
          dimensionIndex++
        ) {
          const dimension = dimensions[dimensionIndex];
          undefinedObject[dimension] = undefined;
        }

        filteredData.push(undefinedObject);
      } else {
        filteredData.push(currentEntry);
      }
    }
  }

  return { filteredData };
};

export const calculateRelativeRangeA = (...numbers: number[]) => {
  // Calculate the mean
  const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;

  // Find minimum and maximum
  const min = Math.min(...numbers);
  const max = Math.max(...numbers);

  // Calculate the absolute range
  const absoluteRange = max - min;

  // Calculate the absolute range relative to the mean
  return absoluteRange / mean;
};
export const calculateRelativeRangeB = (...numbers: number[]) => {
  // Initialize variables for sum, min, and max
  let sum = 0;
  let min = Infinity;
  let max = -Infinity;

  // Single pass to compute sum, min, and max
  for (const num of numbers) {
    sum += num;
    if (num < min) min = num;
    if (num > max) max = num;
  }

  // Calculate the mean
  const mean = sum / numbers.length;

  // Calculate the absolute range
  const absoluteRange = max - min;

  // Calculate the absolute range relative to the mean
  return absoluteRange / mean;
};
