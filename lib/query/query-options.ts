/** Reference data that changes infrequently (master lookups, dispatch form options). */
export const REFERENCE_DATA_STALE_TIME = 5 * 60 * 1000;

/** Lists that change more often (dispatches, requisitions). */
export const LIST_DATA_STALE_TIME = 60 * 1000;
