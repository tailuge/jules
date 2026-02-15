export type Orientation = "tall" | "wide";

/**
 * Determines the orientation based on terminal dimensions.
 * "wide" is returned if width is at least 1.5 times the height.
 */
export function getOrientation(width: number, height: number): Orientation {
  return width >= height * 1.5 ? "wide" : "tall";
}
