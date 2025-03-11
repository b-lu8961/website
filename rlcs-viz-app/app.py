from data import event_data, sn_map, event_list, player_list, stat_list
from plots import draw_radar, plot_scatter

from shiny import App, reactive, render, ui
from shiny.types import ImgData
from shinywidgets import output_widget, render_widget

app_ui = ui.page_navbar(
    ui.nav_panel(
        "Radar",
        ui.layout_sidebar(
            ui.sidebar(
                ui.input_selectize(
                    "sn_one",
                    "Season One",
                    choices=list(sn_map.keys()),
                    selected="RLCS 2024"
                ),
                ui.input_selectize(
                    "ev_one",
                    "Event One",
                    choices=event_list,
                    selected=""
                ),
                ui.input_selectize(
                    "pl_one",
                    "Player One",
                    [],
                    #selected=""
                ),
                ui.input_action_button("btn_one", "Update"),
                ui.hr(),
                ui.input_selectize(
                    "sn_two",
                    "Season Two",
                    choices=list(sn_map.keys()),
                    selected="RLCS 2024"
                ),
                ui.input_selectize(
                    "ev_two",
                    "Event Two",
                    choices=event_list,
                    selected=""
                ),
                ui.input_selectize(
                    "pl_two",
                    "Player Two",
                    [],
                    #selected=""
                ),
                ui.input_action_button("btn_two", "Update"),
                ui.input_dark_mode()
            ),
            ui.layout_columns(
                ui.column(
                    12,
                    ui.card(
                        ui.card_header(ui.output_text("txt_one")),
                        ui.output_plot("img_one"),
                        full_screen=True
                    )
                    # ui.output_text("txt_one"),
                    # ui.output_plot("img_one", width="175%")
                ),
                ui.column(
                    12,
                    ui.card(
                        ui.card_header(ui.output_text("txt_two")),
                        ui.output_plot("img_two"),
                        full_screen=True
                    )
                )
            ),
            ui.p("Bar height shows percentile rank vs all single-event performances since RLCS 24"),
            height="85vh"
        )
    ),
    ui.nav_panel(
        "Scatter",
        ui.layout_sidebar(
            ui.sidebar(
                ui.input_selectize(
                    "sc_season",
                    "Season",
                    choices=list(sn_map.keys()),
                    selected="RLCS 2024"
                ),
                ui.input_selectize(
                    "sc_events",
                    "Event",
                    choices=event_list,
                    selected="WC LAN"
                ),
                ui.input_selectize(
                    "sc_x",
                    "X-Axis",
                    choices=stat_list,
                    selected="Goals"
                ),
                ui.input_selectize(
                    "sc_y",
                    "Y-Axis",
                    choices=stat_list,
                    selected="Assists"
                ),
                ui.input_switch("sc_switch", "GP Dot Size", True),
                ui.input_switch("sc_trend", "Trendline", False),
                ui.input_dark_mode()
            ),
            output_widget("scatter")
        )
    ),
    ui.nav_panel(
        "Data",
        ui.layout_sidebar(
            ui.sidebar(
                ui.input_selectize(
                    "seasons",
                    "Seasons",
                    choices=list(sn_map.keys()),
                    multiple=True
                ),
                ui.input_selectize(
                    "events",
                    "Events",
                    choices=event_list,
                    multiple=True
                ),
                ui.input_selectize(
                    "players",
                    "Players",
                    choices=player_list,
                    multiple=True
                ),
                ui.download_button("data_dl", "Download"),
                ui.input_dark_mode()
            ),
            ui.output_data_frame("data_df")
        )
    ),
    ui.nav_panel(
        "Info",
        ui.navset_pill_list(
            ui.nav_panel(
                "Main",
                ui.p("All stats are per 5:00."),
                ui.p("GP - Games Played; SP - Seconds Played"),
                ui.p("xG - Expected Goals"),
                ui.p("Boost Steals only count big boost pads.")
            ),
            ui.nav_panel(
                "Possession",
                ui.p("A team gains possession after two consecutive hits by that team's players."),
                ui.p("IP Touch - Hit made by player while their team has possession. Touches / TO uses IP Touches."),
                ui.p("Turnover - Player has the last hit of a possession (excluding possession-ending shots and goals)"),
                ui.p("Recovery - Player has the first hit of a possession"),
                ui.p("Block - Player has an out-of-possession hit that does not start a possession for the player's team"),  
                ui.output_image("poss_image")
            ),
            ui.nav_panel(
                "Progression", 
                ui.p("Pass - A hit that results in a hit by a different player on the same team"),
                ui.p("Dribble - Two or more consecutive hits by the same player"),
                ui.p("A pass/dribble is Progressive when the end location is 25% closer to the opposition goal than the start location."),
                ui.layout_columns(
                    ui.column(
                        12,
                        ui.card(
                            ui.output_image("prog_image"),
                            full_screen=True,
                            min_height="490px"
                        )
                    ),
                    ui.column(
                        12,
                        ui.card(
                            ui.output_image("nonprog_image"),
                            full_screen=True,
                            min_height="490px"
                        )
                    )
                )
            ),
            widths=(2,10)
        )
        # ui.p("  - For example, with the following hits, the Orange touch is a Block: Blue, Blue, Orange, Blue."),
    ),
    title="RLCS Viz"
)

