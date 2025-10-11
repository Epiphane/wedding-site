module Types exposing (..)

import Browser exposing (UrlRequest)
import Browser.Navigation exposing (Key)
import Dict exposing (Dict)
import Url exposing (Url)


type alias RsvpResponse =
    { name : String
    , email : String
    , attending : AttendanceStatus
    }


type AttendanceStatus
    = Attending
    | NotAttending


type Route
    = HomePage
    | RsvpPage


type alias FrontendModel =
    { key : Key
    , route : Route
    , coupleNames : ( String, String )
    , weddingDate : String
    , venue : String
    , rsvpName : String
    , rsvpEmail : String
    , rsvpAttending : AttendanceStatus
    , rsvpSubmitted : Bool
    , rsvpCount : Int
    }


type alias BackendModel =
    { rsvps : Dict String RsvpResponse
    }


type FrontendMsg
    = UrlClicked UrlRequest
    | UrlChanged Url
    | UpdateRsvpName String
    | UpdateRsvpEmail String
    | UpdateRsvpAttending AttendanceStatus
    | SubmitRsvp
    | NoOpFrontendMsg


type ToBackend
    = SubmitRsvpToBackend RsvpResponse
    | NoOpToBackend


type BackendMsg
    = NoOpBackendMsg


type ToFrontend
    = RsvpSubmitted Int
    | NoOpToFrontend
