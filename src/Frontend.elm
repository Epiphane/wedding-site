module Frontend exposing (..)

import Browser exposing (UrlRequest(..))
import Browser.Navigation as Nav
import Dict
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
        , subscriptions = \_ -> Sub.none
        , view = view
        }


init : Url.Url -> Nav.Key -> ( Model, Cmd FrontendMsg )
init url key =
    ( { key = key
      , route = urlToRoute url
      , coupleNames = ( "Thomas Steinke", "Liz Petersen" )
      , weddingDate = "August 22, 2026"
      , venue = "Ampitheatre of the Redwoods"
      , rsvpStep = EnteringName
      , rsvpName = ""
      , rsvpAttending = Attending
      , rsvpPlusOneName = ""
      , rsvpPlusOneAttending = Attending
      , rsvpSubmitted = False
      , rsvpCount = 0
      , adminAuthenticated = False
      , adminPasswordInput = ""
      , adminLoginError = False
      , adminGuestList = []
      , adminEditingGuest = Nothing
      , adminFormName = ""
      , adminFormEmail = ""
      , adminFormPlusOne = False
      , canvas = Dict.empty
      , selectedColor = "#FF0000"
      }
    , Lamdera.sendToBackend CheckAdminAuth
    )


urlToRoute : Url.Url -> Route
urlToRoute url =
    case url.path of
        "/rsvp" ->
            RsvpPage

        "/admin" ->
            AdminPage

        "/canvas" ->
            CanvasPage

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
            let
                newRoute =
                    urlToRoute url

                cmd =
                    if newRoute == CanvasPage then
                        Lamdera.sendToBackend GetCanvas

                    else
                        Cmd.none
            in
            ( { model | route = newRoute }, cmd )

        UpdateRsvpName name ->
            ( { model | rsvpName = name }, Cmd.none )

        LookupGuest ->
            ( model, Lamdera.sendToBackend (LookupGuestByName model.rsvpName) )

        UpdateRsvpAttending status ->
            ( { model | rsvpAttending = status }, Cmd.none )

        UpdateRsvpPlusOneName name ->
            ( { model | rsvpPlusOneName = name }, Cmd.none )

        UpdateRsvpPlusOneAttending status ->
            ( { model | rsvpPlusOneAttending = status }, Cmd.none )

        UpdateAdminPassword password ->
            ( { model | adminPasswordInput = password }, Cmd.none )

        AttemptAdminLogin ->
            ( model, Lamdera.sendToBackend (AdminLogin model.adminPasswordInput) )

        SubmitRsvp ->
            case model.rsvpStep of
                GuestConfirmed guest ->
                    let
                        rsvp =
                            { guestName = guest.name
                            , email = guest.email
                            , attending = model.rsvpAttending
                            , plusOneName =
                                if guest.plusOne && model.rsvpPlusOneName /= "" then
                                    Just model.rsvpPlusOneName

                                else
                                    Nothing
                            , plusOneAttending =
                                if guest.plusOne && model.rsvpPlusOneName /= "" then
                                    Just model.rsvpPlusOneAttending

                                else
                                    Nothing
                            }
                    in
                    ( { model | rsvpSubmitted = True }
                    , Lamdera.sendToBackend (SubmitRsvpToBackend rsvp)
                    )

                _ ->
                    ( model, Cmd.none )

        RequestGuestList ->
            ( model, Lamdera.sendToBackend GetGuestList )

        UpdateAdminFormName name ->
            ( { model | adminFormName = name }, Cmd.none )

        UpdateAdminFormEmail email ->
            ( { model | adminFormEmail = email }, Cmd.none )

        UpdateAdminFormPlusOne plusOne ->
            ( { model | adminFormPlusOne = plusOne }, Cmd.none )

        StartEditGuest guest ->
            ( { model
                | adminEditingGuest = Just guest
                , adminFormName = guest.name
                , adminFormEmail = guest.email
                , adminFormPlusOne = guest.plusOne
              }
            , Cmd.none
            )

        CancelEditGuest ->
            ( { model
                | adminEditingGuest = Nothing
                , adminFormName = ""
                , adminFormEmail = ""
                , adminFormPlusOne = False
              }
            , Cmd.none
            )

        SaveGuest ->
            let
                guest =
                    { name = model.adminFormName
                    , email = model.adminFormEmail
                    , plusOne = model.adminFormPlusOne
                    }
            in
            ( { model
                | adminFormName = ""
                , adminFormEmail = ""
                , adminFormPlusOne = False
                , adminEditingGuest = Nothing
              }
            , Lamdera.sendToBackend (AddOrUpdateGuest guest)
            )

        DeleteGuest email ->
            ( model, Lamdera.sendToBackend (DeleteGuestByEmail email) )

        AdminAuthLoadedFromStorage _ ->
            ( model, Cmd.none )

        AdminLogout ->
            ( { model | adminAuthenticated = False }
            , Lamdera.sendToBackend AdminLogoutBackend
            )

        SelectColor color ->
            ( { model | selectedColor = color }, Cmd.none )

        PlacePixel x y ->
            ( model, Lamdera.sendToBackend (PlacePixelOnCanvas x y model.selectedColor) )

        NoOpFrontendMsg ->
            ( model, Cmd.none )


