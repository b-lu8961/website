import type { LexData } from "~/types";
import { WordCard } from "./word-card";

export function WordPanel({ lexData }: { lexData: LexData }) {
    const contourContent = lexData.contours.map(word => <WordCard word={word} />)
    const sequenceContent = lexData.sequences.map(word => <WordCard word={word} />)
    const particleContent = lexData.particles.map(word => <WordCard word={word} />)

    return (
        <div className="col">
            {contourContent}
            {sequenceContent}
            {particleContent}
        </div>
    );
}