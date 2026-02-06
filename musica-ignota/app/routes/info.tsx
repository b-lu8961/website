import { Header } from "~/components/header";
import type { Route } from "./+types/info";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "Musica Ignota" },
        { name: "Info", content: "Language info" },
    ];
}

export default function Cheatsheet() {
    return (
        <div className="container">
            <Header />
        </div>
    );
}