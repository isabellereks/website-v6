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
    spine: "/books/spines/crying-in-h-mart.jpg",
    color: "#e8d9b6",
    ink: "#a5302c",
    height: 185,
    width: 21,
  },
  {
    id: "tomorrow",
    cover: "/books/tomorrow.jpg",
    coverRatio: 329 / 500,
    title: "Tomorrow, and Tomorrow, and Tomorrow",
    author: "Gabrielle Zevin",
    category: "Fiction",
    href: "https://openlibrary.org/isbn/9780593321201",
    spine: "/books/spines/tomorrow.jpg",
    color: "#dc663a",
    ink: "#fff3ce",
    height: 206,
    width: 29,
  },
  {
    id: "creative-act",
    cover: "/books/creative-act.jpg",
    coverRatio: 149 / 218,
    title: "The Creative Act",
    author: "Rick Rubin",
    category: "Creativity",
    href: "https://openlibrary.org/isbn/9780593652886",
    spine: "/books/spines/creative-act.jpg",
    color: "#dfd9c8",
    ink: "#38352d",
    height: 198,
    width: 26,
  },
  {
    id: "briefly-gorgeous",
    cover: "/books/briefly-gorgeous.jpg",
    coverRatio: 333 / 500,
    title: "On Earth We’re Briefly Gorgeous",
    author: "Ocean Vuong",
    category: "Fiction",
    href: "https://openlibrary.org/isbn/9780525562023",
    spine: "/books/spines/briefly-gorgeous.jpg",
    color: "#527884",
    ink: "#f4eedb",
    height: 188,
    width: 20,
  },
  {
    id: "anthropocene",
    cover: "/books/anthropocene.jpg",
    coverRatio: 298 / 450,
    title: "The Anthropocene Reviewed",
    author: "John Green",
    category: "Essays",
    href: "https://openlibrary.org/isbn/9780525555216",
    spine: "/books/spines/anthropocene.jpg",
    color: "#315b49",
    ink: "#eee6bf",
    height: 204,
    width: 18,
  },
  {
    // Standard Edition hardcover (William Morrow, ISBN 9780063583597). No spine photo
    // exists yet, so it uses a drawn spine in the cover's colors until there is one.
    id: "taipei-story",
    cover: "/books/taipei-story.jpg",
    coverRatio: 229 / 389,
    title: "Taipei Story",
    author: "R. F. Kuang",
    category: "Fiction",
    href: "https://www.harvard.com/book/9780063583597",
    color: "#22304b",
    ink: "#f4efe4",
    height: 190,
    width: 22,
  },
  {
    id: "little-prince",
    cover: "/books/little-prince.jpg",
    coverRatio: 383 / 475,
    title: "The Little Prince",
    author: "Antoine de Saint-Exupéry",
    category: "Fiction",
    href: "https://openlibrary.org/isbn/9780156012195",
    spine: "/books/spines/little-prince.jpg",
    color: "#34446d",
    ink: "#efe2b2",
    height: 172,
    width: 8,
  },
];
