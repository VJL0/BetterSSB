// Top-level response
export interface SearchResultsResponse {
  success: boolean
  totalCount: number
  data: Section[]
  pageOffset: number
  pageMaxSize: number
  sectionsFetchedCount: number
  pathMode: string // e.g. "plan"
  searchResultsConfigs: ColumnConfig[]
  ztcEncodedImage?: string // data URL (base64 PNG); sometimes omitted
}

// One course/section row
export interface Section {
  id: number
  term: string
  termDesc: string
  courseReferenceNumber: string
  partOfTerm: string
  courseNumber: string
  courseDisplay: string
  subject: string
  subjectDescription: string
  sequenceNumber: string
  campusDescription: string
  scheduleTypeDescription: string
  courseTitle: string
  creditHours: number | null
  maximumEnrollment: number
  enrollment: number
  seatsAvailable: number
  waitCapacity: number
  waitCount: number
  waitAvailable: number
  crossList: string | null
  crossListCapacity: number | null
  crossListCount: number | null
  crossListAvailable: number | null
  creditHourHigh: number | null
  creditHourLow: number | null
  creditHourIndicator: string | null
  openSection: boolean
  linkIdentifier: string | null
  isSectionLinked: boolean
  subjectCourse: string

  faculty: FacultyMember[]
  meetingsFaculty: SectionSession[]

  status: SectionStatus
  reservedSeatSummary: unknown | null
  sectionAttributes: unknown[]
  instructionalMethod: string // e.g. "CLAS"
  instructionalMethodDescription: string
  bookstores: BookstoreLink[]
  feeAmount: number | null
}

// Instructor entry attached to a section
export interface FacultyMember {
  bannerId: string
  category: string | null
  class: string // e.g. "net.hedtech.banner.student.faculty.FacultyResultDecorator"
  courseReferenceNumber: string
  displayName: string
  emailAddress: string
  primaryIndicator: boolean
  term: string
}

// A scheduled meeting block (lecture/lab/etc.)
export interface SectionSession {
  category: string // e.g. "01", "02"
  class: string // e.g. "net.hedtech.banner.student.schedule.SectionSessionDecorator"
  courseReferenceNumber: string
  faculty: FacultyMember[] // often empty array here
  meetingTime: MeetingTime
  term: string
}

// When/where the meeting occurs
export interface MeetingTime {
  beginTime: string // "HHmm"
  building: string
  buildingDescription: string
  campus: string // e.g. "MN", "JPN", "ONL"
  campusDescription: string
  category: string
  class: string // e.g. "net.hedtech.banner.general.overall.MeetingTimeDecorator"
  courseReferenceNumber: string
  creditHourSession: number
  endDate: string // "MM/DD/YYYY"
  endTime: string // "HHmm"
  friday: boolean
  hoursWeek: number
  meetingScheduleType: string // e.g. "BAS", "LL"
  meetingType: string // e.g. "CLAS", "LAB", "VIRT"
  meetingTypeDescription: string
  monday: boolean
  room: string
  saturday: boolean
  startDate: string // "MM/DD/YYYY"
  sunday: boolean
  term: string
  thursday: boolean
  tuesday: boolean
  wednesday: boolean
}

// Status flags for a section
export interface SectionStatus {
  select: boolean
  sectionOpen: boolean
  timeConflict: boolean
  restricted: boolean
  sectionStatus: boolean
}

// Bookstore link shown in “Materials Cost”
export interface BookstoreLink {
  url: string
  label: string
}

// Column configuration used by the grid
export interface ColumnConfig {
  config: ColumnKey | string // keep open-ended in case of other keys
  display: string
  title: string
  required: boolean
  width: string // e.g. "4%"
}

// Known column keys (expand as you encounter more)
export type ColumnKey =
  | "courseReferenceNumber"
  | "subjectCourseSectionNumber"
  | "subject"
  | "courseNumber"
  | "sequenceNumber"
  | "campus"
  | "creditHours"
  | "courseTitle"
  | "meetingTime"
  | "status"
  | "instructor"
  | "bookstores"
  | "attribute"
  | "partOfTerm"
  | "feeAmount"
  | "reservedSeats"
