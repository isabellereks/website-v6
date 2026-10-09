export interface Project {
  name: string;
  description: string;
  kind: string;
  url: string;
  previewUrl?: string;
}

export const projects: Project[] = [
  {
    name: "Track Policy",
    description: "A living directory of AI regulations worldwide.",
    kind: "Civic tech",
    url: "https://trackpolicy.org",
  },
  {
    name: "PolicySim",
    description: "Take on the US government in a Pokémon-style policy battle.",
    kind: "Game",
    url: "https://policysim.policy.cafe",
  },
  {
    name: "Corruption Map",
    description: "Corruption across the United States, mapped.",
    kind: "Data",
    url: "https://corruption-map.vercel.app",
  },
  {
    name: "Seattle Junk Journal Club",
    description: "A creative junk journaling community in Seattle.",
    kind: "Community",
    url: "https://www.instagram.com/seattlejunkjournalclub/",
    previewUrl: "https://www.instagram.com/seattlejunkjournalclub/embed/",
  },
  {
    name: "iPod",
    description: "A clickable iPod, powered by Spotify.",
    kind: "Toy",
    url: "https://old.isabellereks.com/ipod",
  },
];
