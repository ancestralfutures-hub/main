/*
  Every piece of copy on the site comes from the JSON files in /content.
  This file only gives them names so the rest of the app can use them
  without knowing where they came from. To change wording, edit the JSON.
*/

import site from "@/content/site.json";
import home from "@/content/home.json";

export const siteConfig = site.siteConfig;

// Every entry is an anchor: its href starts with "#" and must match the id
// of a section on the page.
export const navigation = site.navigation;

export const footerContent = site.footer;

export const heroContent = home.hero;
export const aboutContent = home.about;
export const artistContent = home.artist;
export const rulesContent = home.rules;
export const ticketsContent = home.tickets;
export const signupContent = home.signup;
