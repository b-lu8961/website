import { Header } from "~/components/header";
import type { Route } from "./+types/cheatsheet";
import type { FontData } from "~/types";
import { FontTable } from "~/components/font-table";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "Musica Ignota" },
        { name: "Cheatsheet", content: "Font cheatsheet" },
    ];
}

const FONT: FontData[] = [
    { char: "A", category: "initial", "order": 0, info: "Upper pitch 1 initial"},
    { char: "B", category: "initial", "order": 1, info: "Upper pitch 2 initial"},
    { char: "C", category: "initial", "order": 2, info: "Upper pitch 3 initial"},
    { char: "D", category: "initial", "order": 3, info: "Upper pitch 4 initial"},
    { char: "E", category: "initial", "order": 4, info: "Upper pitch 5 initial"},
    { char: "a", category: "up", "order": 0, info: "Upper +1 interval"},
    { char: "b", category: "up", "order": 1, info: "Upper +2 interval"},
    { char: "c", category: "up", "order": 2, info: "Upper +3 interval"},
    { char: "d", category: "up", "order": 3, info: "Upper +4 interval"},
    { char: "f", category: "down", "order": 0, info: "Upper -1 interval"},
    { char: "g", category: "down", "order": 1, info: "Upper -2 interval"},
    { char: "h", category: "down", "order": 2, info: "Upper -3 interval"},
    { char: "i", category: "down", "order": 3, info: "Upper -4 interval"},
    { char: "o", category: "diacritic", "order": 0, info: "Lower pitch 1"},
    { char: "#", category: "diacritic", "order": 1, info: "Lower pitch 2"},
    { char: "-", category: "diacritic", "order": 2, info: "Lower pitch 3"},
    { char: "^", category: "diacritic", "order": 3, info: "Lower pitch 4"},
    { char: "%", category: "diacritic", "order": 4, info: "Lower pitch 5"},
    { char: "0", category: "numeral", "order": 0, info: "0"},
    { char: "1", category: "numeral", "order": 1, info: "1"},
    { char: "2", category: "numeral", "order": 2, info: "2"},
    { char: "3", category: "numeral", "order": 3, info: "3"},
    { char: "4", category: "numeral", "order": 4, info: "4"},
    { char: "5", category: "numeral", "order": 5, info: "5"},
    { char: "6", category: "numeral", "order": 6, info: "6"},
    { char: "7", category: "numeral", "order": 7, info: "7"},
    { char: "8", category: "numeral", "order": 8, info: "8"},
    { char: "9", category: "numeral", "order": 9, info: "9"},
    { char: "L", category: "numeral", "order": 10, info: "10"},
    { char: "M", category: "numeral", "order": 11, info: "11"},
    { char: "N", category: "numeral", "order": 12, info: "12"},
    { char: "O", category: "numeral", "order": 13, info: "13"},
    { char: "P", category: "numeral", "order": 14, info: "14"},
    { char: "Q", category: "numeral", "order": 15, info: "15"},
    { char: "R", category: "numeral", "order": 16, info: "16"},
    { char: "S", category: "numeral", "order": 17, info: "17"},
    { char: "T", category: "numeral", "order": 18, info: "18"},
    { char: "U", category: "numeral", "order": 19, info: "19"},
    { char: "V", category: "numeral", "order": 20, info: "20"},
    { char: "W", category: "numeral", "order": 21, info: "21"},
    { char: "X", category: "numeral", "order": 22, info: "22"},
    { char: "Y", category: "numeral", "order": 23, info: "23"},
    { char: "Z", category: "numeral", "order": 24, info: "24"},
    { char: "=", category: "symbol", "order": 0, info: "Equals"},
    { char: "+", category: "symbol", "order": 1, info: "Add"},
    { char: "_", category: "symbol", "order": 2, info: "Subtract"},
    { char: "*", category: "symbol", "order": 3, info: "Multiply"},
    { char: "/", category: "symbol", "order": 4, info: "Divide"},
    { char: ">", category: "symbol", "order": 5, info: "Greater than"},
    { char: "<", category: "symbol", "order": 6, info: "Less than"},
];

export default function Cheatsheet() {
    return (
        <div className="container">
            <Header />
            <FontTable data={FONT} />
        </div>
    );
}