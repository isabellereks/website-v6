export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  href: string;
  cover?: string;
  coverRatio?: number;
  // Optional photo of the real spine (e.g. /books/spines/little-prince.jpg), cropped tight.
  spine?: string;
  description?: string;
  color: string;
  ink: string;
  height: number;
  width: number;
}

export const books: Book[] = [
  {
    id: "crying-in-h-mart",
    cover: "/books/crying-in-h-mart.jpg",
    coverRatio: 324 / 500,
    title: "Crying in H Mart",
    author: "Michelle Zauner",
    category: "Memoir",
    href: "https://openlibrary.org/isbn/9781984898951",
    color: "#e8d9b6",
    ink: "#a5302c",
    height: 185,
    width: 37,
  },
  {
    id: "tomorrow",
    cover: "/books/tomorrow.jpg",
    coverRatio: 329 / 500,
    title: "Tomorrow, and Tomorrow, and Tomorrow",
    author: "Gabrielle Zevin",
    category: "Fiction",
    href: "https://openlibrary.org/isbn/9780593321201",
    color: "#dc663a",
    ink: "#fff3ce",
    height: 206,
    width: 46,
  },
  {
    id: "creative-act",
    cover: "/books/creative-act.jpg",
    coverRatio: 149 / 218,
    title: "The Creative Act",
    author: "Rick Rubin",
    category: "Creativity",
    href: "https://openlibrary.org/isbn/9780593652886",
    color: "#dfd9c8",
    ink: "#38352d",
    height: 198,
    width: 41,
  },
  {
    id: "briefly-gorgeous",
    cover: "/books/briefly-gorgeous.jpg",
    coverRatio: 333 / 500,
    title: "On Earth We’re Briefly Gorgeous",
    author: "Ocean Vuong",
    category: "Fiction",
    href: "https://openlibrary.org/isbn/9780525562023",
    color: "#527884",
    ink: "#f4eedb",
    height: 188,
    width: 37,
  },
  {
    id: "anthropocene",
    cover: "/books/anthropocene.jpg",
    coverRatio: 298 / 450,
    title: "The Anthropocene Reviewed",
    author: "John Green",
    category: "Essays",
    href: "https://openlibrary.org/isbn/9780525555216",
    color: "#315b49",
    ink: "#eee6bf",
    height: 204,
    width: 41,
  },
  {
    id: "little-prince",
    cover: "/books/little-prince.jpg",
    coverRatio: 383 / 475,
    title: "The Little Prince",
    author: "Antoine de Saint-Exupéry",
    category: "Fiction",
    href: "https://openlibrary.org/isbn/9780156012195",
    color: "#34446d",
    ink: "#efe2b2",
    height: 172,
    width: 32,
  },
];
