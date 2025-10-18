port module Frontend exposing (..)

import Browser exposing (UrlRequest(..))
import Browser.Navigation as Nav
import Html exposing (Html)
import Html.Attributes as Attr
import Html.Events as Events
import Json.Decode as Decode
import Json.Encode as Encode
import Lamdera
import Types exposing (..)
import Url



-- PORTS


port initMoveable : Encode.Value -> Cmd msg


port moveableUpdate : (Encode.Value -> msg) -> Sub msg


type alias Model =
    FrontendModel


app =
    Lamdera.frontend
        { init = init
        , onUrlRequest = UrlClicked
        , onUrlChange = UrlChanged
        , update = update
        , updateFromBackend = updateFromBackend
        , subscriptions = subscriptions
        , view = view
        }


subscriptions : Model -> Sub FrontendMsg
subscriptions _ =
    moveableUpdate
        (\value ->
            case Decode.decodeValue moveableDecoder value of
                Ok transform ->
                    UpdateItemTransform transform.id transform.x transform.y transform.rotation transform.scale

                Err _ ->
                    NoOpFrontendMsg
        )


type alias MoveableTransform =
    { id : String
    , x : Float
    , y : Float
    , rotation : Float
    , scale : Float
    }


moveableDecoder : Decode.Decoder MoveableTransform
moveableDecoder =
    Decode.map5 MoveableTransform
        (Decode.field "id" Decode.string)
        (Decode.field "x" Decode.float)
        (Decode.field "y" Decode.float)
        (Decode.field "rotation" Decode.float)
        (Decode.field "scale" Decode.float)


encodeCanvasItem : CanvasItem -> Encode.Value
encodeCanvasItem item =
    Encode.object
        [ ( "id", Encode.string item.id )
        , ( "x", Encode.float item.x )
        , ( "y", Encode.float item.y )
        , ( "rotation", Encode.float item.rotation )
        , ( "scale", Encode.float item.scale )
        ]


init : Url.Url -> Nav.Key -> ( Model, Cmd FrontendMsg )
init url key =
    ( { key = key
      , route = urlToRoute url
      , coupleNames = ( "Thomas Steinke", "Liz Petersen" )
      , weddingDate = "August 22, 2026"
      , venue = "Ampitheatre of the Redwoods"
      , sessionName = ""
      , isAuthenticated = False
      , rsvpStep = EnteringName
      , rsvpName = ""
      , rsvpAttending = Attending
      , rsvpPlusOneName = ""
      , rsvpPlusOneAttending = Attending
      , rsvpSubmitted = False
      , rsvpCount = 0
      , adminPasswordInput = ""
      , adminLoginError = False
      , adminGuestList = []
      , adminEditingGuest = Nothing
      , adminFormName = ""
      , adminFormEmail = ""
      , adminFormPlusOne = False
      , canvasItems = []
      , selectedSticker = "❤️"
      , textInput = ""
      , stickerRotation = 0
      , stickerScale = 1.0
      , draggingItemId = Nothing
      }
    , Lamdera.sendToBackend GetBackendModel
    )


