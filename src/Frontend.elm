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
      , route = urlToRoute url
      , coupleNames = ( "Your Name", "Partner Name" )
      , weddingDate = "June 15, 2026"
      , venue = "The Grand Ballroom"
      , rsvpName = ""
      , rsvpEmail = ""
      , rsvpAttending = Attending
      , rsvpSubmitted = False
      , rsvpCount = 0
      }
    , Cmd.none
    )


urlToRoute : Url.Url -> Route
urlToRoute url =
    case url.path of
        "/rsvp" ->
            RsvpPage

        _ ->
            HomePage


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
            ( { model | route = urlToRoute url }, Cmd.none )

        UpdateRsvpName name ->
            ( { model | rsvpName = name }, Cmd.none )

        UpdateRsvpEmail email ->
            ( { model | rsvpEmail = email }, Cmd.none )

        UpdateRsvpAttending status ->
            ( { model | rsvpAttending = status }, Cmd.none )

        SubmitRsvp ->
            let
                rsvp =
                    { name = model.rsvpName
                    , email = model.rsvpEmail
                    , attending = model.rsvpAttending
                    }
            in
            ( { model | rsvpSubmitted = True }
            , Lamdera.sendToBackend (SubmitRsvpToBackend rsvp)
            )

        NoOpFrontendMsg ->
            ( model, Cmd.none )


updateFromBackend : ToFrontend -> Model -> ( Model, Cmd FrontendMsg )
updateFromBackend msg model =
    case msg of
        RsvpSubmitted count ->
            ( { model | rsvpCount = count }, Cmd.none )

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
            [ case model.route of
                HomePage ->
                    homePage model name1 name2

                RsvpPage ->
                    rsvpPage model name1 name2
            ]
        ]
    }


homePage : Model -> String -> String -> Html FrontendMsg
homePage model name1 name2 =
    Html.div []
        [ heroSection model name1 name2
        , detailsSection model
        , rsvpCallToAction model
        , footerSection
        ]


rsvpPage : Model -> String -> String -> Html FrontendMsg
rsvpPage model name1 name2 =
    Html.div []
        [ heroSection model name1 name2
        , Html.div
            [ Attr.style "max-width" "600px"
            , Attr.style "margin" "40px auto"
            , Attr.style "padding" "20px"
            ]
            [ Html.a
                [ Attr.href "/"
                , Attr.style "color" "#667eea"
                , Attr.style "text-decoration" "none"
                , Attr.style "display" "inline-block"
                , Attr.style "margin-bottom" "20px"
                , Attr.style "font-size" "1.1em"
                ]
                [ Html.text "← Back to Home" ]
            ]
        , rsvpFormSection model
        , footerSection
        ]


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


rsvpCallToAction : Model -> Html FrontendMsg
rsvpCallToAction _ =
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
        , Html.a
            [ Attr.href "/rsvp"
            , Attr.style "background" "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            , Attr.style "color" "white"
            , Attr.style "border" "none"
            , Attr.style "padding" "15px 40px"
            , Attr.style "font-size" "1.2em"
            , Attr.style "border-radius" "30px"
            , Attr.style "cursor" "pointer"
            , Attr.style "font-family" "'Georgia', 'Times New Roman', serif"
            , Attr.style "text-decoration" "none"
            , Attr.style "display" "inline-block"
            ]
            [ Html.text "RSVP Now" ]
        ]


rsvpFormSection : Model -> Html FrontendMsg
rsvpFormSection model =
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
        , rsvpForm model
        ]


rsvpForm : Model -> Html FrontendMsg
rsvpForm model =
    Html.div
        [ Attr.style "max-width" "500px"
        , Attr.style "margin" "30px auto"
        , Attr.style "text-align" "left"
        ]
        [ if model.rsvpSubmitted then
            Html.div
                [ Attr.style "background" "#d4edda"
                , Attr.style "color" "#155724"
                , Attr.style "padding" "15px"
                , Attr.style "border-radius" "5px"
                , Attr.style "margin-bottom" "20px"
                , Attr.style "text-align" "center"
                ]
                [ Html.text ("Thank you! Your RSVP has been received. Total RSVPs: " ++ String.fromInt model.rsvpCount) ]

          else
            Html.text ""
        , Html.div
            [ Attr.style "margin-bottom" "20px" ]
            [ Html.label
                [ Attr.style "display" "block"
                , Attr.style "margin-bottom" "5px"
                , Attr.style "color" "#333"
                ]
                [ Html.text "Your Name" ]
            , Html.input
                [ Attr.type_ "text"
                , Attr.value model.rsvpName
                , Events.onInput UpdateRsvpName
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
                , Attr.value model.rsvpEmail
                , Events.onInput UpdateRsvpEmail
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
                [ Events.onInput
                    (\val ->
                        if val == "attending" then
                            UpdateRsvpAttending Attending

                        else
                            UpdateRsvpAttending NotAttending
                    )
                , Attr.style "width" "100%"
                , Attr.style "padding" "10px"
                , Attr.style "border" "1px solid #ddd"
                , Attr.style "border-radius" "5px"
                , Attr.style "font-size" "1em"
                , Attr.style "box-sizing" "border-box"
                ]
                [ Html.option [ Attr.value "attending" ] [ Html.text "Yes, I'll be there!" ]
                , Html.option [ Attr.value "not-attending" ] [ Html.text "Sorry, can't make it" ]
                ]
            ]
        , Html.button
            [ Events.onClick SubmitRsvp
            , Attr.disabled model.rsvpSubmitted
            , Attr.style "background"
                (if model.rsvpSubmitted then
                    "#ccc"

                 else
                    "#667eea"
                )
            , Attr.style "color" "white"
            , Attr.style "border" "none"
            , Attr.style "padding" "12px 30px"
            , Attr.style "font-size" "1.1em"
            , Attr.style "border-radius" "5px"
            , Attr.style "cursor"
                (if model.rsvpSubmitted then
                    "not-allowed"

                 else
                    "pointer"
                )
            , Attr.style "width" "100%"
            ]
            [ Html.text
                (if model.rsvpSubmitted then
                    "RSVP Submitted"

                 else
                    "Submit RSVP"
                )
            ]
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
