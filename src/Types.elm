module Types exposing (..)

import Browser exposing (UrlRequest)
import Browser.Navigation exposing (Key)
import Dict exposing (Dict)
import Lamdera exposing (SessionId)
import Url exposing (Url)


type alias Guest =
    { name : String
    , email : String
    , plusOne : Bool
    }


type alias RsvpResponse =
    { guestName : String
    , email : String
    , attending : AttendanceStatus
    , plusOneName : Maybe String
    , plusOneAttending : Maybe AttendanceStatus
    }


type AttendanceStatus
    = Attending
    | NotAttending


type RsvpStep
    = EnteringName
    | GuestConfirmed Guest
    | GuestNotFound


type Route
    = HomePage
    | RsvpPage
    | TravelPage
    | SchedulePage
    | AdminPage
    | CanvasPage


type alias FrontendModel =
    { key : Key
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
    , adminAuthenticated : Bool
    , adminPasswordInput : String
    , adminLoginError : Bool
    , adminGuestList : List Guest
    , adminEditingGuest : Maybe Guest
    , adminFormName : String
    , adminFormEmail : String
    , adminFormPlusOne : Bool
    , canvas : Dict ( Int, Int ) String
    , selectedColor : String
    }


type alias BackendModel =
    { guests : Dict String Guest
    , rsvps : Dict String RsvpResponse
    , authenticatedSessions : Dict SessionId Bool
    , canvas : Dict ( Int, Int ) String
    }


type FrontendMsg
    = UrlClicked UrlRequest
    | UrlChanged Url
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
    | AdminLogoutBackend
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
    | CanvasUpdated (Dict ( Int, Int ) String)
    | PixelPlaced Int Int String
    | NoOpToFrontend
