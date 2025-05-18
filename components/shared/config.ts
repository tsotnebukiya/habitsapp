import { Dimensions } from 'react-native';

export const ACTIVE_OPACITY = 0.7;

export const SCREEN_WIDTH = Dimensions.get('window').width;
export const DATE_ITEM_WIDTH = 54;
const ITEMS_PER_WEEK_VIEW = 7;
const GAPS_IN_WEEK_VIEW = ITEMS_PER_WEEK_VIEW + 1; // 7 items means 8 gaps (including edges)

const TOTAL_DATE_ITEMS_WIDTH = DATE_ITEM_WIDTH * ITEMS_PER_WEEK_VIEW;
const REMAINING_SPACE_IN_WEEK_VIEW = SCREEN_WIDTH - TOTAL_DATE_ITEMS_WIDTH;
export const WEEK_VIEW_ITEM_GAP = Math.floor(
  REMAINING_SPACE_IN_WEEK_VIEW / GAPS_IN_WEEK_VIEW
);
