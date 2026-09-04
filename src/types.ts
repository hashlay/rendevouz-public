/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CategoryName = 'All' | string;
export type Category = CategoryName;

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  SECTOR_TEAM = 'sector_team',
  UNIT_TEAM_LEADER = 'unit_team_leader',
  GREEN_ROOM_MANAGER = 'green_room_manager',
  JUDGE = 'judge',
  RESULT_MANAGER = 'result_manager'
}

export type WorkspaceRole = 
  | 'admin'
  | 'committee'
  | 'staff'
  | 'judge'
  | 'result_team'
  | 'verification'
  | 'media'
  | 'volunteer';

export type UserRoleType = WorkspaceRole | 'visitor' | 'participant' | 'developer' | UserRole;

export interface User {
  id: string;
  fullName: string;
  username: string;
  email?: string;
  passwordHash: string;
  role: UserRole | string;
  assignedUnitId?: string;
  active: boolean;
  mustChangePassword?: boolean;
  failedLoginAttempts?: number;
  lockedUntil?: string;
  lastLoginAt?: string;
  passwordChangedAt?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  userId: string;
  sessionTokenHash: string;
  createdAt: string;
  expiresAt: string;
  revokedAt?: string;
  ipAddress?: string;
  userAgent?: string;
  lastActivityAt: string;
}

