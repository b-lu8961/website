import { Header } from "~/components/header";
import type { Route } from "./+types/info";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "Musica Ignota" },
        { name: "Info", content: "Language info" },
    ];
}

export default function Info() {
    return (
        <div className="container">
            <Header />
            <h2>Musica Ignota</h2>
            <p>Musica Ignota is a non-human language based on music.</p>
            <p>"Speech" in this language uses two pentatonic scales that can sound simultaneously. For a given speaker, the two scales always contain the same notes, but one scale is one higher than the other. These two scales are the lower & upper registers.</p>
            <p>Native speakers of Musica Ignota derive meaning from both the pitch of notes as well as the contour of the melody. This is reflected in the writing system: each word has an initial pitch symbol, then is followed by interval symbols to describe the contour of the upper register notes (in addition to diacritics that indicate the lower register notes).</p>
        </div>
    );
}