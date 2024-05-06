export interface SocialEntry {
  type: "github" | "twitter" | "email";
  icon: string;
  link: string;
}

export interface Creator {
  avatar: string;
  name: string;
  username?: string;
  title?: string;
  org?: string;
  desc?: string;
  links?: SocialEntry[];
  nameAliases?: string[];
  emailAliases?: string[];
}

const getAvatarUrl = (name: string) => `https://github.com/${name}.png`;

export const contributors: Creator[] = [
  {
    name: "Northword",
    avatar: "",
    username: "northword",
    title: "开发者",
    links: [
      { type: "github", icon: "github", link: "https://github.com/northword" },
    ],
    nameAliases: ["renovate[bot]"],
    emailAliases: [
      "29139614+renovate[bot]@users.noreply.github.com",
      "44738481+northword@users.noreply.github.com",
    ],
  },
].map<Creator>((c) => {
  c.avatar = c.avatar || getAvatarUrl(c.username);
  return c as Creator;
});

export const creatorNames = contributors.map((c) => c.name);
export const creatorUsernames = contributors.map((c) => c.username || "");
