export interface Book {
  id: string;
  title: string;
  spine: string;
  author: string;
  category: string;
  href: string;
  height: number;
  width: number;
}

export const books: Book[] = [
  {
    id: "crying-in-h-mart",
    title: "Crying in H Mart",
    spine: "Crying in H Mart",
    author: "Michelle Zauner",
    category: "Memoir",
    href: "https://openlibrary.org/isbn/9781984898951",
    height: 168,
    width: 34,
  },
  {
    id: "tomorrow",
    title: "Tomorrow, and Tomorrow, and Tomorrow",
    spine: "Tomorrow, and Tomorrow",
    author: "Gabrielle Zevin",
    category: "Fiction",
    href: "https://openlibrary.org/isbn/9780593321201",
    height: 188,
    width: 42,
  },
  {
    id: "creative-act",
    title: "The Creative Act",
    spine: "The Creative Act",
    author: "Rick Rubin",
    category: "Creativity",
    href: "https://openlibrary.org/isbn/9780593652886",
    height: 180,
    width: 38,
  },
  {
    id: "briefly-gorgeous",
    title: "On Earth We’re Briefly Gorgeous",
    spine: "Briefly Gorgeous",
    author: "Ocean Vuong",
    category: "Fiction",
    href: "https://openlibrary.org/isbn/9780525562023",
    height: 172,
    width: 34,
  },
  {
    id: "anthropocene",
    title: "The Anthropocene Reviewed",
    spine: "The Anthropocene Reviewed",
    author: "John Green",
    category: "Essays",
    href: "https://openlibrary.org/isbn/9780525555216",
    height: 186,
    width: 38,
  },
  {
    id: "little-prince",
    title: "The Little Prince",
    spine: "The Little Prince",
    author: "Antoine de Saint-Exupéry",
    category: "Fiction",
    href: "https://openlibrary.org/isbn/9780156012195",
    height: 156,
    width: 30,
  },
  {
    id: "writing",
    title: "Writing",
    spine: "Isabelle — Essays",
    author: "Isabelle Reksopuro",
    category: "On Substack",
    href: "https://isaishangry.substack.com/",
    height: 160,
    width: 32,
  },
];
