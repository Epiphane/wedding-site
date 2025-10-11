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
        , subscriptions = \_ -> Sub.none
        , view = view
        }


init : Url.Url -> Nav.Key -> ( Model, Cmd FrontendMsg )
init url key =
    ( { key = key
      , route = urlToRoute url
      , coupleNames = ( "Your Name", "Partner Name" )
      , weddingDate = "June 15, 2026"
      , venue = "The Grand Ballroom"
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
      }
    , Cmd.none
    )


urlToRoute : Url.Url -> Route
urlToRoute url =
    case url.path of
        "/rsvp" ->
            RsvpPage

        "/admin" ->
            AdminPage

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

                AdminPage ->
                    adminPage model
            ]
        ]
    }


navigationBar : Route -> Html FrontendMsg
navigationBar currentRoute =
    Html.nav
        [ Attr.style "background" "white"
        , Attr.style "box-shadow" "0 2px 4px rgba(0,0,0,0.1)"
        , Attr.style "position" "sticky"
        , Attr.style "top" "0"
        , Attr.style "z-index" "1000"
        ]
        [ Html.div
            [ Attr.style "max-width" "1200px"
            , Attr.style "margin" "0 auto"
            , Attr.style "padding" "0 20px"
            , Attr.style "display" "flex"
            , Attr.style "justify-content" "space-between"
            , Attr.style "align-items" "center"
            , Attr.style "height" "60px"
            ]
            [ Html.div
                [ Attr.style "font-family" "'Georgia', 'Times New Roman', serif"
                , Attr.style "font-size" "1.2em"
                , Attr.style "font-weight" "bold"
                , Attr.style "color" "#667eea"
                ]
                [ Html.text "💒 Wedding" ]
            , Html.div
                [ Attr.style "display" "flex"
                , Attr.style "gap" "30px"
                ]
                [ navLink "/" "Home" (currentRoute == HomePage)
                , navLink "/rsvp" "RSVP" (currentRoute == RsvpPage)
                , navLink "/admin" "Admin" (currentRoute == AdminPage)
                ]
            ]
        ]


navLink : String -> String -> Bool -> Html FrontendMsg
navLink href label isActive =
    Html.a
        [ Attr.href href
        , Attr.style "text-decoration" "none"
        , Attr.style "color"
            (if isActive then
                "#667eea"

             else
                "#333"
            )
        , Attr.style "font-weight"
            (if isActive then
                "bold"

             else
                "normal"
            )
        , Attr.style "padding" "8px 16px"
        , Attr.style "border-radius" "4px"
        , Attr.style "transition" "background 0.2s"
        , Attr.style "background"
            (if isActive then
                "#f0f0ff"

             else
                "transparent"
            )
        ]
        [ Html.text label ]


homePage : Model -> String -> String -> Html FrontendMsg
homePage model name1 name2 =
    Html.div []
        [ heroSection model name1 name2
        , navigationBar model.route
        , detailsSection model
        , rsvpCallToAction model
        , footerSection
        ]


rsvpPage : Model -> String -> String -> Html FrontendMsg
rsvpPage model name1 name2 =
    Html.div []
        [ heroSection model name1 name2
        , navigationBar model.route
        , rsvpFormSection model
        , footerSection
        ]


heroSection : Model -> String -> String -> Html FrontendMsg
heroSection _ name1 name2 =
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
                , Html.button
                    [ Events.onClick LookupGuest
                    , Attr.disabled (String.trim model.rsvpName == "")
                    , Attr.style "background" "#667eea"
                    , Attr.style "color" "white"
                    , Attr.style "border" "none"
                    , Attr.style "padding" "12px 30px"
                    , Attr.style "font-size" "1.1em"
                    , Attr.style "border-radius" "5px"
                    , Attr.style "cursor" "pointer"
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
                , Html.button
                    [ Events.onClick LookupGuest
                    , Attr.disabled (String.trim model.rsvpName == "")
                    , Attr.style "background" "#667eea"
                    , Attr.style "color" "white"
                    , Attr.style "border" "none"
                    , Attr.style "padding" "12px 30px"
                    , Attr.style "font-size" "1.1em"
                    , Attr.style "border-radius" "5px"
                    , Attr.style "cursor" "pointer"
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
                    , Html.button
                        [ Events.onClick SubmitRsvp
                        , Attr.style "background" "#667eea"
                        , Attr.style "color" "white"
                        , Attr.style "border" "none"
                        , Attr.style "padding" "12px 30px"
                        , Attr.style "font-size" "1.1em"
                        , Attr.style "border-radius" "5px"
                        , Attr.style "cursor" "pointer"
                        , Attr.style "width" "100%"
                        , Attr.style "margin-top" "20px"
                        ]
                        [ Html.text "Submit RSVP" ]
                    ]
        )