updateFromBackend : ToFrontend -> Model -> ( Model, Cmd FrontendMsg )
updateFromBackend msg model =
    case msg of
        GuestFound guest ->
            ( { model | rsvpStep = GuestConfirmed guest }, Cmd.none )

        GuestNotFoundResponse ->
            ( { model | rsvpStep = GuestNotFound }, Cmd.none )

        RsvpSubmitted count ->
            ( { model | rsvpCount = count }, Cmd.none )

        GuestListReceived guests ->
            ( { model | adminGuestList = guests }, Cmd.none )

        GuestSaved ->
            ( model, Lamdera.sendToBackend GetGuestList )

        GuestDeleted ->
            ( model, Lamdera.sendToBackend GetGuestList )

        AdminAuthStatus isAuthenticated ->
            if isAuthenticated then
                ( { model | adminAuthenticated = True }
                , Lamdera.sendToBackend GetGuestList
                )

            else
                ( model, Cmd.none )

        AdminLoginSuccess ->
            ( { model
                | adminAuthenticated = True
                , adminPasswordInput = ""
                , adminLoginError = False
              }
            , Lamdera.sendToBackend GetGuestList
            )

        AdminLoginFailed ->
            ( { model
                | adminAuthenticated = False
                , adminLoginError = True
              }
            , Cmd.none
            )

        CanvasUpdated canvas ->
            ( { model | canvas = canvas }, Cmd.none )

        PixelPlaced x y color ->
            let
                updatedCanvas =
                    Dict.insert ( x, y ) color model.canvas
            in
            ( { model | canvas = updatedCanvas }, Cmd.none )

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
            , Attr.style "background" "#fafafa"
            ]
            [ case model.route of
                HomePage ->
                    homePage model name1 name2

                RsvpPage ->
                    rsvpPage model name1 name2

                AdminPage ->
                    adminPage model

                CanvasPage ->
                    canvasPage model
            ]
        ]
    }


navigationBar : Route -> Bool -> Html FrontendMsg
navigationBar currentRoute isAdminAuthenticated =
    Html.nav
        [ Attr.style "background" "white"
        , Attr.style "border-top" "1px solid #e0e0e0"
        , Attr.style "border-bottom" "1px solid #e0e0e0"
        , Attr.style "padding" "15px 0"
        ]
        [ Html.div
            [ Attr.style "display" "flex"
            , Attr.style "justify-content" "center"
            , Attr.style "align-items" "center"
            , Attr.style "gap" "40px"
            , Attr.style "flex-wrap" "wrap"
            ]
            ([ navLink "/" "Home" (currentRoute == HomePage)
             , navLink "/rsvp" "RSVP" (currentRoute == RsvpPage)
             , navLink "/canvas" "Canvas" (currentRoute == CanvasPage)
             ]
                ++ (if isAdminAuthenticated then
                        [ navLink "/admin" "Admin" (currentRoute == AdminPage) ]

                    else
                        []
                   )
            )
        ]


navLink : String -> String -> Bool -> Html FrontendMsg
navLink href label isActive =
    Html.a
        [ Attr.href href
        , Attr.style "text-decoration" "none"
        , Attr.style "color" "#333"
        , Attr.style "font-family" "'Georgia', 'Times New Roman', serif"
        , Attr.style "font-size" "0.95em"
        , Attr.style "padding" "5px 0"
        , Attr.style "border-bottom"
            (if isActive then
                "2px solid #333"

             else
                "2px solid transparent"
            )
        , Attr.style "transition" "border-color 0.2s"
        ]
        [ Html.text label ]


homePage : Model -> String -> String -> Html FrontendMsg
homePage model name1 name2 =
    Html.div []
        [ dateLocationHeader model
        , coupleNamesHeader name1 name2
        , navigationBar model.route model.adminAuthenticated
        , heroImageSection
        , coupleFullNamesSection model name1 name2
        , detailsSection model
        , rsvpCallToAction model
        , footerSection
        ]


