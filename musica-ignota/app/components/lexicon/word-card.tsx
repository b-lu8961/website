import type { WordData } from "~/types";

export function WordCard({ word }: { word: WordData }) {


    return (
        <div className="card m-2">
            <div className="card-body">
                <h4 className="card-title">{word.shape.join(",")}</h4>
                <p className="card-text">{word.definition}</p>
            </div>
        </div>
    );
}