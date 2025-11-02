module CanvasTypes exposing (..)

import Moveable exposing (..)


type CanvasItemType
    = Sticker String
    | TextBox String


type alias CanvasItem =
    { id : String
    , owner : String
    , itemType : CanvasItemType
    , x : Float
    , y : Float
    , rotation : Float
    , scale : Float
    }


type alias CanvasModel =
    { items : List CanvasItem
    , moveable : Moveable.Model String
    }


type CanvasMsg
    = Moveable (Moveable.Msg String)
    | OnDragEnd String Moveable.Delta
    | Deactivate