rsvpPage : Model -> String -> String -> Html FrontendMsg
rsvpPage model name1 name2 =
    Html.div []
        [ dateLocationHeader model
        , coupleNamesHeader name1 name2
        , navigationBar model.route model.adminAuthenticated
        , rsvpFormSection model
        , footerSection
        ]



-- HELPER FUNCTIONS FOR COMMON STYLES


primaryButton : List (Html.Attribute msg) -> List (Html msg) -> Html msg
primaryButton attrs children =
    Html.button
        ([ Attr.style "background" "#333"
         , Attr.style "color" "white"
         , Attr.style "border" "none"
         , Attr.style "padding" "12px 30px"
         , Attr.style "font-size" "1em"
         , Attr.style "border-radius" "2px"
         , Attr.style "cursor" "pointer"
         , Attr.style "font-family" "'Georgia', 'Times New Roman', serif"
         , Attr.style "transition" "background 0.2s"
         ]
            ++ attrs
        )
        children


secondaryButton : List (Html.Attribute msg) -> List (Html msg) -> Html msg
secondaryButton attrs children =
    Html.button
        ([ Attr.style "background" "#666"
         , Attr.style "color" "white"
         , Attr.style "border" "none"
         , Attr.style "padding" "12px 30px"
         , Attr.style "font-size" "1em"
         , Attr.style "border-radius" "2px"
         , Attr.style "cursor" "pointer"
         , Attr.style "font-family" "'Georgia', 'Times New Roman', serif"
         ]
            ++ attrs
        )
        children


card : List (Html.Attribute msg) -> List (Html msg) -> Html msg
card attrs children =
    Html.div
        ([ Attr.style "background" "white"
         , Attr.style "padding" "30px"
         , Attr.style "border-radius" "2px"
         , Attr.style "border" "1px solid #e0e0e0"
         ]
            ++ attrs
        )
        children


dateLocationHeader : Model -> Html FrontendMsg
dateLocationHeader model =
    Html.div
        [ Attr.style "display" "flex"
        , Attr.style "justify-content" "space-between"
        , Attr.style "padding" "20px 40px"
        , Attr.style "font-family" "'Georgia', 'Times New Roman', serif"
        , Attr.style "color" "#333"
        ]
        [ Html.div [] [ Html.text model.weddingDate ]
        , Html.div [] [ Html.text model.venue ]
        ]


coupleNamesHeader : String -> String -> Html FrontendMsg
coupleNamesHeader name1 name2 =
    Html.div
        [ Attr.style "text-align" "center"
        , Attr.style "padding" "40px 20px 20px"
        ]
        [ Html.h1
            [ Attr.style "font-family" "'Georgia', 'Times New Roman', serif"
            , Attr.style "font-size" "3em"
            , Attr.style "font-weight" "400"
            , Attr.style "margin" "0"
            , Attr.style "color" "#333"
            , Attr.style "letter-spacing" "1px"
            ]
            [ Html.text (name1 ++ " & " ++ name2) ]
        ]


heroImageSection : Html FrontendMsg
heroImageSection =
    Html.div
        [ Attr.style "width" "100%"
        , Attr.style "height" "600px"
        , Attr.style "background" "linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)"
        , Attr.style "display" "flex"
        , Attr.style "align-items" "center"
        , Attr.style "justify-content" "center"
        , Attr.style "color" "#999"
        , Attr.style "font-size" "1.5em"
        , Attr.style "font-style" "italic"
        ]
        [ Html.text "Hero Image" ]


