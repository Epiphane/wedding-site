module Moveable exposing (..)

import Browser.Events exposing (..)
import Char exposing (isAlpha)
import Html exposing (..)
import Html.Attributes as Attr
import Html.Events as Events
import Json.Decode as Decode exposing (Decoder)


type alias MoveableProps a =
    { a
        | x : Float
        , y : Float
        , rotation : Float
        , scale : Float
    }


type alias Position =
    { x : Float
    , y : Float
    }


type alias Delta =
    ( Float, Float )


type alias Transform =
    { x : Float
    , y : Float
    , rotation : Float
    , scale : Float
    }


type alias Event id msg =
    Config id msg -> Config id msg


onDragEnd : (id -> Delta -> msg) -> Event id msg
onDragEnd toMsg baseConfig =
    { baseConfig | onDragEnd = \a b -> toMsg a b |> Just }


type alias Config id msg =
    { onDragStart : id -> Maybe msg
    , onDragBy : Delta -> Maybe msg
    , onDragEnd : id -> Delta -> Maybe msg
    , onClick : id -> Maybe msg
    , onMouseDown : id -> Maybe msg
    }


type Msg id
    = Activate id
    | MouseDown id Position
    | DragStart Position
    | DragItem Position
    | MouseUp


type State id
    = Inactive
    | Active id
    | Selecting id Position
    | Dragging id Position Position


type alias Model id =
    { state : State id
    , activeItem : Maybe id
    }


init : Model id
init =
    { state = Inactive
    , activeItem = Nothing
    }


{-| Handle mouse subscriptions used for dragging
-}
subscriptions : (Msg id -> msg) -> Model id -> Sub msg
subscriptions envelope model =
    case model.activeItem of
        Just _ ->
            [ Browser.Events.onMouseMove <| Decode.map DragItem positionDecoder
            , Browser.Events.onMouseUp <| Decode.succeed MouseUp
            ]
                |> Sub.batch
                |> Sub.map envelope

        Nothing ->
            Sub.none


defaultConfig : Config id msg
defaultConfig =
    { onDragStart = \_ -> Nothing
    , onDragBy = \_ -> Nothing
    , onDragEnd = \_ -> \_ -> Nothing
    , onClick = \_ -> Nothing
    , onMouseDown = \_ -> Nothing
    }


config : List (Event id msg) -> Config id msg
config events =
    let
        default =
            { onDragStart = \_ -> Nothing
            , onDragBy = \_ -> Nothing
            , onDragEnd = \_ -> \_ -> Nothing
            , onClick = \_ -> Nothing
            , onMouseDown = \_ -> Nothing
            }
    in
    List.foldl (<|) default events


distanceTo : Position -> Position -> Delta
distanceTo end start =
    ( end.x - start.x
    , end.y - start.y
    )


update : Config id msg -> Msg id -> Model id -> ( Model id, Maybe msg )
update configs msg ({ state } as model) =
    case ( state, msg ) of
        ( Inactive, MouseDown id pos ) ->
            ( { model
                | state = Selecting id pos
                , activeItem = Just id
              }
            , Nothing
            )

        ( Selecting id pos, DragItem newPos ) ->
            ( { model
                | state = Dragging id pos newPos
              }
            , Nothing
            )

        ( Selecting id pos, MouseUp ) ->
            ( { model
                | state = Inactive
                , activeItem = Nothing
              }
            , Nothing
            )

        ( Dragging id pos _, DragItem newPos ) ->
            ( { model
                | state = Dragging id pos newPos
              }
            , Nothing
            )

        ( Dragging id oldPos newPos, MouseUp ) ->
            ( { model
                | state = Inactive
                , activeItem = Nothing
              }
            , configs.onDragEnd id (distanceTo newPos oldPos)
            )

        _ ->
            ( model, Nothing )


positionDecoder : Decoder Position
positionDecoder =
    Decode.map2 Position
        (Decode.field "pageX" Decode.float)
        (Decode.field "pageY" Decode.float)


type Side
    = Top
    | Bottom
    | Left
    | Right


toString : Side -> String
toString side =
    case side of
        Left ->
            "left"

        Right ->
            "right"

        Bottom ->
            "bottom"

        Top ->
            "top"


line : Side -> Html msg
line side =
    let
        isHorizontal =
            if side == Top || side == Bottom then
                True

            else
                False

        ( end1, end2, sizer ) =
            if isHorizontal then
                ( "left", "right", "height" )

            else
                ( "top", "bottom", "width" )
    in
    Html.div
        [ Attr.style "position" "absolute"
        , Attr.style "background" "#4af"
        , Attr.style end1 "0"
        , Attr.style end2 "0"
        , Attr.style (toString side) "0"
        , Attr.style sizer "1px"
        ]
        []


onNodeMouseDown : id -> (Msg id -> msg) -> Attribute msg
onNodeMouseDown id envelope =
    Events.on "mousedown"
        (Decode.map
            (MouseDown id >> envelope)
            positionDecoder
        )


pickTransform : Model id -> MoveableProps a -> MoveableProps a
pickTransform model transform =
    case model.state of
        Dragging id oldPos newPos ->
            { transform | x = transform.x + newPos.x - oldPos.x, y = transform.y + newPos.y - oldPos.y }

        _ ->
            transform


node : Model id -> id -> MoveableProps a -> (Msg id -> msg) -> Html msg -> Html msg
node model id baseTransform envelope content =
    let
        isActive =
            case model.activeItem of
                Just activeId ->
                    id == activeId

                Nothing ->
                    False

        controls =
            if isActive then
                [ line Top, line Bottom, line Left, line Right ]

            else
                []

        transform =
            if isActive then
                pickTransform model baseTransform

            else
                baseTransform
    in
    Html.div
        [ Attr.style "position" "absolute"
        , Attr.style "left" (String.fromFloat transform.x ++ "px")
        , Attr.style "top" (String.fromFloat transform.y ++ "px")
        , Attr.style "transform" ("rotate(" ++ String.fromFloat transform.rotation ++ "deg) scale(" ++ String.fromFloat transform.scale ++ ")")
        , Attr.style "transform-origin" "center center"
        , onNodeMouseDown id envelope
        , Events.stopPropagationOn "click" (Decode.succeed ( Activate id |> envelope, True ))
        ]
        (controls ++ [ content ])
