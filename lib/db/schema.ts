import { jsonb, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

export * from "@/lib/db/auth-schema";

export const teacherProfiles = pgTable(
  "teacher_profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    authUserId: text("auth_user_id").notNull(),
    name: text("name").notNull(),
    role: text("role").notNull(),
    school: text("school").notNull(),
    nip: text("nip"),
    email: text("email").notNull(),
    phone: text("phone"),
    address: text("address"),
    profileImage: text("profile_image"),
    logoImage: text("logo_image"),
    announcementTitle: text("announcement_title"),
    announcementBody: text("announcement_body"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [uniqueIndex("teacher_profiles_auth_user_id_idx").on(table.authUserId)],
);

export const students = pgTable(
  "students",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    nis: text("nis").notNull(),
    name: text("name").notNull(),
    className: text("class_name").notNull(),
    gender: text("gender"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [uniqueIndex("students_nis_idx").on(table.nis)],
);

export const classesCatalog = pgTable(
  "classes_catalog",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    authUserId: text("auth_user_id").notNull(),
    className: text("class_name").notNull(),
    schoolYear: text("school_year").notNull(),
    semester: text("semester").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("classes_catalog_unique_idx").on(
      table.authUserId,
      table.className,
      table.schoolYear,
      table.semester,
    ),
  ],
);

export const journals = pgTable("journals", {
  id: uuid("id").defaultRandom().primaryKey(),
  authUserId: text("auth_user_id").notNull(),
  entryDate: text("entry_date").notNull(),
  hours: text("hours").notNull(),
  className: text("class_name").notNull(),
  subject: text("subject").notNull(),
  topic: text("topic").notNull(),
  goal: text("goal").notNull(),
  activity: text("activity").notNull(),
  note: text("note"),
  status: text("status").notNull().default("published"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const attendanceRegisters = pgTable(
  "attendance_registers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    authUserId: text("auth_user_id").notNull(),
    attendanceDate: text("attendance_date").notNull(),
    className: text("class_name").notNull(),
    subject: text("subject").notNull(),
    meeting: text("meeting").notNull(),
    entries: jsonb("entries")
      .$type<Array<{ nis: string; name: string; status: string; note?: string }>>()
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("attendance_registers_unique_idx").on(
      table.authUserId,
      table.attendanceDate,
      table.className,
      table.subject,
      table.meeting,
    ),
  ],
);

export const scoreRegisters = pgTable(
  "score_registers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    authUserId: text("auth_user_id").notNull(),
    scoreDate: text("score_date").notNull(),
    className: text("class_name").notNull(),
    subject: text("subject").notNull(),
    scoreType: text("score_type").notNull(),
    meeting: text("meeting").notNull(),
    entries: jsonb("entries")
      .$type<Array<{ nis: string; name: string; score: number; status: string }>>()
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("score_registers_unique_idx").on(
      table.authUserId,
      table.scoreDate,
      table.className,
      table.subject,
      table.scoreType,
      table.meeting,
    ),
  ],
);

export const materialsLibrary = pgTable("materials_library", {
  id: uuid("id").defaultRandom().primaryKey(),
  authUserId: text("auth_user_id").notNull(),
  title: text("title").notNull(),
  className: text("class_name").notNull(),
  subject: text("subject").notNull(),
  topic: text("topic").notNull(),
  meeting: text("meeting").notNull(),
  description: text("description"),
  documentPath: text("document_path"),
  externalLink: text("external_link"),
  thumbnailPath: text("thumbnail_path"),
  type: text("type").notNull().default("Link"),
  status: text("status").notNull().default("published"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const mediaLibrary = pgTable("media_library", {
  id: uuid("id").defaultRandom().primaryKey(),
  authUserId: text("auth_user_id").notNull(),
  title: text("title").notNull(),
  format: text("format").notNull(),
  linkedTo: text("linked_to"),
  filePath: text("file_path"),
  thumbnailPath: text("thumbnail_path"),
  sizeLabel: text("size_label"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const videoLibrary = pgTable("video_library", {
  id: uuid("id").defaultRandom().primaryKey(),
  authUserId: text("auth_user_id").notNull(),
  title: text("title").notNull(),
  className: text("class_name").notNull(),
  topic: text("topic").notNull(),
  source: text("source").notNull(),
  videoUrl: text("video_url").notNull(),
  thumbnailPath: text("thumbnail_path"),
  linkedTo: text("linked_to"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
