// src/types/css.d.ts
declare module "*.css" {
  const content: Record<string, string>;
  export default content;
}

declare module "swiper/css" {
  const content: any;
  export default content;
}

declare module "swiper/css/pagination" {
  const content: any;
  export default content;
}

declare module "swiper/css/navigation" {
  const content: any;
  export default content;
}