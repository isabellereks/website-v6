export interface Photo {
  caption: string;
  src?: string;
}

// Add a src (e.g. "/photos/matcha.jpg" in public/photos) to replace a placeholder.
export const photos: Photo[] = [
  { caption: "seattle" },
  { caption: "matcha" },
  { caption: "journal club" },
  { caption: "scones" },
  { caption: "d.c." },
  { caption: "reading" },
  { caption: "friends" },
];