export interface LoginAudit {
  id: string;
  username: string;
  success: boolean;
  failureReason?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

export interface AuditLog {
  id: string;
  actorUserId?: string;
  actorUsername?: string;
  actorRole?: string;
  action: string;
  entityType: string;
  entityId: string;
  assignedUnitId?: string;
  previousData?: string;
  newData?: string;
  timestamp: string;
}

export interface Unit {
  id: string;
  name: string;
  code: string;
  active: boolean;
}

export enum EducationStatus {
  STUDENT = 'student',
  UNDERGRADUATE = 'undergraduate',
  POSTGRADUATE = 'postgraduate'
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female'
}

export interface CategoryObj {
  id: string;
  name: string;
  dobStart: string;
  dobEnd: string;
  educationRequirements?: EducationStatus[];
  active: boolean;
}

export enum ParticipationType {
  INDIVIDUAL = 'individual',
  GROUP = 'group'
}

export enum StageType {
  ON_STAGE = 'on_stage',
  OFF_STAGE = 'off_stage'
}

export interface Competition {
  id: string;
  name: string;
  categoryId: string;
  language?: string;
  participationType: ParticipationType;
  teamSize: number;
  duration: number;
  stageType: StageType;
  displayOrder: number;
  active: boolean;
}

export interface Participant {
  id: string;
  fullName: string;
  dob: string;
  unitId: string;
  gender: Gender;
  educationStatus: EducationStatus;
  institution?: string;
  course?: string;
  yearSemester?: string;
  selectedCategoryId: string;
  candidateClass?: string;
  phone?: string;
  guardianPhone?: string;
  address?: string;
  notes?: string;
  profilePhoto?: string;
  active: boolean;
  deletedAt?: string;
  deletedBy?: string;
  deletionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Registration {
  id: string;
  participantId: string;
  categoryId: string;
  selectedIndividualCompetitionIds: string[];
  selectedGroupTeamIds: string[];
  registrationStatus: string;
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  id: string;
  teamNumber: string;
  teamName?: string;
  unitId: string;
  categoryId: string;
  competitionId: string;
  memberIds: string[];
  deletedAt?: string;
  deletedBy?: string;
  deletionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export enum ResultStatus {
  PARTICIPATED = 'participated',
  NOT_PARTICIPATED = 'not_participated',
  ABSENT = 'absent',
  DISQUALIFIED = 'disqualified',
  RESULT_PENDING = 'result_pending'
}

export interface Result {
  id: string;
  categoryId: string;
  competitionId: string;
  participantId?: string;
  teamId?: string;
  judge1Mark: number;
  judge2Mark: number;
  totalMark: number;
  rank?: number;
  status: ResultStatus;
  remarks?: string;
  publishedStatus: boolean;
  manualRankOverride?: boolean;
  manualRankOverrideReason?: string;
  deletedAt?: string;
  deletedBy?: string;
  deletionReason?: string;
  createdBy: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventSettings {
  eventTitle: string;
  sectorName: string;
  eventYear: string;
  cutoffDate: string;
  eventDate?: string;
  venue?: string;
  contactInfo?: string;
  maxIndividualEvents: number;
  maxGroupEvents: number;
  registrationOpen: boolean;
  ssfLogoUrl: string;
  sahityotsavLogoUrl: string;
  primaryColor: string;
  accentColor: string;
  headerBannerUrl?: string;
  numJudges: number;
  markDecimalPrecision: number;
  autoRankingEnabled: boolean;
  maxMarksPerJudge?: number;
  photoHubDriveLink?: string;
  stage1LiveLink?: string;
  stage2LiveLink?: string;
}

export interface ChestNumber {
  id: string;
  chestNumber: number;
  participantId: string;
  categoryId: string;
  unitId: string;
  generatedBy: string;
  generatedAt: string;
  deletedAt?: string;
  deletedBy?: string;
}

export interface Counter {
  id: string;
  categoryId: string;
  currentValue: number;
}

export enum GreenRoomStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  PRINTED = 'printed',
  CHECKED_IN = 'checked_in',
  STAGE_READY = 'stage_ready'
}

export interface GreenRoomAssignment {
  id: string;
  competitionId: string;
  categoryId: string;
  participantId?: string;
  teamId?: string;
  chestNumber?: number;
  codeLetter: string;
  status: GreenRoomStatus;
  generatedBy: string;
  generatedAt: string;
  deletedAt?: string;
  deletedBy?: string;
}

export enum JudgmentSheetStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  LOCKED = 'locked'
}

export interface JudgmentSheet {
  id: string;
  competitionId: string;
  categoryId: string;
  status: JudgmentSheetStatus;
  maxMarks: number;
  numJudges: number;
  createdBy: string;
  createdAt: string;
  lockedBy?: string;
  lockedAt?: string;
  publishedToResults?: boolean;
  deletedAt?: string;
}

export interface JudgeScoreEntry {
  judgeNumber: number;
  mark: number;
  remarks?: string;
}

export enum JudgeScoreStatus {
  PARTICIPATED = 'participated',
  ABSENT = 'absent',
  DISQUALIFIED = 'disqualified'
}

export interface JudgeScore {
  id: string;
  judgmentSheetId: string;
  competitionId: string;
  codeLetter: string;
  greenRoomAssignmentId: string;
  judgeScores: JudgeScoreEntry[];
  totalMark: number;
  averageMark: number;
  rank?: number;
  status: JudgeScoreStatus;
  remarks?: string;
  enteredBy: string;
  enteredAt: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface TenantInfo {
  tenantId: string;
  festivalId: string;
  festivalName: string;
  subdomain: string;
  logoUrl: string;
  edition: string;
  dates: string;
  location: string;
  status: 'active' | 'archived' | 'setup';
  isIsolated: true;
}

export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  bgDark: string;
  cardBg: string;
  borderRadius: number;
  glassmorphism: boolean;
  autoExtractedLogoColors?: string[];
}

export interface ResultItem {
  id: string;
  rank: 1 | 2 | 3 | number;
  participantName: string;
  codeNumber: string;
  category: string;
  eventName: string;
  department: string;
  points: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'First' | 'Second' | 'Third' | string;
  participationType?: 'Individual' | 'Group' | string;
  totalMark?: number;
  avatarUrl?: string;
}

export interface HouseScore {
  id: string;
  name: string;
  code: string;
  color: string;
  accentColor: string;
  totalPoints: number;
  goldCount: number;
  silverCount: number;
  bronzeCount: number;
}

export interface Stage {
  id: string;
  name: string;
  location: string;
  streamUrl: string;
  videoEmbedId: string;
  isLive: boolean;
  currentProgram: string;
  nextProgram: string;
  schedule: {
    time: string;
    program: string;
    category: string;
    status: 'completed' | 'live' | 'upcoming';
  }[];
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'Inauguration' | 'Performances' | 'Literary' | 'Exhibition' | 'Crowd & Life' | 'Competitions' | 'Awarding' | 'Campus';
  imageUrl: string;
  caption: string;
  photographer?: string;
  date: string;
  isApproved?: boolean;
  isFeatured?: boolean;
  createdAt?: number;
}

export interface VideoHighlight {
  id: string;
  title: string;
  event: string;
  performer: string;
  duration: string;
  views: string;
  thumbnailUrl: string;
  videoUrl: string;
  stageName: string;
  createdAt?: number;
}

export interface SmilePhoto {
  id: string;
  title: string;
  regCode: string;
  participantName: string;
  stage: string;
  imageUrl: string;
  timestamp: string;
  resolution: string;
  fileSize: string;
  matchedTags?: string[];
  isApproved?: boolean;
}

export interface HeroMedia {
  id: string;
  type: 'image' | 'video';
  url: string;
  title: string;
  caption?: string;
}

export interface ParticipantScheduleItem {
  id: string;
  program: string;
  stage: string;
  category: string;
  time: string;
  status: 'upcoming' | 'live' | 'completed';
}

export interface ParticipantProfile {
  id?: string;
  codeNumber: string;
  password: string;
  name: string;
  department: string;
  category: string;
  dob?: string;
  candidateClass?: string;
  avatarUrl: string;
  qrCodeData: string;
  phone?: string;
  email?: string;
  institution?: string;
  teamId?: string;
  registeredPrograms?: any[];
  isCheckedIn?: boolean;
  checkInTime?: string;
  schedule: ParticipantScheduleItem[];
  results: ResultItem[];
  matchedPhotos: SmilePhoto[];
}

export interface AuthUser {
  id?: string;
  username: string;
  name: string;
  role: UserRoleType;
  email?: string;
  avatarUrl?: string;
  department?: string;
  lastLogin?: string;
  assignedStages?: string[];
  assignedPrograms?: string[];
  participant?: ParticipantProfile;
}

export interface FaceMatchResult {
  matchedPhotos: (SmilePhoto | GalleryItem)[];
  similarityScore: number;
  matchCount: number;
  faceFeaturesDetected: number;
}

export interface Program {
  id: string;
  name: string;
  category: string;
  stage: string;
  time: string;
  status: 'upcoming' | 'live' | 'completed';
  venue?: string;
  maxParticipants?: number;
  totalRegistered?: number;
  isDrawLotsDone?: boolean;
  runningOrder?: { chestNo: string; name: string; house: string; order: number }[];
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: WorkspaceRole;
  department: string;
  status: 'active' | 'offline' | 'busy';
  assignedStage?: string;
  lastActive: string;
}

export interface JudgeProfile {
  id: string;
  username: string;
  password?: string;
  name: string;
  phone?: string;
  email?: string;
  assignedProgramIds: string[];
  assignedStage?: string;
  status?: 'active' | 'idle' | 'scoring';
  avatarUrl?: string;
}

export interface MarkEntry {
  id: string;
  programId: string;
  programName?: string;
  participantId: string;
  participantName?: string;
  house?: string;
  judgeId: string;
  judgeName?: string;
  marks?: number;
  criteriaScores?: { [key: string]: number };
  totalMarks?: number;
  status: 'pending' | 'verified' | 'flagged' | 'published' | 'announced';
  timestamp?: string;
  verifierNotes?: string;
}

export interface ActivityLogItem {
  id: string;
  timestamp: string;
  user: string;
  role: WorkspaceRole;
  action: string;
  category: 'scoring' | 'attendance' | 'program' | 'system' | 'media' | 'result';
  details: string;
  status: 'success' | 'warning' | 'info';
}

export interface BroadcastMessage {
  id: string;
  title: string;
  body: string;
  channels: ('sms' | 'whatsapp' | 'email' | 'push')[];
  recipientsGroup: 'all' | 'judges' | 'staff' | 'participants' | 'house_captains';
  timestamp: string;
  sentBy: string;
  isEmergency?: boolean;
}

export interface DragBlock {
  id: string;
  title: string;
  type: 'hero' | 'about' | 'announcements' | 'live_stages' | 'results' | 'sponsors' | 'schedule' | 'gallery' | 'photo_hub' | 'highlights' | 'custom';
  enabled: boolean;
  order: number;
  contentSnippet?: string;
}

export interface CMSSettings {
  aboutTitle: string;
  aboutSubtitle: string;
  aboutDescription: string;
  aboutBadge?: string;
  aboutMainHeading?: string;
  aboutImage?: string;
  aboutImageBadge?: string;
  aboutImageTitle?: string;
  aboutImageSubtitle?: string;
  aboutImageLocation?: string;
  aboutImageFooter?: string;
  themeTitle: string;
  themeDescription: string;
  themeButtonText?: string;
  conceptModalBadge?: string;
  conceptModalTitle?: string;
  conceptModalSubtitle?: string;
  conceptModalDescription?: string;
  conceptModalFooter?: string;
  footerText?: string;
  footerLogo?: string;
  footerLogoTitle?: string;
  footerLogoSubtitle?: string;
  footerLogoBadge?: string;
  footerDescription?: string;
  footerLocation?: string;
  footerEmail?: string;
  footerPhone?: string;
  footerInstagram?: string;
  footerYoutube?: string;
  footerFacebook?: string;
  headerLogo?: string;
  headerLogoTitle?: string;
  headerLogoSubtitle?: string;
  heroLogo?: string;
  heroLogoTitle?: string;
  heroLogoSubtitle?: string;
  heroLogoBadge?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroInstitutionLeft?: string;
  heroInstitutionRight?: string;
  heroDate?: string;
  heroLocation?: string;
  heroDesktopLoopEnabled?: boolean;
  heroDesktopLoopInterval?: number;
  heroDesktopImages?: string[];
  heroMobileLoopEnabled?: boolean;
  heroMobileLoopInterval?: number;
  heroMobileImages?: string[];
}

export interface AuditLogRecord {
  id: string;
  timestamp: string;
  actor: string;
  ipAddress: string;
  action: string;
  resource: string;
  status: 'success' | 'failure';
}
