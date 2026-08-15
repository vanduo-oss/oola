import type { OolaPanelId } from "@/panel";

export interface NavPage {
  id: OolaPanelId;
  title: string;
  icon: string;
  keywords: string[];
}

export const navPages: NavPage[] = [
  {
    id: "home",
    title: "Home",
    icon: "house",
    keywords: ["home", "oola", "vanduo"],
  },
  {
    id: "icons",
    title: "Icons",
    icon: "hexagon",
    keywords: ["icons", "drafts", "structured phi", "catalog"],
  },
  {
    id: "about",
    title: "About",
    icon: "info",
    keywords: ["about", "ula", "structured phi"],
  },
];
