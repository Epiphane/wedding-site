module Canvas exposing (..)

import CanvasTypes exposing (..)
import Html exposing (Html)
import Html.Attributes as Attr
import Html.Events as Events
import Json.Decode as Decode
import Lamdera
import Moveable exposing (..)
import Task
import Types exposing (..)


type alias Model =
    CanvasModel


init : Model
init =
    { items =
        [ { id = "999"
          , owner = ""
          , itemType = Sticker "❤️"
          , x = 50
          , y = 50
          , rotation = 45
          , scale = 1
          }
        ]
    , moveable = Moveable.init
    }


subscriptions : Model -> Sub CanvasMsg
subscriptions { moveable } =
    Moveable.subscriptions Moveable moveable


update : CanvasMsg -> Model -> ( Model, Cmd FrontendMsg )
update msg model =
    case msg of
        Moveable mMsg ->
            updateMoveable mMsg model

        --OnDragEnd id delta ->
        --    ( model, Cmd.none )
        Deactivate ->
            ( model, Cmd.none )



--          ( { model | activeItemId = Nothing }, Cmd.none )


send : msg -> Cmd msg
send msg =
    Task.perform (\_ -> msg) (Task.succeed ())


moveableConfig : Moveable.Config String FrontendMsg
moveableConfig =
    Moveable.config2 (onDragEnd (\id delta -> send (OnDragEnd id delta)))



--[ Moveable.onDragBy (\( dx, dy ) -> Vector2.vec2 dx dy |> OnDragBy)
--, onDragStart StartDragging
--, onClick ToggleBoxClicked
--]


updateMoveable : Moveable.Msg String -> Model -> ( Model, Cmd FrontendMsg )
updateMoveable msg model =
    let
        ( newMoveable, newCmd ) =
            Moveable.update moveableConfig msg model.moveable
    in
    ( { model | moveable = newMoveable }, newCmd )


render : Model -> Html FrontendMsg
render model =
    Html.div
        [ Attr.style "background" "#aaa"
        , Attr.style "width" "100%"
        , Attr.style "height" "100vh"
        , Attr.style "padding" "30px"
        ]
        [ Html.div
            [ Attr.style "background" "#fff"
            , Attr.style "width" "800px"
            , Attr.style "height" "800px"
            , Attr.style "margin" "auto"
            , Attr.style "position" "relative"

            --, Events.on "click" (Decode.succeed (Canvas CanvasTypes.Deactivate))
            ]
            (model.items |> List.map (\a -> renderItem a model.moveable))
        ]


renderItem : CanvasItem -> Moveable.Model String -> Html FrontendMsg
renderItem item moveable =
    let
        content =
            case item.itemType of
                Sticker emoji ->
                    Html.text emoji

                TextBox text ->
                    Html.text text
    in
    Moveable.node
        moveable
        item.id
        item
        (Moveable >> Canvas)
        (Html.div
            [ Attr.attribute "data-moveable-id" item.id
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
        )



{--(
    Html.div
        [ Attr.attribute "data-moveable-id" item.id

        --, Events.stopPropagationOn "click" (Decode.succeed ( NoOpFrontendMsg, True ))
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
        [ content ])--}
