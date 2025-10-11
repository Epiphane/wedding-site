module Frontend exposing (..)

import Browser exposing (UrlRequest(..))
import Browser.Navigation as Nav
import Html exposing (Html)
import Html.Attributes as Attr
import Html.Events as Events
import Lamdera
import Types exposing (..)
import Url


type alias Model =
    FrontendModel


app =
    Lamdera.frontend
        { init = init
        , onUrlRequest = UrlClicked
        , onUrlChange = UrlChanged
        , update = update
        , updateFromBackend = updateFromBackend
        , subscriptions = \m -> Sub.none
        , view = view
        }


init : Url.Url -> Nav.Key -> ( Model, Cmd FrontendMsg )
init url key =
    ( { key = key
      , coupleNames = ( "Your Name", "Partner Name" )
      , weddingDate = "June 15, 2026"
      , venue = "The Grand Ballroom"
      , showRsvpForm = False
      }
    , Cmd.none
    )


update : FrontendMsg -> Model -> ( Model, Cmd FrontendMsg )
update msg model =
    case msg of
        UrlClicked urlRequest ->
            case urlRequest of
                Internal url ->
                    ( model
                    , Nav.pushUrl model.key (Url.toString url)
                    )

                External url ->
                    ( model
                    , Nav.load url
                    )

        UrlChanged url ->
            ( model, Cmd.none )

        ToggleRsvpForm ->
            ( { model | showRsvpForm = not model.showRsvpForm }, Cmd.none )

        NoOpFrontendMsg ->
            ( model, Cmd.none )


updateFromBackend : ToFrontend -> Model -> ( Model, Cmd FrontendMsg )
updateFromBackend msg model =
    case msg of
        NoOpToFrontend ->
            ( model, Cmd.none )


view : Model -> Browser.Document FrontendMsg
view model =
    let
        ( name1, name2 ) =
            model.coupleNames
    in
    { title = name1 ++ " & " ++ name2 ++ " - Wedding"
    , body =
        [ Html.div
            [ Attr.style "font-family" "'Georgia', 'Times New Roman', serif"
            , Attr.style "margin" "0"
            , Attr.style "padding" "0"
            , Attr.style "min-height" "100vh"
            , Attr.style "background" "linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)"
            ]
            [ heroSection model name1 name2
            , detailsSection model
            , rsvpSection model
            , footerSection
            ]
        ]
    }


heroSection : Model -> String -> String -> Html FrontendMsg
heroSection model name1 name2 =
    Html.div
        [ Attr.style "text-align" "center"
        , Attr.style "padding" "100px 20px"
        , Attr.style "background" "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        , Attr.style "color" "white"
        ]
        [ Html.h1
            [ Attr.style "font-size" "3.5em"
            , Attr.style "margin" "0"
            , Attr.style "font-weight" "400"
            , Attr.style "letter-spacing" "2px"
            ]
            [ Html.text name1 ]
        , Html.div
            [ Attr.style "font-size" "2em"
            , Attr.style "margin" "20px 0"
            , Attr.style "opacity" "0.9"
            ]
            [ Html.text "&" ]
        , Html.h1
            [ Attr.style "font-size" "3.5em"
            , Attr.style "margin" "0"
            , Attr.style "font-weight" "400"
            , Attr.style "letter-spacing" "2px"
            ]
            [ Html.text name2 ]
        , Html.div
            [ Attr.style "margin-top" "40px"
            , Attr.style "font-size" "1.3em"
            , Attr.style "opacity" "0.95"
            , Attr.style "font-style" "italic"
            ]
            [ Html.text "We're getting married!" ]
        ]


detailsSection : Model -> Html FrontendMsg
detailsSection model =
    Html.div
        [ Attr.style "max-width" "800px"
        , Attr.style "margin" "60px auto"
        , Attr.style "padding" "40px 20px"
        , Attr.style "text-align" "center"
        ]
        [ Html.h2
            [ Attr.style "font-size" "2.5em"
            , Attr.style "margin-bottom" "40px"
            , Attr.style "color" "#333"
            , Attr.style "font-weight" "400"
            ]
            [ Html.text "Save the Date" ]
        , Html.div
            [ Attr.style "display" "flex"
            , Attr.style "justify-content" "space-around"
            , Attr.style "flex-wrap" "wrap"
            , Attr.style "gap" "30px"
            ]
            [ detailCard "📅" "Date" model.weddingDate
            , detailCard "📍" "Venue" model.venue
            , detailCard "⏰" "Time" "4:00 PM"
            ]
        ]


