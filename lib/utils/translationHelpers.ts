import { TFunction } from 'i18next';
import { MeasurementUnit } from '../constants/MeasurementUnits';

/**
 * Translates a measurement unit using the translation function
 */
export const translateMeasurementUnit = (
  t: TFunction,
  unitId: string,
  originalUnit: MeasurementUnit
): MeasurementUnit => {
  return {
    ...originalUnit,
    oneName: t(`units.${unitId}.oneName`, {
      defaultValue: originalUnit.oneName,
    }),
    name: t(`units.${unitId}.name`, { defaultValue: originalUnit.name }),
    shortName: t(`units.${unitId}.shortName`, {
      defaultValue: originalUnit.shortName,
    }),
  };
};

/**
 * Translates category names
 */
export const translateCategory = (t: TFunction, categoryId: string): string => {
  return t(`categories.${categoryId}`, { defaultValue: categoryId });
};

/**
 * Formats progress text with proper pluralization
 */
export const formatProgressText = (
  t: TFunction,
  currentValue: number,
  goalValue: number,
  unitId?: string
): string => {
  if (unitId) {
    const unitKey = `units.${unitId}.${goalValue === 1 ? 'oneName' : 'name'}`;
    const unitName = t(unitKey, { defaultValue: unitId });
    return `${currentValue}/${goalValue} ${unitName.toLowerCase()}`;
  }

  return `${currentValue}/${goalValue}`;
};

/**
 * Translates achievement names with dynamic values
 */
export const translateAchievement = (
  t: TFunction,
  achievementKey: string,
  params?: Record<string, any>
): string => {
  return t(`achievements.${achievementKey}`, {
    ...params,
    defaultValue: achievementKey,
  });
};
