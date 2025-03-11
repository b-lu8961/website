import numpy as np
import os
from PIL import Image, ImageDraw
import plotly.express as px
from scipy.stats import percentileofscore

from data import event_data, sn_map, get_font, STAT_NAMES, REGION_COLORS

WHITE, BLACK = (255,255,255), (0,0,0)
LIGHT_GREY, DARK_GREY = (180,180,180), (70,70,70)

def get_percentiles(key, stat_data, lan_only=False):
    player_data = {}
    for stat in STAT_NAMES:
        if lan_only:
            pop_data = stat_data[stat_data["GP"] >= 9 & stat_data["LAN"]][stat]
        else:    
            pop_data = stat_data[stat_data["GP"] >= 9][stat]
        player_val = stat_data.at[key, stat]
        player_data[stat] = percentileofscore(pop_data, player_val)
    player_data["Demos Taken"] = 100 - player_data["Demos Taken"]
    return player_data

def get_rot_text(draw, text, font=get_font(60), height=50, fill=BLACK, rot=90):
    img_len = round(draw.textlength(text, font=font))
    img = Image.new(mode="RGBA", size=(img_len, height), color=WHITE)
    img_draw = ImageDraw.Draw(img)
    img_draw.text((0, 0), text, fill=fill, font=font)
    return img.rotate(rot, expand=True, fillcolor=(0,0,0,0))

def draw_radar(event, player):
    for season in sn_map:
        if event in sn_map[season]:
            comp, year = season.split(" ")
            key = (comp, year, event, player)
            break
    
    player_data = event_data.loc[key]
    percentiles = get_percentiles(key, event_data)

    img = Image.new(mode="RGBA", size=(1700, 1700), color=WHITE)
    draw = ImageDraw.Draw(img)
    X_MID, Y_MID = img.width / 2, img.height  / 2
    RADIUS, IN_RAD = 650, 150
    
    for i in range(len(STAT_NAMES)):
        stat = STAT_NAMES[i]
        pctile = percentiles[stat]
        start_ang, end_ang = (360 / 12) * i, (360 / 12) * (i + 1)

        # Slice
        stat_bbox = [
            (X_MID - ((RADIUS - IN_RAD) * (pctile / 100)) - IN_RAD, Y_MID - ((RADIUS - IN_RAD) * (pctile / 100)) - IN_RAD),
            (X_MID + ((RADIUS - IN_RAD) * (pctile / 100)) + IN_RAD, Y_MID + ((RADIUS - IN_RAD) * (pctile / 100)) + IN_RAD)
        ]
        if 0 <= i and i < 3:
            slice_fill, arc_fill = (236, 114, 57), (171, 83, 41)
        elif 3 <= i and i < 6:
            slice_fill, arc_fill = (38, 194, 110), (24, 125, 71)
        elif 6 <= i and i < 9:
            slice_fill, arc_fill = (78, 159, 216), (53, 109, 148)
        else:
            slice_fill, arc_fill = (230, 0, 125), (156, 0, 85)
        draw.pieslice(stat_bbox, start_ang, end_ang, fill=slice_fill)

        # Slice Stripes
        for j in range(0, int(pctile), 10):
            arc_bbox = [
                (X_MID - ((RADIUS - IN_RAD) * (j / 100)) - IN_RAD, Y_MID - ((RADIUS - IN_RAD) * (j / 100)) - IN_RAD),
                (X_MID + ((RADIUS - IN_RAD) * (j / 100)) + IN_RAD, Y_MID + ((RADIUS - IN_RAD) * (j / 100)) + IN_RAD)
            ]
            draw.arc(arc_bbox, start_ang + 12.5, end_ang - 12.5, fill=arc_fill, width=3)

        # Label
        rad = ((start_ang + end_ang) / 2 / 360) * 2 * np.pi
        point = (X_MID + ((RADIUS + 50) * np.cos(rad)), Y_MID + ((RADIUS + 50) * np.sin(rad)))
        rot_ang = -90 - ((start_ang + end_ang) / 2) if i > 5 else 90 - ((start_ang + end_ang) / 2)
        label_img = get_rot_text(draw, stat, get_font(60), 60, DARK_GREY, rot_ang)
        img.paste(label_img, (round(point[0] - (label_img.width / 2)), round(point[1] - (label_img.height / 2))), mask=label_img)
        
        val_point = (X_MID + ((RADIUS + 125) * np.cos(rad)), Y_MID + ((RADIUS + 125) * np.sin(rad)))
        val_img = get_rot_text(draw, str(player_data[stat]), get_font(70), 60, BLACK, rot_ang)
        img.paste(val_img, (round(val_point[0] - (val_img.width / 2)), round(val_point[1] - (val_img.height / 2))), mask=val_img)
        
        # Divider line
        div_rad = (start_ang / 360) * 2 * np.pi
        div_end = (X_MID + (RADIUS * np.cos(div_rad)), Y_MID + (RADIUS * np.sin(div_rad)))
        draw.line([(X_MID, Y_MID), div_end], fill=LIGHT_GREY, width=5)

    draw.ellipse([(X_MID - RADIUS, Y_MID - RADIUS), (X_MID + RADIUS, Y_MID + RADIUS)], outline=REGION_COLORS[player_data["Region"]], width=7)
    draw.ellipse([(X_MID - IN_RAD, Y_MID - IN_RAD), (X_MID + IN_RAD, Y_MID + IN_RAD)], fill=WHITE, outline=DARK_GREY, width=5)
    draw.multiline_text((X_MID, Y_MID), f"{player_data["GP"]} GP\n{round(player_data["SP"] / 60)} MINS", 
        font=get_font(60), fill=BLACK, align="center", anchor="mm")
    
    #output_path = os.path.join(APP_DIR, "output", f"{event}_{player}_radar.png").replace(" ", "_")
    #img.save(output_path)
    return img

def plot_scatter(season, event_name, x_stat, y_stat, size_flag, trend_flag):
    dot_size = "GP" if size_flag else None
    trend_type = "ols" if trend_flag else None
    key = (season.split(' ')[0], season.split(' ')[1], event_name)
    plot_data = event_data.loc[key]
    if "LAN" in event_name:
        scatter = px.scatter(plot_data, x=x_stat, y=y_stat, size=dot_size, hover_name=plot_data.index, color="Region",
            color_discrete_map=REGION_COLORS,
            trendline=trend_type, trendline_scope="overall"
        )
    else:
        scatter = px.scatter(plot_data, x=x_stat, y=y_stat, size=dot_size, hover_name=plot_data.index, trendline=trend_type)
    return scatter