adminPage : Model -> Html FrontendMsg
adminPage model =
    Html.div []
        [ Html.div
            [ Attr.style "background" "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            , Attr.style "color" "white"
            , Attr.style "padding" "60px 20px"
            , Attr.style "text-align" "center"
            ]
            [ Html.h1
                [ Attr.style "font-size" "2.5em"
                , Attr.style "margin" "0"
                ]
                [ Html.text "Guest Management" ]
            , Html.p
                [ Attr.style "margin-top" "10px"
                , Attr.style "opacity" "0.9"
                , Attr.style "font-size" "1.1em"
                ]
                [ Html.text "Manage your wedding guest list" ]
            ]
        , navigationBar model.route
        , if model.adminAuthenticated then
            Html.div
                [ Attr.style "max-width" "1000px"
                , Attr.style "margin" "40px auto"
                , Attr.style "padding" "20px"
                ]
                [ adminGuestForm model
                , adminGuestTable model
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
        [ Html.div
            [ Attr.style "background" "white"
            , Attr.style "padding" "40px"
            , Attr.style "border-radius" "10px"
            , Attr.style "box-shadow" "0 4px 6px rgba(0,0,0,0.1)"
            ]
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
            , Html.button
                [ Events.onClick AttemptAdminLogin
                , Attr.disabled (String.trim model.adminPasswordInput == "")
                , Attr.style "background" "#667eea"
                , Attr.style "color" "white"
                , Attr.style "border" "none"
                , Attr.style "padding" "12px 30px"
                , Attr.style "font-size" "1em"
                , Attr.style "border-radius" "5px"
                , Attr.style "cursor" "pointer"
                , Attr.style "width" "100%"
                ]
                [ Html.text "Login" ]
            ]
        ]


adminGuestForm : Model -> Html FrontendMsg
adminGuestForm model =
    Html.div
        [ Attr.style "background" "white"
        , Attr.style "padding" "30px"
        , Attr.style "border-radius" "10px"
        , Attr.style "box-shadow" "0 4px 6px rgba(0,0,0,0.1)"
        , Attr.style "margin-bottom" "30px"
        ]
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
            [ Html.button
                [ Events.onClick SaveGuest
                , Attr.disabled (String.trim model.adminFormName == "" || String.trim model.adminFormEmail == "")
                , Attr.style "background" "#667eea"
                , Attr.style "color" "white"
                , Attr.style "border" "none"
                , Attr.style "padding" "12px 30px"
                , Attr.style "font-size" "1em"
                , Attr.style "border-radius" "5px"
                , Attr.style "cursor" "pointer"
                , Attr.style "flex" "1"
                ]
                [ Html.text "Save Guest" ]
            , if model.adminEditingGuest /= Nothing then
                Html.button
                    [ Events.onClick CancelEditGuest
                    , Attr.style "background" "#6c757d"
                    , Attr.style "color" "white"
                    , Attr.style "border" "none"
                    , Attr.style "padding" "12px 30px"
                    , Attr.style "font-size" "1em"
                    , Attr.style "border-radius" "5px"
                    , Attr.style "cursor" "pointer"
                    ]
                    [ Html.text "Cancel" ]

              else
                Html.text ""
            ]
        ]


adminGuestTable : Model -> Html FrontendMsg
adminGuestTable model =
    Html.div
        [ Attr.style "background" "white"
        , Attr.style "border-radius" "10px"
        , Attr.style "box-shadow" "0 4px 6px rgba(0,0,0,0.1)"
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
            [ Html.button
                [ Events.onClick (StartEditGuest guest)
                , Attr.style "background" "#667eea"
                , Attr.style "color" "white"
                , Attr.style "border" "none"
                , Attr.style "padding" "8px 15px"
                , Attr.style "border-radius" "4px"
                , Attr.style "cursor" "pointer"
                , Attr.style "margin-right" "10px"
                , Attr.style "font-size" "0.9em"
                ]
                [ Html.text "Edit" ]
            , Html.button
                [ Events.onClick (DeleteGuest guest.email)
                , Attr.style "background" "#dc3545"
                , Attr.style "color" "white"
                , Attr.style "border" "none"
                , Attr.style "padding" "8px 15px"
                , Attr.style "border-radius" "4px"
                , Attr.style "cursor" "pointer"
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
