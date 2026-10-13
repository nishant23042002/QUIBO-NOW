/** Pictures bundled with the app are imported as the number Metro gives each one, which an <Image> takes as its source. */
declare module '*.png' {
  const source: number;
  export default source;
}

declare module '*.webp' {
  const source: number;
  export default source;
}
