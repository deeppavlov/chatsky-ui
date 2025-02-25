import LogoIcon from "@/icons/LogoIcon";
import { DocsThemeConfig } from "nextra-theme-docs";

const themeConfig: DocsThemeConfig = {
  logo: (
    <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <LogoIcon />
      <h1 style={{ fontWeight: "bold", fontSize: "1.5rem" }}>Chatsky UI</h1>
    </span>
  ),
  head: (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta property="og:title" content="Chatsky UI" />
      <meta
        property="og:description"
        content="A React UI library for building chatbots"
      />
    </>
  ),
  docsRepositoryBase: "https://github.com/mxerf/chatsky-docs",
  project: {
    link: "https://github.com/deeppavlov/chatsky-ui",
  },
  editLink: {
    content: "Edit this page on GitHub",
  },
  feedback: {
    content: "Feedback",
    labels: "https://github.com/deeppavlov/chatsky-ui/issues",
    useLink: () => "https://github.com/deeppavlov/chatsky-ui/issues",
  },
  footer: {
    content: (
      <span>
        Apache License 2.0 {new Date().getFullYear()} ©{" "}
        <a href="https://github.com/deeppavlov/chatsky-ui" target="_blank">
          Chatsky UI
        </a>
        .
      </span>
    ),
  },
  color: {
    hue: 205,
    saturation: 40,
    lightness: 60,
  },
  backgroundColor: {
    dark: "#171717",
    light: "#fafafa",
  },
};

export default themeConfig;