def server(input, output, session):
    ## Radars
    @reactive.effect
    def sn_one():
        season_one = input.sn_one()
        if season_one in sn_map:
            ui.update_select("ev_one", choices=sn_map[season_one])
            

    @reactive.effect
    def sn_two():
        season_two = input.sn_two()
        if season_two in sn_map:
            ui.update_select("ev_two", choices=sn_map[season_two])

    @reactive.effect
    def ev_one():
        ev_one_name = input.ev_one()
        sn_str = input.sn_one()
        if ev_one_name in sn_map[sn_str]:
            comp, season = sn_str.split(" ")
            pl_list = list(event_data.loc[comp, season, ev_one_name].index)
            ui.update_select("pl_one", choices=sorted(pl_list, key=str.casefold))

    @reactive.effect
    def ev_two():
        ev_two_name = input.ev_two()
        sn_str = input.sn_two()
        if ev_two_name in sn_map[sn_str]:
            comp, season = sn_str.split(" ")
            pl_list = list(event_data.loc[comp, season, ev_two_name].index)
            ui.update_select("pl_two", choices=sorted(pl_list, key=str.casefold))

    @render.code
    @reactive.event(input.btn_one)
    def txt_one():
        return f"{input.pl_one()} | {input.ev_one()}"
    
    @render.plot
    @reactive.event(input.btn_one)
    def img_one():
        return draw_radar(input.ev_one(), input.pl_one())

    @render.code
    @reactive.event(input.btn_two)
    def txt_two():
        return f"{input.pl_two()} | {input.ev_two()}"
    
    @render.plot
    @reactive.event(input.btn_two)
    def img_two():
        return draw_radar(input.ev_two(), input.pl_two())


    ## Scatter
    @reactive.effect
    def sc_season():
        ev_list = sn_map[input.sc_season()]
        ui.update_select("sc_events", choices=sorted(ev_list))

    @render_widget
    def scatter():
        if input.sc_events() in sn_map[input.sc_season()]:
            return plot_scatter(input.sc_season(), input.sc_events(), input.sc_x(), input.sc_y(), input.sc_switch(), input.sc_trend())
        else:
            return None


    ## Data
    @reactive.calc
    def filter_data():
        new_df = event_data.reset_index(names=["Competition", "Season", "Event", "Player"])

        season_filter = input.seasons()
        if len(season_filter) > 0:
            comps = [sn.split(" ")[0] for sn in season_filter]
            new_df = new_df[new_df['Competition'].isin(comps)]
            seasons = [sn.split(" ")[1] for sn in season_filter]
            new_df = new_df[new_df['Season'].isin(seasons)]

        event_filter = input.events()
        if len(event_filter) > 0:
            new_df = new_df[new_df['Event'].isin(event_filter)]

        player_filter = input.players()
        if len(player_filter) > 0:
            new_df = new_df[new_df['Player'].isin(player_filter)]
            
        return new_df.drop(columns=["Region", "LAN"])

    @render.data_frame
    def data_df():
        return render.DataTable(filter_data())
    
    @render.download(filename="data.csv")
    def data_dl():
        yield filter_data().to_csv()

    # Info
    @render.image
    def poss_image():
        from pathlib import Path

        dir = Path(__file__).resolve().parent
        img: ImgData = { "src": str(dir / "possession.gif") }
        return img
    
    @render.image
    def prog_image():
        from pathlib import Path

        dir = Path(__file__).resolve().parent
        img: ImgData = { "src": str(dir / "prog.png") }
        return img
    
    @render.image
    def nonprog_image():
        from pathlib import Path

        dir = Path(__file__).resolve().parent
        img: ImgData = { "src": str(dir / "non_prog.png") }
        return img


app = App(app_ui, server)