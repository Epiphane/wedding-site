module Backend exposing (..)

import Dict
import Env
import Lamdera exposing (ClientId, SessionId)
import Types exposing (..)


type alias Model =
    BackendModel


app =
    Lamdera.backend
        { init = init
        , update = update
        , updateFromFrontend = updateFromFrontend
        , subscriptions = \_ -> Sub.none
        }


init : ( Model, Cmd BackendMsg )
init =
    ( { guests = initialGuestList
      , rsvps = Dict.empty
      , sessions = Dict.empty
      , canvasItems = []
      }
    , Cmd.none
    )


initialGuestList : Dict.Dict String Guest
initialGuestList =
    Dict.fromList
        [ ( "thomas steinke"
          , { name = "Thomas Steinke"
            , email = "exyphnos@gmail.com"
            , plusOne = True
            }
          )
        ]


update : BackendMsg -> Model -> ( Model, Cmd BackendMsg )
update msg model =
    case msg of
        NoOpBackendMsg ->
            ( model, Cmd.none )


getSession : Model -> SessionId -> SessionInfo
getSession model sessionId =
    Dict.get sessionId model.sessions
        |> Maybe.withDefault { name = "", isAdmin = False }


updateFromFrontend : SessionId -> ClientId -> ToBackend -> Model -> ( Model, Cmd BackendMsg )
updateFromFrontend sessionId clientId msg model =
    case msg of
        LookupGuestByName name ->
            let
                normalizedName =
                    String.toLower (String.trim name)

                maybeGuest =
                    Dict.get normalizedName model.guests
            in
            case maybeGuest of
                Just guest ->
                    ( model, Lamdera.sendToFrontend clientId (GuestFound guest) )

                Nothing ->
                    ( model, Lamdera.sendToFrontend clientId GuestNotFoundResponse )

        SubmitRsvpToBackend rsvp ->
            let
                updatedRsvps =
                    Dict.insert rsvp.email rsvp model.rsvps

                rsvpCount =
                    Dict.size updatedRsvps
            in
            ( { model | rsvps = updatedRsvps }
            , Lamdera.sendToFrontend clientId (RsvpSubmitted rsvpCount)
            )

        GetBackendModel ->
            let
                session =
                    getSession model sessionId
            in
            ( model, Lamdera.sendToFrontend clientId (InitialBackend session model.canvasItems) )

        AdminLogin password ->
            if password == Env.adminPassword then
                let
                    prevSession =
                        getSession model sessionId

                    updatedSessions =
                        Dict.insert sessionId { prevSession | isAdmin = True } model.sessions
                in
                ( { model | sessions = updatedSessions }
                , Lamdera.sendToFrontend clientId AdminLoginSuccess
                )

            else
                ( model, Lamdera.sendToFrontend clientId AdminLoginFailed )

        LogoutBackend ->
            let
                updatedSessions =
                    Dict.remove sessionId model.sessions
            in
            ( { model | sessions = updatedSessions }
            , Cmd.none
            )

        GetGuestList ->
            let
                guestList =
                    Dict.values model.guests
            in
            ( model, Lamdera.sendToFrontend clientId (GuestListReceived guestList) )

        AddOrUpdateGuest guest ->
            let
                normalizedName =
                    String.toLower (String.trim guest.name)

                updatedGuests =
                    Dict.insert normalizedName guest model.guests
            in
            ( { model | guests = updatedGuests }
            , Lamdera.sendToFrontend clientId GuestSaved
            )

        DeleteGuestByEmail email ->
            let
                updatedGuests =
                    Dict.filter (\_ guest -> guest.email /= email) model.guests
            in
            ( { model | guests = updatedGuests }
            , Lamdera.sendToFrontend clientId GuestDeleted
            )

        GetCanvas ->
            ( model, Lamdera.sendToFrontend clientId (CanvasReceived model.canvasItems) )

        PlaceCanvasItem item ->
            let
                updatedItems =
                    item :: model.canvasItems
            in
            ( { model | canvasItems = updatedItems }
            , Lamdera.broadcast (CanvasItemPlaced item)
            )

        UpdateCanvasItemPosition itemId x y ->
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
            , Lamdera.broadcast (CanvasItemMoved itemId x y)
            )

        UpdateCanvasItemRotation itemId rotation ->
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
            ( { model | canvasItems = updatedItems }
            , Lamdera.broadcast (CanvasItemRotated itemId rotation)
            )

        UpdateCanvasItemScale itemId scale ->
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
            ( { model | canvasItems = updatedItems }
            , Lamdera.broadcast (CanvasItemScaled itemId scale)
            )

        NoOpToBackend ->
            ( model, Cmd.none )
