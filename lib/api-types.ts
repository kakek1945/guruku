export type HomePageApiResponse = {
  announcement: {
    title: string;
    detail: string;
    date: string;
    teacherName: string;
  };
  latestMaterials: Array<{
    title: string;
    type: string;
    className: string;
    updatedAt: string;
    thumbnail: string;
  }>;
  latestMedia: Array<{
    title: string;
    format: string;
    size: string;
    uploadedAt: string;
    thumbnail: string;
  }>;
  latestVideos: Array<{
    title: string;
    source: string;
    className: string;
    publishedAt: string;
    thumbnail: string;
    videoUrl: string;
  }>;
};

export type DashboardOverviewApiResponse = {
  metrics: Array<{ label: string; value: string; note: string }>;
  quickActions: Array<{ title: string; description: string; href: string; accent: string }>;
  scheduleToday: Array<{
    time: string;
    className: string;
    subject: string;
    topic: string;
    status: string;
  }>;
  classAssignments: Array<{
    className: string;
    subject: string;
    students: number;
    journalProgress: string;
    latestTopic: string;
  }>;
};

export type DashboardSettingsProfile = {
  name: string;
  role: string;
  school: string;
  nip: string;
  email: string;
  phone: string;
  address: string;
  profileImage: string | null;
  logoImage: string | null;
  announcementTitle: string;
  announcementBody: string;
};

export type DashboardSettingsApiResponse = {
  profile: DashboardSettingsProfile;
  studentCount: number;
};

export type DashboardSettingsMutationResponse = {
  message: string;
  profile: DashboardSettingsProfile;
};

export type DashboardStudentImportResponse = {
  message: string;
  imported: number;
  studentCount: number;
};

export type DashboardAccountMutationResponse = {
  message: string;
  username: string;
};

export type JournalHistoryItem = {
  id: string;
  date: string;
  className: string;
  subject: string;
  hours: string;
  topic: string;
  goal: string;
  activity: string;
  note: string;
  status: string;
  entryDate: string;
};

export type JournalsApiResponse = {
  history: JournalHistoryItem[];
};

export type AttendanceEntry = {
  name: string;
  nis: string;
  status: string;
  note: string;
};

export type AttendanceSummaryItem = {
  label: string;
  value: number;
  description: string;
};

export type AttendanceHistoryItem = {
  id: string;
  attendanceDate: string;
  className: string;
  subject: string;
  meeting: string;
  total: number;
};

export type AttendanceApiResponse = {
  entries: AttendanceEntry[];
  summary: AttendanceSummaryItem[];
  history: AttendanceHistoryItem[];
};

export type ScoreEntry = {
  name: string;
  nis: string;
  score: number;
  status: string;
};

export type ScoreHistoryItem = {
  id: string;
  date: string;
  type: string;
  className: string;
  topic: string;
  average: number;
};

export type ScoresApiResponse = {
  entries: ScoreEntry[];
  history: ScoreHistoryItem[];
};

export type MaterialItem = {
  id: string;
  title: string;
  type: string;
  className: string;
  subject: string;
  topic: string;
  meeting: string;
  updatedAt: string;
  thumbnail: string;
  documentPath: string | null;
  externalLink: string | null;
  description: string;
};

export type MaterialsApiResponse = {
  items: MaterialItem[];
};

export type MediaItem = {
  id: string;
  title: string;
  format: string;
  size: string;
  linkedTo: string;
  uploadedAt: string;
  thumbnail: string;
  filePath: string | null;
};

export type VideoItem = {
  id: string;
  title: string;
  source: string;
  className: string;
  topic: string;
  linkedTo: string;
  publishedAt: string;
  videoUrl: string;
  thumbnail: string;
};

export type MediaVideosApiResponse = {
  mediaItems: MediaItem[];
  videoItems: VideoItem[];
};

export type ClassesApiResponse = {
  filters: {
    schoolYear: string;
    semester: string;
  };
  classOptions: string[];
  classAssignments: Array<{
    className: string;
    subject: string;
    students: number;
    journalProgress: string;
    latestTopic: string;
  }>;
  roster: Array<{
    name: string;
    nis: string;
    className: string;
  }>;
};

export type DeleteClassResponse = {
  message: string;
  classOptions: string[];
};