detailCard : String -> String -> String -> Html FrontendMsg
detailCard emoji title content =
    Html.div
        [ Attr.style "background" "white"
        , Attr.style "padding" "30px"
        , Attr.style "border-radius" "10px"
        , Attr.style "box-shadow" "0 4px 6px rgba(0,0,0,0.1)"
        , Attr.style "min-width" "200px"
        , Attr.style "flex" "1"
        ]
        [ Html.div
            [ Attr.style "font-size" "3em"
            , Attr.style "margin-bottom" "10px"
            ]
            [ Html.text emoji ]
        , Html.h3
            [ Attr.style "margin" "10px 0"
            , Attr.style "color" "#667eea"
            , Attr.style "font-weight" "400"
            ]
            [ Html.text title ]
        , Html.p
            [ Attr.style "margin" "10px 0"
            , Attr.style "color" "#666"
            , Attr.style "font-size" "1.1em"
            ]
            [ Html.text content ]
        ]


rsvpSection : Model -> Html FrontendMsg
rsvpSection model =
    Html.div
        [ Attr.style "background" "white"
        , Attr.style "padding" "60px 20px"
        , Attr.style "text-align" "center"
        ]
        [ Html.h2
            [ Attr.style "font-size" "2.5em"
            , Attr.style "margin-bottom" "20px"
            , Attr.style "color" "#333"
            , Attr.style "font-weight" "400"
            ]
            [ Html.text "RSVP" ]
        , Html.p
            [ Attr.style "color" "#666"
            , Attr.style "font-size" "1.2em"
            , Attr.style "margin-bottom" "30px"
            ]
            [ Html.text "We'd love to celebrate with you!" ]
        , Html.button
            [ Events.onClick ToggleRsvpForm
            , Attr.style "background" "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            , Attr.style "color" "white"
            , Attr.style "border" "none"
            , Attr.style "padding" "15px 40px"
            , Attr.style "font-size" "1.2em"
            , Attr.style "border-radius" "30px"
            , Attr.style "cursor" "pointer"
            , Attr.style "font-family" "'Georgia', 'Times New Roman', serif"
            , Attr.style "transition" "transform 0.2s"
            ]
            [ Html.text
                (if model.showRsvpForm then
                    "Hide RSVP Form"

                 else
                    "RSVP Now"
                )
            ]
        , if model.showRsvpForm then
            rsvpForm

          else
            Html.text ""
        ]


rsvpForm : Html FrontendMsg
rsvpForm =
    Html.div
        [ Attr.style "max-width" "500px"
        , Attr.style "margin" "30px auto"
        , Attr.style "text-align" "left"
        ]
        [ Html.div
            [ Attr.style "margin-bottom" "20px" ]
            [ Html.label
                [ Attr.style "display" "block"
                , Attr.style "margin-bottom" "5px"
                , Attr.style "color" "#333"
                ]
                [ Html.text "Your Name" ]
            , Html.input
                [ Attr.type_ "text"
                , Attr.style "width" "100%"
                , Attr.style "padding" "10px"
                , Attr.style "border" "1px solid #ddd"
                , Attr.style "border-radius" "5px"
                , Attr.style "font-size" "1em"
                , Attr.style "box-sizing" "border-box"
                ]
                []
            ]
        , Html.div
            [ Attr.style "margin-bottom" "20px" ]
            [ Html.label
                [ Attr.style "display" "block"
                , Attr.style "margin-bottom" "5px"
                , Attr.style "color" "#333"
                ]
                [ Html.text "Email" ]
            , Html.input
                [ Attr.type_ "email"
                , Attr.style "width" "100%"
                , Attr.style "padding" "10px"
                , Attr.style "border" "1px solid #ddd"
                , Attr.style "border-radius" "5px"
                , Attr.style "font-size" "1em"
                , Attr.style "box-sizing" "border-box"
                ]
                []
            ]
        , Html.div
            [ Attr.style "margin-bottom" "20px" ]
            [ Html.label
                [ Attr.style "display" "block"
                , Attr.style "margin-bottom" "5px"
                , Attr.style "color" "#333"
                ]
                [ Html.text "Will you attend?" ]
            , Html.select
                [ Attr.style "width" "100%"
                , Attr.style "padding" "10px"
                , Attr.style "border" "1px solid #ddd"
                , Attr.style "border-radius" "5px"
                , Attr.style "font-size" "1em"
                , Attr.style "box-sizing" "border-box"
                ]
                [ Html.option [] [ Html.text "Yes, I'll be there!" ]
                , Html.option [] [ Html.text "Sorry, can't make it" ]
                ]
            ]
        , Html.button
            [ Attr.style "background" "#667eea"
            , Attr.style "color" "white"
            , Attr.style "border" "none"
            , Attr.style "padding" "12px 30px"
            , Attr.style "font-size" "1.1em"
            , Attr.style "border-radius" "5px"
            , Attr.style "cursor" "pointer"
            , Attr.style "width" "100%"
            ]
            [ Html.text "Submit RSVP" ]
        ]


footerSection : Html FrontendMsg
footerSection =
    Html.div
        [ Attr.style "text-align" "center"
        , Attr.style "padding" "40px 20px"
        , Attr.style "background" "#f8f9fa"
        , Attr.style "color" "#666"
        ]
        [ Html.p
            [ Attr.style "margin" "0"
            , Attr.style "font-style" "italic"
            ]
            [ Html.text "Looking forward to celebrating with you!" ]
        ]