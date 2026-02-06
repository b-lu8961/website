import { Header } from "~/components/header";
import type { Route } from "./+types/lexicon";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "Musica Ignota" },
        { name: "Lexicon", content: "Language lexicon" },
    ];
}

export default function Lexicon() {
    return (
        <div className="container">
            <Header />
        </div>
    );
}