declare module "spectral.js" {
  export class Color {
    constructor(input: string | number[]);
    tintingStrength: number;
    sRGB: number[];
    XYZ: number[];
    OKLab: number[];
    OKLCh: number[];
    KS: unknown;
    luminance: number;
    toString(opts?: { format?: "hex" | "rgb"; method?: "map" | "clip" }): string;
  }

  export function mix(...args: Array<[Color, number]>): Color;
  export function palette(c1: Color, c2: Color, size: number): Color[];
  export function gradient(
    t: number,
    ...stops: Array<[Color, number]>
  ): Color;
}