coupleFullNamesSection : Model -> String -> String -> Html FrontendMsg
coupleFullNamesSection model name1 name2 =
    Html.div
        [ Attr.style "background" "white"
        , Attr.style "padding" "80px 20px"
        , Attr.style "text-align" "center"
        ]
        [ Html.div
            [ Attr.style "display" "flex"
            , Attr.style "justify-content" "center"
            , Attr.style "align-items" "center"
            , Attr.style "gap" "40px"
            , Attr.style "flex-wrap" "wrap"
            , Attr.style "font-family" "'Georgia', 'Times New Roman', serif"
            ]
            [ Html.div
                [ Attr.style "text-align" "right" ]
                [ Html.div
                    [ Attr.style "font-size" "2.5em"
                    , Attr.style "font-weight" "400"
                    , Attr.style "color" "#333"
                    , Attr.style "line-height" "1.2"
                    ]
                    [ Html.text name1 ]
                ]
            , Html.div
                [ Attr.style "font-size" "1.5em"
                , Attr.style "color" "#666"
                , Attr.style "font-style" "italic"
                ]
                [ Html.text "and" ]
            , Html.div
                [ Attr.style "text-align" "left" ]
                [ Html.div
                    [ Attr.style "font-size" "2.5em"
                    , Attr.style "font-weight" "400"
                    , Attr.style "color" "#333"
                    , Attr.style "line-height" "1.2"
                    ]
                    [ Html.text name2 ]
                ]
            ]
        , Html.div
            [ Attr.style "margin-top" "40px"
            , Attr.style "font-size" "1.8em"
            , Attr.style "color" "#333"
            , Attr.style "font-family" "'Georgia', 'Times New Roman', serif"
            ]
            [ Html.text (model.weddingDate ++ " | 4:00 PM") ]
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
            [ Attr.style "font-size" "2.5em"
            , Attr.style "margin" "0"
            , Attr.style "font-weight" "400"
            , Attr.style "letter-spacing" "2px"
            ]
            [ Html.text (name1 ++ " & " ++ name2) ]
        , Html.div
            [ Attr.style "margin-top" "40px"
            , Attr.style "font-size" "1.3em"
            , Attr.style "opacity" "0.95"
            ]
            [ Html.div
                [ Attr.style "margin-bottom" "10px" ]
                [ Html.text (model.weddingDate ++ " | 4:00 PM") ]
            , Html.div []
                [ Html.text model.venue ]
            ]
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
        , Attr.style "padding" "80px 20px"
        , Attr.style "text-align" "center"
        , Attr.style "min-height" "60vh"
        ]
        [ Html.h2
            [ Attr.style "font-size" "2em"
            , Attr.style "margin-bottom" "20px"
            , Attr.style "color" "#333"
            , Attr.style "font-weight" "400"
            , Attr.style "font-family" "'Georgia', 'Times New Roman', serif"
            ]
            [ Html.text "RSVP" ]
        , Html.p
            [ Attr.style "color" "#666"
            , Attr.style "font-size" "1.1em"
            , Attr.style "margin-bottom" "40px"
            , Attr.style "font-family" "'Georgia', 'Times New Roman', serif"
            ]
            [ Html.text "We'd love to celebrate with you!" ]
        , rsvpForm model
        ]


