import meta from "../../../src/pages/_meta.ts";
import docs_meta from "../../../src/pages/docs/_meta.ts";
import docs_nodes_meta from "../../../src/pages/docs/nodes/_meta.ts";
export const pageMap = [{
  data: meta
}, {
  name: "docs",
  route: "/docs",
  children: [{
    data: docs_meta
  }, {
    name: "deliver",
    route: "/docs/deliver",
    frontMatter: {
      "sidebarTitle": "Deliver"
    }
  }, {
    name: "index",
    route: "/docs",
    frontMatter: {
      "sidebarTitle": "Index"
    }
  }, {
    name: "inspect",
    route: "/docs/inspect",
    frontMatter: {
      "sidebarTitle": "Inspect"
    }
  }, {
    name: "installation",
    route: "/docs/installation",
    frontMatter: {
      "sidebarTitle": "Installation"
    }
  }, {
    name: "nodes",
    route: "/docs/nodes",
    children: [{
      data: docs_nodes_meta
    }, {
      name: "default_node",
      route: "/docs/nodes/default_node",
      frontMatter: {
        "sidebarTitle": "Default Node"
      }
    }, {
      name: "index",
      route: "/docs/nodes",
      frontMatter: {
        "sidebarTitle": "Index"
      }
    }, {
      name: "link_node",
      route: "/docs/nodes/link_node",
      frontMatter: {
        "sidebarTitle": "Link Node"
      }
    }, {
      name: "presets",
      route: "/docs/nodes/presets",
      frontMatter: {
        "sidebarTitle": "Presets"
      }
    }, {
      name: "slots_node",
      route: "/docs/nodes/slots_node",
      frontMatter: {
        "sidebarTitle": "Slots Node"
      }
    }]
  }, {
    name: "quick_start",
    route: "/docs/quick_start",
    frontMatter: {
      "sidebarTitle": "Quick Start"
    }
  }, {
    name: "settings",
    route: "/docs/settings",
    frontMatter: {
      "sidebarTitle": "Settings"
    }
  }, {
    name: "skill_basics",
    route: "/docs/skill_basics",
    frontMatter: {
      "sidebarTitle": "Skill Basics"
    }
  }]
}, {
  name: "index",
  route: "/",
  frontMatter: {
    "sidebarTitle": "Index"
  }
}];