urlToRoute : Url.Url -> Route
urlToRoute url =
    case url.path of
        "/rsvp" ->
            RsvpPage

        "/travel" ->
            TravelPage

        "/schedule" ->
            SchedulePage

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
            ( { model | isAuthenticated = False }
            , Lamdera.sendToBackend LogoutBackend
            )

        SelectSticker sticker ->
            ( { model | selectedSticker = sticker }, Cmd.none )

        UpdateTextInput text ->
            ( { model | textInput = String.left 140 text }, Cmd.none )

        UpdateRotation rotation ->
            ( { model | stickerRotation = rotation }, Cmd.none )

        UpdateScale scale ->
            ( { model | stickerScale = clamp 0.5 2.0 scale }, Cmd.none )

        PlaceItemOnCanvas x y ->
            let
                item =
                    if model.textInput /= "" then
                        { id = String.fromInt (List.length model.canvasItems)
                        , itemType = TextBox model.textInput
                        , x = x
                        , y = y
                        , rotation = model.stickerRotation
                        , scale = model.stickerScale
                        }

                    else
                        { id = String.fromInt (List.length model.canvasItems)
                        , itemType = Sticker model.selectedSticker
                        , x = x
                        , y = y
                        , rotation = model.stickerRotation
                        , scale = model.stickerScale
                        }
            in
            ( { model | textInput = "", stickerRotation = 0, stickerScale = 1.0 }
            , Lamdera.sendToBackend (PlaceCanvasItem item)
            )

        StartDragging itemId ->
            ( { model | draggingItemId = Just itemId }, Cmd.none )

        StopDragging ->
            ( { model | draggingItemId = Nothing }, Cmd.none )

        DragItem x y ->
            case model.draggingItemId of
                Just itemId ->
                    let
                        updatedItems =
                            List.map
                                (\item ->
                                    if item.id == itemId then
                                        { item | x = x, y = y }

                                    else
                                        item
                                )
                                model.canvasItems
                    in
                    ( { model | canvasItems = updatedItems }
                    , Lamdera.sendToBackend (UpdateCanvasItemPosition itemId x y)
                    )

                Nothing ->
                    ( model, Cmd.none )

        UpdateItemTransform itemId x y rotation scale ->
            let
                updatedItems =
                    List.map
                        (\item ->
                            if item.id == itemId then
                                { item | x = x, y = y, rotation = rotation, scale = scale }

                            else
                                item
                        )
                        model.canvasItems
            in
            ( { model | canvasItems = updatedItems }
            , Cmd.batch
                [ Lamdera.sendToBackend (UpdateCanvasItemPosition itemId x y)
                , Lamdera.sendToBackend (UpdateCanvasItemRotation itemId rotation)
                , Lamdera.sendToBackend (UpdateCanvasItemScale itemId scale)
                ]
            )

        NoOpFrontendMsg ->
            ( model, Cmd.none )


updateFromBackend : ToFrontend -> Model -> ( Model, Cmd FrontendMsg )
updateFromBackend msg model =
    case msg of
        GuestFound guest ->
            ( { model | rsvpStep = GuestConfirmed guest }, Cmd.none )

        GuestNotFoundResponse ->
            ( { model | rsvpStep = GuestNotFound }, Cmd.none )

        InitialBackend sessionInfo canvasItems ->
            ( { model | sessionName = sessionInfo.name, isAuthenticated = sessionInfo.isAdmin, canvasItems = canvasItems }, Cmd.none )

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
                ( { model | isAuthenticated = True }
                , Lamdera.sendToBackend GetGuestList
                )

            else
                ( model, Cmd.none )

        AdminLoginSuccess ->
            ( { model
                | isAuthenticated = True
                , adminPasswordInput = ""
                , adminLoginError = False
              }
            , Lamdera.sendToBackend GetGuestList
            )

        AdminLoginFailed ->
            ( { model
                | isAuthenticated = False
                , adminLoginError = True
              }
            , Cmd.none
            )

        CanvasReceived canvasItems ->
            ( { model | canvasItems = canvasItems }
            , initMoveable (Encode.list encodeCanvasItem canvasItems)
            )

        CanvasItemPlaced item ->
            ( { model | canvasItems = item :: model.canvasItems }
            , initMoveable (Encode.list encodeCanvasItem [ item ])
            )

        CanvasItemMoved itemId x y ->
            let
                updatedItems =
                    List.map
                        (\item ->
                            if item.id == itemId then
                                { item | x = x, y = y }

                            else
                                item
                        )
                        model.canvasItems
            in
            ( { model | canvasItems = updatedItems }, Cmd.none )

        CanvasItemRotated itemId rotation ->
            let
                updatedItems =
                    List.map
                        (\item ->
                            if item.id == itemId then
                                { item | rotation = rotation }

                            else
                                item
                        )
                        model.canvasItems
            in
            ( { model | canvasItems = updatedItems }, Cmd.none )

        CanvasItemScaled itemId scale ->
            let
                updatedItems =
                    List.map
                        (\item ->
                            if item.id == itemId then
                                { item | scale = scale }

                            else
                                item
                        )
                        model.canvasItems
            in
            ( { model | canvasItems = updatedItems }, Cmd.none )

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

                TravelPage ->
                    travelPage model name1 name2

                SchedulePage ->
                    schedulePage model name1 name2

                AdminPage ->
                    adminPage model

                CanvasPage ->
                    canvasPage model
            ]
        ]
    }


