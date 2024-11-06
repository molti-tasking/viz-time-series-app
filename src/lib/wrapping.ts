export type ChartWrappingSettings = {
  /**
   * This value is a threshold. Whenever one of the values of a given range is outside of the a relative range apart from the mean, it will be considered as significant. Should be a number between 0 and 1.
   *
   */
  meanRange: number;
  /**
   * Ticks to be taken into account for the check if there is a relevant threshold. Should be at least 3.
   * @default 3
   */
  tickRange: number;
  mode: "multiline" | "envelope";
};

export const wrapper = (
  rawData: Record<string, number>[],
  dimensions: string[],
  settings: ChartWrappingSettings
) => {
  console.count("Called wrapper");
  const totalTickRange = Math.floor(settings.tickRange) ?? 3;
  const ticksBefore = Math.floor((totalTickRange - 1) / 2);
  const ticksAfter = totalTickRange - ticksBefore;

  const filteredData = [];
  for (let entryIndex = 0; entryIndex < rawData.length; entryIndex++) {
    if (
      entryIndex <= ticksBefore - 1 ||
      entryIndex > rawData.length - ticksAfter
    ) {
      const entry = rawData[entryIndex];
      filteredData.push(entry);
    } else {
      const currentSection = rawData.slice(
        entryIndex - ticksBefore,
        entryIndex + ticksAfter
      );

      let shouldSetValueToUndefined = true;
      for (
        let dimensionIndex = 0;
        dimensionIndex < dimensions.length;
        dimensionIndex++
      ) {
        const dimension = dimensions[dimensionIndex];

        const relativeRange = calculateRelativeRangeB(
          ...currentSection.map((e) => e[dimension])
        );
        if (settings.meanRange > relativeRange) {
        } else {
          shouldSetValueToUndefined = false;
          break;
        }
      }

      const currentEntry = rawData[entryIndex];
      if (shouldSetValueToUndefined) {
        // This has to be defined like this in order to create a new object, rather than just copying the reference.
        const undefinedObject: Record<string, number | undefined> = {
          ...currentEntry,
        };
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