rsvpForm : Model -> Html FrontendMsg
rsvpForm model =
    card
        [ Attr.style "max-width" "500px"
        , Attr.style "margin" "30px auto"
        , Attr.style "text-align" "left"
        , Attr.style "background" "#fafafa"
        , Attr.style "padding" "40px"
        ]
        (case model.rsvpStep of
            EnteringName ->
                [ Html.p
                    [ Attr.style "color" "#666"
                    , Attr.style "margin-bottom" "20px"
                    ]
                    [ Html.text "Please enter your name to find your invitation." ]
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
                        , Attr.placeholder "Enter your full name"
                        , Attr.style "width" "100%"
                        , Attr.style "padding" "10px"
                        , Attr.style "border" "1px solid #ddd"
                        , Attr.style "border-radius" "5px"
                        , Attr.style "font-size" "1em"
                        , Attr.style "box-sizing" "border-box"
                        ]
                        []
                    ]
                , primaryButton
                    [ Events.onClick LookupGuest
                    , Attr.disabled (String.trim model.rsvpName == "")
                    , Attr.style "width" "100%"
                    ]
                    [ Html.text "Find My Invitation" ]
                ]

            GuestNotFound ->
                [ Html.div
                    [ Attr.style "background" "#f8d7da"
                    , Attr.style "color" "#721c24"
                    , Attr.style "padding" "15px"
                    , Attr.style "border-radius" "5px"
                    , Attr.style "margin-bottom" "20px"
                    , Attr.style "text-align" "center"
                    ]
                    [ Html.text "We couldn't find your name on the guest list. Please check the spelling and try again." ]
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
                        , Attr.placeholder "Enter your full name"
                        , Attr.style "width" "100%"
                        , Attr.style "padding" "10px"
                        , Attr.style "border" "1px solid #ddd"
                        , Attr.style "border-radius" "5px"
                        , Attr.style "font-size" "1em"
                        , Attr.style "box-sizing" "border-box"
                        ]
                        []
                    ]
                , primaryButton
                    [ Events.onClick LookupGuest
                    , Attr.disabled (String.trim model.rsvpName == "")
                    , Attr.style "width" "100%"
                    ]
                    [ Html.text "Try Again" ]
                ]

            GuestConfirmed guest ->
                if model.rsvpSubmitted then
                    [ Html.div
                        [ Attr.style "background" "#d4edda"
                        , Attr.style "color" "#155724"
                        , Attr.style "padding" "15px"
                        , Attr.style "border-radius" "5px"
                        , Attr.style "text-align" "center"
                        ]
                        [ Html.text ("Thank you! Your RSVP has been received. Total RSVPs: " ++ String.fromInt model.rsvpCount) ]
                    ]

                else
                    [ Html.div
                        [ Attr.style "background" "#d4edda"
                        , Attr.style "color" "#155724"
                        , Attr.style "padding" "15px"
                        , Attr.style "border-radius" "5px"
                        , Attr.style "margin-bottom" "20px"
                        , Attr.style "text-align" "center"
                        ]
                        [ Html.text ("Welcome, " ++ guest.name ++ "!") ]
                    , Html.div
                        [ Attr.style "margin-bottom" "20px" ]
                        [ Html.label
                            [ Attr.style "display" "block"
                            , Attr.style "margin-bottom" "5px"
                            , Attr.style "color" "#333"
                            , Attr.style "font-weight" "bold"
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
                    , if guest.plusOne then
                        Html.div []
                            [ Html.div
                                [ Attr.style "margin-top" "30px"
                                , Attr.style "margin-bottom" "20px"
                                , Attr.style "padding-top" "20px"
                                , Attr.style "border-top" "1px solid #ddd"
                                ]
                                [ Html.label
                                    [ Attr.style "display" "block"
                                    , Attr.style "margin-bottom" "5px"
                                    , Attr.style "color" "#333"
                                    , Attr.style "font-weight" "bold"
                                    ]
                                    [ Html.text "Plus One (Optional)" ]
                                , Html.p
                                    [ Attr.style "color" "#666"
                                    , Attr.style "font-size" "0.9em"
                                    , Attr.style "margin-top" "5px"
                                    ]
                                    [ Html.text "You're invited to bring a guest!" ]
                                ]
                            , Html.div
                                [ Attr.style "margin-bottom" "20px" ]
                                [ Html.label
                                    [ Attr.style "display" "block"
                                    , Attr.style "margin-bottom" "5px"
                                    , Attr.style "color" "#333"
                                    ]
                                    [ Html.text "Plus One Name" ]
                                , Html.input
                                    [ Attr.type_ "text"
                                    , Attr.value model.rsvpPlusOneName
                                    , Events.onInput UpdateRsvpPlusOneName
                                    , Attr.placeholder "Guest name (optional)"
                                    , Attr.style "width" "100%"
                                    , Attr.style "padding" "10px"
                                    , Attr.style "border" "1px solid #ddd"
                                    , Attr.style "border-radius" "5px"
                                    , Attr.style "font-size" "1em"
                                    , Attr.style "box-sizing" "border-box"
                                    ]
                                    []
                                ]
                            , if model.rsvpPlusOneName /= "" then
                                Html.div
                                    [ Attr.style "margin-bottom" "20px" ]
                                    [ Html.label
                                        [ Attr.style "display" "block"
                                        , Attr.style "margin-bottom" "5px"
                                        , Attr.style "color" "#333"
                                        ]
                                        [ Html.text "Will they attend?" ]
                                    , Html.select
                                        [ Events.onInput
                                            (\val ->
                                                if val == "attending" then
                                                    UpdateRsvpPlusOneAttending Attending

                                                else
                                                    UpdateRsvpPlusOneAttending NotAttending
                                            )
                                        , Attr.style "width" "100%"
                                        , Attr.style "padding" "10px"
                                        , Attr.style "border" "1px solid #ddd"
                                        , Attr.style "border-radius" "5px"
                                        , Attr.style "font-size" "1em"
                                        , Attr.style "box-sizing" "border-box"
                                        ]
                                        [ Html.option [ Attr.value "attending" ] [ Html.text "Yes" ]
                                        , Html.option [ Attr.value "not-attending" ] [ Html.text "No" ]
                                        ]
                                    ]

                              else
                                Html.text ""
                            ]

                      else
                        Html.text ""
                    , primaryButton
                        [ Events.onClick SubmitRsvp
                        , Attr.style "width" "100%"
                        , Attr.style "margin-top" "20px"
                        ]
                        [ Html.text "Submit RSVP" ]
                    ]
        )


adminPage : Model -> Html FrontendMsg
adminPage model =
    let
        ( name1, name2 ) =
            model.coupleNames
    in
    Html.div []
        [ dateLocationHeader model
        , coupleNamesHeader name1 name2
        , navigationBar model.route model.adminAuthenticated
        , if model.adminAuthenticated then
            Html.div []
                [ Html.div
                    [ Attr.style "max-width" "1000px"
                    , Attr.style "margin" "20px auto"
                    , Attr.style "padding" "0 20px"
                    , Attr.style "display" "flex"
                    , Attr.style "justify-content" "flex-end"
                    ]
                    [ primaryButton
                        [ Events.onClick AdminLogout
                        , Attr.style "padding" "10px 20px"
                        , Attr.style "font-size" "0.9em"
                        ]
                        [ Html.text "Logout" ]
                    ]
                , Html.div
                    [ Attr.style "max-width" "1000px"
                    , Attr.style "margin" "20px auto"
                    , Attr.style "padding" "20px"
                    ]
                    [ adminGuestForm model
                    , adminGuestTable model
                    ]
                ]

          else
            adminLoginForm model
        ]


adminLoginForm : Model -> Html FrontendMsg
adminLoginForm model =
    Html.div
        [ Attr.style "max-width" "400px"
        , Attr.style "margin" "40px auto"
        , Attr.style "padding" "20px"
        ]
        [ card
            [ Attr.style "padding" "40px" ]
            [ Html.h2
                [ Attr.style "margin-top" "0"
                , Attr.style "color" "#333"
                , Attr.style "text-align" "center"
                ]
                [ Html.text "Admin Login" ]
            , if model.adminLoginError then
                Html.div
                    [ Attr.style "background" "#f8d7da"
                    , Attr.style "color" "#721c24"
                    , Attr.style "padding" "15px"
                    , Attr.style "border-radius" "5px"
                    , Attr.style "margin-bottom" "20px"
                    , Attr.style "text-align" "center"
                    ]
                    [ Html.text "Invalid password. Please try again." ]

              else
                Html.text ""
            , Html.div
                [ Attr.style "margin-bottom" "20px" ]
                [ Html.label
                    [ Attr.style "display" "block"
                    , Attr.style "margin-bottom" "5px"
                    , Attr.style "color" "#333"
                    , Attr.style "font-weight" "bold"
                    ]
                    [ Html.text "Password" ]
                , Html.input
                    [ Attr.type_ "password"
                    , Attr.value model.adminPasswordInput
                    , Events.onInput UpdateAdminPassword
                    , Attr.placeholder "Enter admin password"
                    , Attr.style "width" "100%"
                    , Attr.style "padding" "10px"
                    , Attr.style "border" "1px solid #ddd"
                    , Attr.style "border-radius" "5px"
                    , Attr.style "font-size" "1em"
                    , Attr.style "box-sizing" "border-box"
                    ]
                    []
                ]
            , primaryButton
                [ Events.onClick AttemptAdminLogin
                , Attr.disabled (String.trim model.adminPasswordInput == "")
                , Attr.style "width" "100%"
                ]
                [ Html.text "Login" ]
            ]
        ]


adminGuestForm : Model -> Html FrontendMsg
adminGuestForm model =
    card
        [ Attr.style "margin-bottom" "30px" ]
        [ Html.h2
            [ Attr.style "margin-top" "0"
            , Attr.style "color" "#333"
            ]
            [ Html.text
                (case model.adminEditingGuest of
                    Just _ ->
                        "Edit Guest"

                    Nothing ->
                        "Add New Guest"
                )
            ]
        , Html.div
            [ Attr.style "display" "grid"
            , Attr.style "grid-template-columns" "1fr 1fr"
            , Attr.style "gap" "20px"
            , Attr.style "margin-bottom" "20px"
            ]
            [ Html.div []
                [ Html.label
                    [ Attr.style "display" "block"
                    , Attr.style "margin-bottom" "5px"
                    , Attr.style "color" "#333"
                    , Attr.style "font-weight" "bold"
                    ]
                    [ Html.text "Name" ]
                , Html.input
                    [ Attr.type_ "text"
                    , Attr.value model.adminFormName
                    , Events.onInput UpdateAdminFormName
                    , Attr.placeholder "Guest name"
                    , Attr.style "width" "100%"
                    , Attr.style "padding" "10px"
                    , Attr.style "border" "1px solid #ddd"
                    , Attr.style "border-radius" "5px"
                    , Attr.style "font-size" "1em"
                    , Attr.style "box-sizing" "border-box"
                    ]
                    []
                ]
            , Html.div []
                [ Html.label
                    [ Attr.style "display" "block"
                    , Attr.style "margin-bottom" "5px"
                    , Attr.style "color" "#333"
                    , Attr.style "font-weight" "bold"
                    ]
                    [ Html.text "Email" ]
                , Html.input
                    [ Attr.type_ "email"
                    , Attr.value model.adminFormEmail
                    , Events.onInput UpdateAdminFormEmail
                    , Attr.placeholder "guest@example.com"
                    , Attr.style "width" "100%"
                    , Attr.style "padding" "10px"
                    , Attr.style "border" "1px solid #ddd"
                    , Attr.style "border-radius" "5px"
                    , Attr.style "font-size" "1em"
                    , Attr.style "box-sizing" "border-box"
                    ]
                    []
                ]
            ]
        , Html.div
            [ Attr.style "margin-bottom" "20px" ]
            [ Html.label
                [ Attr.style "display" "flex"
                , Attr.style "align-items" "center"
                , Attr.style "cursor" "pointer"
                ]
                [ Html.input
                    [ Attr.type_ "checkbox"
                    , Attr.checked model.adminFormPlusOne
                    , Events.onCheck UpdateAdminFormPlusOne
                    , Attr.style "margin-right" "10px"
                    , Attr.style "width" "20px"
                    , Attr.style "height" "20px"
                    , Attr.style "cursor" "pointer"
                    ]
                    []
                , Html.text "Allow Plus One"
                ]
            ]
        , Html.div
            [ Attr.style "display" "flex"
            , Attr.style "gap" "10px"
            ]
            [ primaryButton
                [ Events.onClick SaveGuest
                , Attr.disabled (String.trim model.adminFormName == "" || String.trim model.adminFormEmail == "")
                , Attr.style "flex" "1"
                ]
                [ Html.text "Save Guest" ]
            , if model.adminEditingGuest /= Nothing then
                secondaryButton
                    [ Events.onClick CancelEditGuest ]
                    [ Html.text "Cancel" ]

              else
                Html.text ""
            ]
        ]


adminGuestTable : Model -> Html FrontendMsg
adminGuestTable model =
    card
        [ Attr.style "padding" "0"
        , Attr.style "overflow" "hidden"
        ]
        [ Html.h2
            [ Attr.style "padding" "20px"
            , Attr.style "margin" "0"
            , Attr.style "color" "#333"
            , Attr.style "border-bottom" "2px solid #f0f0f0"
            ]
            [ Html.text ("Guest List (" ++ String.fromInt (List.length model.adminGuestList) ++ " guests)") ]
        , if List.isEmpty model.adminGuestList then
            Html.div
                [ Attr.style "padding" "40px"
                , Attr.style "text-align" "center"
                , Attr.style "color" "#666"
                ]
                [ Html.text "No guests yet. Add your first guest above!" ]

          else
            Html.table
                [ Attr.style "width" "100%"
                , Attr.style "border-collapse" "collapse"
                ]
                [ Html.thead []
                    [ Html.tr
                        [ Attr.style "background" "#f8f9fa" ]
                        [ Html.th
                            [ Attr.style "text-align" "left"
                            , Attr.style "padding" "15px 20px"
                            , Attr.style "color" "#333"
                            , Attr.style "font-weight" "bold"
                            ]
                            [ Html.text "Name" ]
                        , Html.th
                            [ Attr.style "text-align" "left"
                            , Attr.style "padding" "15px 20px"
                            , Attr.style "color" "#333"
                            , Attr.style "font-weight" "bold"
                            ]
                            [ Html.text "Email" ]
                        , Html.th
                            [ Attr.style "text-align" "center"
                            , Attr.style "padding" "15px 20px"
                            , Attr.style "color" "#333"
                            , Attr.style "font-weight" "bold"
                            ]
                            [ Html.text "Plus One" ]
                        , Html.th
                            [ Attr.style "text-align" "right"
                            , Attr.style "padding" "15px 20px"
                            , Attr.style "color" "#333"
                            , Attr.style "font-weight" "bold"
                            ]
                            [ Html.text "Actions" ]
                        ]
                    ]
                , Html.tbody []
                    (List.map adminGuestRow model.adminGuestList)
                ]
        ]


adminGuestRow : Guest -> Html FrontendMsg
adminGuestRow guest =
    Html.tr
        [ Attr.style "border-top" "1px solid #e9ecef" ]
        [ Html.td
            [ Attr.style "padding" "15px 20px" ]
            [ Html.text guest.name ]
        , Html.td
            [ Attr.style "padding" "15px 20px"
            , Attr.style "color" "#666"
            ]
            [ Html.text guest.email ]
        , Html.td
            [ Attr.style "padding" "15px 20px"
            , Attr.style "text-align" "center"
            ]
            [ Html.text
                (if guest.plusOne then
                    "✓"

                 else
                    "✗"
                )
            ]
        , Html.td
            [ Attr.style "padding" "15px 20px"
            , Attr.style "text-align" "right"
            ]
            [ primaryButton
                [ Events.onClick (StartEditGuest guest)
                , Attr.style "padding" "8px 15px"
                , Attr.style "margin-right" "10px"
                , Attr.style "font-size" "0.9em"
                ]
                [ Html.text "Edit" ]
            , secondaryButton
                [ Events.onClick (DeleteGuest guest.email)
                , Attr.style "padding" "8px 15px"
                , Attr.style "font-size" "0.9em"
                ]
                [ Html.text "Delete" ]
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


canvasPage : Model -> Html FrontendMsg
canvasPage model =
    let
        ( name1, name2 ) =
            model.coupleNames
    in
    Html.div []
        [ dateLocationHeader model
        , coupleNamesHeader name1 name2
        , navigationBar model.route model.adminAuthenticated
        , Html.div
            [ Attr.style "max-width" "1200px"
            , Attr.style "margin" "40px auto"
            , Attr.style "padding" "20px"
            ]
            [ colorPalette model.selectedColor
            , canvasGrid model.canvas model.selectedColor
            ]
        , footerSection
        ]


colorPalette : String -> Html FrontendMsg
colorPalette selectedColor =
    let
        colors =
            [ "#FF0000"
            , "#FFA500"
            , "#FFFF00"
            , "#00FF00"
            , "#0000FF"
            , "#4B0082"
            , "#9400D3"
            , "#FFFFFF"
            , "#C0C0C0"
            , "#808080"
            , "#000000"
            , "#FF69B4"
            , "#00FFFF"
            , "#FFD700"
            , "#8B4513"
            , "#FFC0CB"
            ]
    in
    card
        [ Attr.style "padding" "20px"
        , Attr.style "margin-bottom" "20px"
        ]
        [ Html.h3
            [ Attr.style "margin-top" "0"
            , Attr.style "color" "#333"
            , Attr.style "font-family" "'Georgia', 'Times New Roman', serif"
            ]
            [ Html.text "Select Color" ]
        , Html.div
            [ Attr.style "display" "flex"
            , Attr.style "gap" "10px"
            , Attr.style "flex-wrap" "wrap"
            ]
            (List.map (colorButton selectedColor) colors)
        ]


colorButton : String -> String -> Html FrontendMsg
colorButton selectedColor color =
    Html.button
        [ Events.onClick (SelectColor color)
        , Attr.style "width" "50px"
        , Attr.style "height" "50px"
        , Attr.style "border-radius" "8px"
        , Attr.style "border"
            (if selectedColor == color then
                "3px solid #333"

             else
                "1px solid #ddd"
            )
        , Attr.style "background-color" color
        , Attr.style "cursor" "pointer"
        , Attr.style "transition" "all 0.2s"
        ]
        []


canvasGrid : Dict.Dict ( Int, Int ) String -> String -> Html FrontendMsg
canvasGrid canvas _ =
    let
        gridSize =
            50

        pixelSize =
            20
    in
    card
        [ Attr.style "padding" "20px"
        , Attr.style "display" "inline-block"
        ]
        [ Html.div
            [ Attr.style "display" "grid"
            , Attr.style "grid-template-columns" ("repeat(" ++ String.fromInt gridSize ++ ", " ++ String.fromInt pixelSize ++ "px)")
            , Attr.style "gap" "1px"
            , Attr.style "background-color" "#ddd"
            , Attr.style "padding" "1px"
            ]
            (List.range 0 (gridSize - 1)
                |> List.concatMap
                    (\y ->
                        List.range 0 (gridSize - 1)
                            |> List.map (\x -> canvasPixel canvas x y pixelSize)
                    )
            )
        ]


canvasPixel : Dict.Dict ( Int, Int ) String -> Int -> Int -> Int -> Html FrontendMsg
canvasPixel canvas x y pixelSize =
    let
        pixelColor =
            Dict.get ( x, y ) canvas
                |> Maybe.withDefault "#FFFFFF"
    in
    Html.div
        [ Events.onClick (PlacePixel x y)
        , Attr.style "width" (String.fromInt pixelSize ++ "px")
        , Attr.style "height" (String.fromInt pixelSize ++ "px")
        , Attr.style "background-color" pixelColor
        , Attr.style "cursor" "pointer"
        , Attr.style "transition" "background-color 0.1s"
        ]
        []