navigationBar : Route -> Bool -> Html FrontendMsg
navigationBar currentRoute isisAuthenticated =
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
             , navLink "/travel" "Travel" (currentRoute == TravelPage)
             , navLink "/schedule" "Schedule" (currentRoute == SchedulePage)
             , navLink "/rsvp" "RSVP" (currentRoute == RsvpPage)
             ]
                ++ (if isisAuthenticated then
                        [ navLink "/admin" "Admin" (currentRoute == AdminPage) ]

                    else
                        []
                   )
                ++ [ navLink "/canvas" "Canvas" (currentRoute == CanvasPage) ]
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
        , navigationBar model.route model.isAuthenticated
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
        , navigationBar model.route model.isAuthenticated
        , rsvpFormSection model
        , footerSection
        ]


travelPage : Model -> String -> String -> Html FrontendMsg
travelPage model name1 name2 =
    Html.div []
        [ dateLocationHeader model
        , coupleNamesHeader name1 name2
        , navigationBar model.route model.isAuthenticated
        , travelInfoSection
        , footerSection
        ]


schedulePage : Model -> String -> String -> Html FrontendMsg
schedulePage model name1 name2 =
    Html.div []
        [ dateLocationHeader model
        , coupleNamesHeader name1 name2
        , navigationBar model.route model.isAuthenticated
        , scheduleInfoSection model
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
        , navigationBar model.route model.isAuthenticated
        , if model.isAuthenticated then
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


travelInfoSection : Html FrontendMsg
travelInfoSection =
    Html.div
        [ Attr.style "background" "white"
        , Attr.style "padding" "80px 20px"
        ]
        [ Html.div
            [ Attr.style "max-width" "800px"
            , Attr.style "margin" "0 auto"
            ]
            [ Html.h2
                [ Attr.style "font-size" "2em"
                , Attr.style "margin-bottom" "40px"
                , Attr.style "color" "#333"
                , Attr.style "font-weight" "400"
                , Attr.style "font-family" "'Georgia', 'Times New Roman', serif"
                , Attr.style "text-align" "center"
                ]
                [ Html.text "Travel Information" ]
            , card
                [ Attr.style "margin-bottom" "30px" ]
                [ Html.h3
                    [ Attr.style "margin-top" "0"
                    , Attr.style "color" "#333"
                    , Attr.style "font-family" "'Georgia', 'Times New Roman', serif"
                    , Attr.style "font-size" "1.5em"
                    ]
                    [ Html.text "Accommodations" ]
                , Html.p
                    [ Attr.style "color" "#666"
                    , Attr.style "line-height" "1.6"
                    , Attr.style "margin-bottom" "15px"
                    ]
                    [ Html.text "We recommend staying in Santa Cruz, which offers a variety of hotels and vacation rentals within easy reach of the venue." ]
                , Html.div
                    [ Attr.style "margin-top" "20px" ]
                    [ Html.h4
                        [ Attr.style "color" "#333"
                        , Attr.style "font-family" "'Georgia', 'Times New Roman', serif"
                        , Attr.style "margin-bottom" "10px"
                        ]
                        [ Html.text "Suggested Hotels:" ]
                    , Html.ul
                        [ Attr.style "color" "#666"
                        , Attr.style "line-height" "1.8"
                        ]
                        [ Html.li [] [ Html.text "Dream Inn Santa Cruz - Beachfront hotel with ocean views" ]
                        , Html.li [] [ Html.text "Hotel Paradox - Boutique hotel in downtown Santa Cruz" ]
                        , Html.li [] [ Html.text "West Cliff Inn - Victorian inn near the beach" ]
                        , Html.li [] [ Html.text "Mission Inn - Budget-friendly option near downtown" ]
                        ]
                    ]
                ]
            , card
                [ Attr.style "margin-bottom" "30px" ]
                [ Html.h3
                    [ Attr.style "margin-top" "0"
                    , Attr.style "color" "#333"
                    , Attr.style "font-family" "'Georgia', 'Times New Roman', serif"
                    , Attr.style "font-size" "1.5em"
                    ]
                    [ Html.text "Getting to the Reception" ]
                , Html.p
                    [ Attr.style "color" "#666"
                    , Attr.style "line-height" "1.6"
                    , Attr.style "margin-bottom" "15px"
                    ]
                    [ Html.text "The Ampitheatre of the Redwoods is located in the Santa Cruz Mountains. We will provide shuttle service from downtown Santa Cruz." ]
                , Html.div
                    [ Attr.style "background" "#f8f9fa"
                    , Attr.style "padding" "20px"
                    , Attr.style "border-radius" "2px"
                    , Attr.style "margin-top" "20px"
                    ]
                    [ Html.h4
                        [ Attr.style "color" "#333"
                        , Attr.style "font-family" "'Georgia', 'Times New Roman', serif"
                        , Attr.style "margin-top" "0"
                        , Attr.style "margin-bottom" "10px"
                        ]
                        [ Html.text "Shuttle Details:" ]
                    , Html.ul
                        [ Attr.style "color" "#666"
                        , Attr.style "line-height" "1.8"
                        , Attr.style "margin" "0"
                        , Attr.style "padding-left" "20px"
                        ]
                        [ Html.li [] [ Html.text "Pickup Location: Downtown Santa Cruz (specific location TBD)" ]
                        , Html.li [] [ Html.text "Departure Time: 3:00 PM" ]
                        , Html.li [] [ Html.text "Return Shuttle: Departing venue at 10:00 PM" ]
                        , Html.li [] [ Html.text "Please RSVP to reserve your spot on the shuttle" ]
                        ]
                    ]
                ]
            , card
                []
                [ Html.h3
                    [ Attr.style "margin-top" "0"
                    , Attr.style "color" "#333"
                    , Attr.style "font-family" "'Georgia', 'Times New Roman', serif"
                    , Attr.style "font-size" "1.5em"
                    ]
                    [ Html.text "Driving Directions" ]
                , Html.p
                    [ Attr.style "color" "#666"
                    , Attr.style "line-height" "1.6"
                    ]
                    [ Html.text "If you prefer to drive yourself, the venue is approximately 20 minutes from downtown Santa Cruz via Highway 9. Parking is available on-site. Please note that the mountain roads can be winding, so allow extra time for your journey." ]
                ]
            ]
        ]


scheduleInfoSection : Model -> Html FrontendMsg
scheduleInfoSection model =
    Html.div
        [ Attr.style "background" "white"
        , Attr.style "padding" "80px 20px"
        ]
        [ Html.div
            [ Attr.style "max-width" "800px"
            , Attr.style "margin" "0 auto"
            ]
            [ Html.h2
                [ Attr.style "font-size" "2em"
                , Attr.style "margin-bottom" "40px"
                , Attr.style "color" "#333"
                , Attr.style "font-weight" "400"
                , Attr.style "font-family" "'Georgia', 'Times New Roman', serif"
                , Attr.style "text-align" "center"
                ]
                [ Html.text "Wedding Schedule" ]
            , scheduleEvent "Friday, August 21, 2026" "Welcome Dinner" "7:00 PM" "Downtown Santa Cruz" "Join us for a casual welcome dinner the night before the wedding. Location details will be provided closer to the date."
            , scheduleEvent model.weddingDate "Ceremony" "4:00 PM" model.venue "Our wedding ceremony will take place in the beautiful natural setting of the Ampitheatre of the Redwoods."
            , scheduleEvent model.weddingDate "Cocktail Hour" "4:30 PM" model.venue "Enjoy drinks and appetizers while we take photos."
            , scheduleEvent model.weddingDate "Reception" "6:00 PM" model.venue "Dinner, dancing, and celebration under the redwoods!"
            , scheduleEvent model.weddingDate "Shuttle Return" "10:00 PM" model.venue "Last shuttle departs back to Santa Cruz."
            ]
        ]


scheduleEvent : String -> String -> String -> String -> String -> Html FrontendMsg
scheduleEvent date title time location description =
    card
        [ Attr.style "margin-bottom" "20px" ]
        [ Html.div
            [ Attr.style "display" "flex"
            , Attr.style "justify-content" "space-between"
            , Attr.style "align-items" "flex-start"
            , Attr.style "flex-wrap" "wrap"
            , Attr.style "gap" "20px"
            ]
            [ Html.div
                [ Attr.style "flex" "1"
                , Attr.style "min-width" "250px"
                ]
                [ Html.h3
                    [ Attr.style "margin-top" "0"
                    , Attr.style "margin-bottom" "5px"
                    , Attr.style "color" "#333"
                    , Attr.style "font-family" "'Georgia', 'Times New Roman', serif"
                    , Attr.style "font-size" "1.3em"
                    ]
                    [ Html.text title ]
                , Html.p
                    [ Attr.style "color" "#999"
                    , Attr.style "margin" "0"
                    , Attr.style "font-size" "0.9em"
                    ]
                    [ Html.text date ]
                ]
            , Html.div
                [ Attr.style "text-align" "right"
                , Attr.style "min-width" "150px"
                ]
                [ Html.div
                    [ Attr.style "color" "#333"
                    , Attr.style "font-weight" "bold"
                    , Attr.style "margin-bottom" "5px"
                    ]
                    [ Html.text time ]
                , Html.div
                    [ Attr.style "color" "#666"
                    , Attr.style "font-size" "0.9em"
                    ]
                    [ Html.text location ]
                ]
            ]
        , Html.p
            [ Attr.style "color" "#666"
            , Attr.style "line-height" "1.6"
            , Attr.style "margin" "15px 0 0 0"
            ]
            [ Html.text description ]
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
        , navigationBar model.route model.isAuthenticated
        , Html.div
            [ Attr.style "max-width" "1400px"
            , Attr.style "margin" "40px auto"
            , Attr.style "padding" "20px"
            ]
            [ Html.div
                [ Attr.style "display" "grid"
                , Attr.style "grid-template-columns" "300px 1fr"
                , Attr.style "gap" "20px"
                , Attr.style "align-items" "start"
                ]
                [ canvasControls model
                , freeformCanvas model
                ]
            ]
        , footerSection
        ]


canvasControls : Model -> Html FrontendMsg
canvasControls model =
    Html.div []
        [ card
            [ Attr.style "margin-bottom" "20px" ]
            [ Html.h3
                [ Attr.style "margin-top" "0"
                , Attr.style "color" "#333"
                , Attr.style "font-family" "'Georgia', 'Times New Roman', serif"
                ]
                [ Html.text "Add Sticker" ]
            , Html.div
                [ Attr.style "display" "grid"
                , Attr.style "grid-template-columns" "auto auto auto"
                , Attr.style "gap" "8px"
                ]
                (List.map (stickerButton model.selectedSticker)
                    [ "❤️"
                    , "💕"
                    , "💝"
                    , "💖"
                    , "💗"
                    , "💓"
                    , "💞"
                    , "💘"
                    , "🎉"
                    , "🎊"
                    , "🎈"
                    , "🎁"
                    , "🌸"
                    , "🌹"
                    , "🌺"
                    , "🌻"
                    , "⭐"
                    , "✨"
                    , "💫"
                    , "🌟"
                    , "👰"
                    , "🤵"
                    , "💍"
                    , "🥂"
                    ]
                )
            ]
        , card
            [ Attr.style "margin-bottom" "20px" ]
            [ Html.h3
                [ Attr.style "margin-top" "0"
                , Attr.style "color" "#333"
                , Attr.style "font-family" "'Georgia', 'Times New Roman', serif"
                ]
                [ Html.text "Add Text" ]
            , Html.textarea
                [ Attr.value model.textInput
                , Events.onInput UpdateTextInput
                , Attr.placeholder "Enter text (max 140 characters)"
                , Attr.style "width" "100%"
                , Attr.style "padding" "10px"
                , Attr.style "border" "1px solid #ddd"
                , Attr.style "border-radius" "2px"
                , Attr.style "font-size" "1em"
                , Attr.style "box-sizing" "border-box"
                , Attr.style "font-family" "'Georgia', 'Times New Roman', serif"
                , Attr.style "resize" "vertical"
                , Attr.style "min-height" "80px"
                ]
                []
            , Html.p
                [ Attr.style "margin" "5px 0 0 0"
                , Attr.style "font-size" "0.85em"
                , Attr.style "color" "#999"
                , Attr.style "text-align" "right"
                ]
                [ Html.text (String.fromInt (String.length model.textInput) ++ " / 140") ]
            ]
        , card
            []
            [ Html.h3
                [ Attr.style "margin-top" "0"
                , Attr.style "color" "#333"
                , Attr.style "font-family" "'Georgia', 'Times New Roman', serif"
                ]
                [ Html.text "Customize" ]
            , Html.div
                [ Attr.style "margin-bottom" "15px" ]
                [ Html.label
                    [ Attr.style "display" "block"
                    , Attr.style "margin-bottom" "5px"
                    , Attr.style "color" "#666"
                    ]
                    [ Html.text ("Rotation: " ++ String.fromInt (round model.stickerRotation) ++ "°") ]
                , Html.input
                    [ Attr.type_ "range"
                    , Attr.min "0"
                    , Attr.max "360"
                    , Attr.value (String.fromFloat model.stickerRotation)
                    , Events.onInput (\v -> UpdateRotation (Maybe.withDefault 0 (String.toFloat v)))
                    , Attr.style "width" "100%"
                    ]
                    []
                ]
            , Html.div
                []
                [ Html.label
                    [ Attr.style "display" "block"
                    , Attr.style "margin-bottom" "5px"
                    , Attr.style "color" "#666"
                    ]
                    [ Html.text ("Scale: " ++ String.fromFloat (toFloat (round (model.stickerScale * 10)) / 10) ++ "x") ]
                , Html.input
                    [ Attr.type_ "range"
                    , Attr.min "0.5"
                    , Attr.max "2.0"
                    , Attr.step "0.1"
                    , Attr.value (String.fromFloat model.stickerScale)
                    , Events.onInput (\v -> UpdateScale (Maybe.withDefault 1 (String.toFloat v)))
                    , Attr.style "width" "100%"
                    ]
                    []
                ]
            , Html.p
                [ Attr.style "margin-top" "15px"
                , Attr.style "color" "#666"
                , Attr.style "font-size" "0.9em"
                ]
                [ Html.text "Click anywhere on the canvas to place your sticker or text!" ]
            ]
        ]


stickerButton : String -> String -> Html FrontendMsg
stickerButton selectedSticker sticker =
    Html.button
        [ Events.onClick (SelectSticker sticker)
        , Attr.style "font-size" "2em"
        , Attr.style "padding" "10px"
        , Attr.style "border"
            (if selectedSticker == sticker then
                "3px solid #333"

             else
                "1px solid #ddd"
            )
        , Attr.style "border-radius" "4px"
        , Attr.style "background" "white"
        , Attr.style "cursor" "pointer"
        , Attr.style "transition" "all 0.2s"
        ]
        [ Html.text sticker ]


freeformCanvas : Model -> Html FrontendMsg
freeformCanvas model =
    card
        [ Attr.style "padding" "0"
        , Attr.style "overflow" "hidden"
        , Attr.style "position" "relative"
        , Attr.style "min-height" "600px"
        ]
        [ Html.div
            [ onCanvasClick
            , Attr.style "width" "100%"
            , Attr.style "height" "600px"
            , Attr.style "background" "#fafafa"
            , Attr.style "cursor" "crosshair"
            , Attr.style "position" "relative"
            ]
            (List.map renderCanvasItem model.canvasItems)
        ]


onCanvasClick : Html.Attribute FrontendMsg
onCanvasClick =
    Events.on "click"
        (Decode.map2 PlaceItemOnCanvas
            (Decode.field "offsetX" Decode.float)
            (Decode.field "offsetY" Decode.float)
        )


renderCanvasItem : CanvasItem -> Html FrontendMsg
renderCanvasItem item =
    let
        content =
            case item.itemType of
                Sticker emoji ->
                    Html.text emoji

                TextBox text ->
                    Html.text text
    in
    Html.div
        [ Attr.attribute "data-moveable-id" item.id
        , Events.stopPropagationOn "click" (Decode.succeed ( NoOpFrontendMsg, True ))
        , Attr.style "position" "absolute"
        , Attr.style "left" (String.fromFloat item.x ++ "px")
        , Attr.style "top" (String.fromFloat item.y ++ "px")
        , Attr.style "transform" ("rotate(" ++ String.fromFloat item.rotation ++ "deg) scale(" ++ String.fromFloat item.scale ++ ")")
        , Attr.style "transform-origin" "center center"
        , Attr.style "font-size"
            (case item.itemType of
                Sticker _ ->
                    "48px"

                TextBox _ ->
                    "18px"
            )
        , Attr.style "font-family" "'Georgia', 'Times New Roman', serif"
        , Attr.style "white-space" "pre-wrap"
        , Attr.style "max-width" "300px"
        , Attr.style "cursor" "move"
        , Attr.style "user-select" "none"
        , Attr.style "padding" "4px"
        ]
        [ content ]
