from pathlib import Path
import pandas as pd
from PIL import ImageFont

STAT_NAMES = [
    "Saves", "Recoveries", "Blocks",
    "Boost Steals", "Demos Taken", "Demos",
    "Shots", "Goals", "Assists",
    "Prog Passes", "Prog Dribbles", "Touches / TO"
]

REGION_COLORS = {
    "APAC": "rgb(244, 214, 0)",
    "EU": "rgb(78, 159, 216)",
    "MENA": "rgb(0, 166, 79)",
    "NA": "rgb(236, 114, 57)",
    "OCE": "rgb(143, 0, 255)",
    "SAM": "rgb(0, 235, 235)",
    "SSA": "rgb(228, 20, 30)"
}

APP_DIR = Path(__file__).parent
DATA_DIR = APP_DIR / "rlcs_player_event_data.parquet"
event_data = pd.read_parquet(DATA_DIR, engine="fastparquet")
event_data["Touches / TO"] = round(event_data["IP Touches"] / event_data["Turnovers"], 2)
columns = [
            "Score", "Goals", "xG", "Assists", "Saves", "Shots", "Team Shots Allowed", "Team Goals Allowed", "Touches", "Passes",
            "Demos", "Demos Taken",  "Boost Steals", "Turnovers", "Recoveries", "Blocks", "Prog Passes", "Prog Dribbles", "IP Touches"
        ]
for col in columns:
    event_data[col] = round(event_data[col] / (event_data["SP"] / 300), 2)
event_data = event_data.sort_index()

sn_list = ["RLCS 2024", "RLCS 2025"]
sn_map = {}
for sn in sn_list:
    comp, season = sn.split(" ")
    new_df = event_data.loc[comp, season]
    new_df = new_df.reset_index(names=["Event", "Player"])
    ev_list = list(new_df["Event"].unique())
    sn_map[sn] = sorted(ev_list)

event_list = list(event_data.index.levels[2])
player_list = list(event_data.index.levels[3])
stat_list = list(event_data.keys())[4:]

def get_font(size):
    return ImageFont.truetype(APP_DIR / "Bourgeois Bold.otf", size)