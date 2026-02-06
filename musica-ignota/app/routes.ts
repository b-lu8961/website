import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/player.tsx"),
    route("lexicon", "routes/lexicon.tsx"),
    route("info", "routes/info.tsx"),
    route("cheatsheet", "routes/cheatsheet.tsx"),
] satisfies RouteConfig;
