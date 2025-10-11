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
      , authenticatedSessions = Dict.empty
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

        AdminLogin password ->
            if password == Env.adminPassword then
                let
                    updatedSessions =
                        Dict.insert sessionId True model.authenticatedSessions
                in
                ( { model | authenticatedSessions = updatedSessions }
                , Lamdera.sendToFrontend clientId AdminLoginSuccess
                )

            else
                ( model, Lamdera.sendToFrontend clientId AdminLoginFailed )

        AdminLogoutBackend ->
            let
                updatedSessions =
                    Dict.remove sessionId model.authenticatedSessions
            in
            ( { model | authenticatedSessions = updatedSessions }
            , Cmd.none
            )

        CheckAdminAuth ->
            let
                isAuthenticated =
                    Dict.get sessionId model.authenticatedSessions
                        |> Maybe.withDefault False
            in
            ( model, Lamdera.sendToFrontend clientId (AdminAuthStatus isAuthenticated) )

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

        GetCanvasItems ->
            ( model, Lamdera.sendToFrontend clientId (CanvasItemsReceived model.canvasItems) )

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

        NoOpToBackend ->
            ( model, Cmd.none )
