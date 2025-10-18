module Evergreen.V1.Types exposing (..)

import Browser
import Browser.Navigation
import Dict
import Lamdera
import Url


type Route
    = HomePage
    | RsvpPage
    | AdminPage
    | CanvasPage


type alias Guest =
    { name : String
    , email : String
    , plusOne : Bool
    }


type RsvpStep
    = EnteringName
    | GuestConfirmed Guest
    | GuestNotFound


type AttendanceStatus
    = Attending
    | NotAttending


type alias FrontendModel =
    { key : Browser.Navigation.Key
    , route : Route
    , coupleNames : ( String, String )
    , weddingDate : String
    , venue : String
    , rsvpStep : RsvpStep
    , rsvpName : String
    , rsvpAttending : AttendanceStatus
    , rsvpPlusOneName : String
    , rsvpPlusOneAttending : AttendanceStatus
    , rsvpSubmitted : Bool
    , rsvpCount : Int
    , adminPasswordInput : String
    , adminLoginError : Bool
    , adminGuestList : List Guest
    , adminEditingGuest : Maybe Guest
    , adminFormName : String
    , adminFormEmail : String
    , adminFormPlusOne : Bool
    , canvas : Dict.Dict ( Int, Int ) String
    , selectedColor : String
    }


type alias RsvpResponse =
    { guestName : String
    , email : String
    , attending : AttendanceStatus
    , plusOneName : Maybe String
    , plusOneAttending : Maybe AttendanceStatus
    }


type alias BackendModel =
    { guests : Dict.Dict String Guest
    , rsvps : Dict.Dict String RsvpResponse
    , authenticatedSessions : Dict.Dict Lamdera.SessionId Bool
    , canvas : Dict.Dict ( Int, Int ) String
    }


type FrontendMsg
    = UrlClicked Browser.UrlRequest
    | UrlChanged Url.Url
    | UpdateRsvpName String
    | LookupGuest
    | UpdateRsvpAttending AttendanceStatus
    | UpdateRsvpPlusOneName String
    | UpdateRsvpPlusOneAttending AttendanceStatus
    | SubmitRsvp
    | UpdateAdminPassword String
    | AttemptAdminLogin
    | AdminAuthLoadedFromStorage Bool
    | AdminLogout
    | RequestGuestList
    | UpdateAdminFormName String
    | UpdateAdminFormEmail String
    | UpdateAdminFormPlusOne Bool
    | StartEditGuest Guest
    | CancelEditGuest
    | SaveGuest
    | DeleteGuest String
    | SelectColor String
    | PlacePixel Int Int
    | NoOpFrontendMsg


type ToBackend
    = LookupGuestByName String
    | SubmitRsvpToBackend RsvpResponse
    | AdminLogin String
    | LogoutBackend
    | CheckAdminAuth
    | GetGuestList
    | AddOrUpdateGuest Guest
    | DeleteGuestByEmail String
    | PlacePixelOnCanvas Int Int String
    | GetCanvas
    | NoOpToBackend


type BackendMsg
    = NoOpBackendMsg


type ToFrontend
    = GuestFound Guest
    | GuestNotFoundResponse
    | RsvpSubmitted Int
    | AdminLoginSuccess
    | AdminLoginFailed
    | AdminAuthStatus Bool
    | GuestListReceived (List Guest)
    | GuestSaved
    | GuestDeleted
    | CanvasUpdated (Dict.Dict ( Int, Int ) String)
    | PixelPlaced Int Int String
    | NoOpToFrontend
