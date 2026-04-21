import { NextResponse } from "next/server";

import { count } from "drizzle-orm";

import { db } from "@/lib/db";
import { students } from "@/lib/db/schema";
import { getSessionFromRequest } from "@/lib/server/dashboard";

export const runtime = "nodejs";

function parseCsvLine(line: string, delimiter: string) {
  const values: string[] = [];
  let current = "";
  let insideQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];

    if (character === '"') {
      if (insideQuotes && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        insideQuotes = !insideQuotes;
      }

      continue;
    }

    if (character === delimiter && !insideQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += character;
  }

  values.push(current.trim());
  return values;
}

function detectDelimiter(headerLine: string) {
  const semicolonCount = (headerLine.match(/;/g) || []).length;
  const commaCount = (headerLine.match(/,/g) || []).length;
  const tabCount = (headerLine.match(/\t/g) || []).length;

  if (semicolonCount > commaCount && semicolonCount >= tabCount) {
    return ";";
  }

  if (tabCount > commaCount && tabCount > semicolonCount) {
    return "\t";
  }

  return ",";
}

function parseCsvText(text: string) {
  const cleanedText = text.replace(/^\uFEFF/, "");
  const firstLine = cleanedText.split(/\r?\n/).find((line) => line.trim()) || "";
  const delimiter = detectDelimiter(firstLine);

  return cleanedText
    .split(/\r?\n/)
    .map((line) => line.replace(/^\uFEFF/, "").trim())
    .filter(Boolean)
    .map((line) => parseCsvLine(line, delimiter));
}

function normalizeHeader(header: string) {
  return header
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .replace(/[ -]+/g, "_");
}

function getColumnIndex(headers: string[], candidates: string[]) {
  return headers.findIndex((header) => candidates.includes(header));
}

export async function POST(request: Request) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ message: "Silakan masuk terlebih dahulu." }, { status: 401 });
  }

  const formData = await request.formData();
  const csvFile = formData.get("studentCsv");

  if (!(csvFile instanceof File) || csvFile.size === 0) {
    return NextResponse.json({ message: "Pilih file CSV terlebih dahulu." }, { status: 400 });
  }

  const csvText = await csvFile.text();
  const rows = parseCsvText(csvText);

  if (rows.length < 2) {
    return NextResponse.json(
      { message: "Isi CSV belum lengkap. Tambahkan header dan minimal satu baris siswa." },
      { status: 400 },
    );
  }

  const headers = rows[0].map(normalizeHeader);
  const nisIndex = getColumnIndex(headers, ["nis", "nisn", "nomor_induk", "nomor_induk_siswa"]);
  const nameIndex = getColumnIndex(headers, ["nama_siswa", "nama", "name", "nama_lengkap"]);
  const classIndex = getColumnIndex(headers, ["kelas", "class", "class_name"]);
  const genderIndex = getColumnIndex(headers, ["jenis_kelamin", "gender", "jk", "kelamin"]);

  if (nisIndex === -1 || nameIndex === -1 || classIndex === -1) {
    return NextResponse.json(
      { message: "Header CSV harus memuat kolom `nis`, `nama_siswa`, dan `kelas`." },
      { status: 400 },
    );
  }

  let imported = 0;

  for (const row of rows.slice(1)) {
    const nis = row[nisIndex]?.trim();
    const name = row[nameIndex]?.trim();
    const className = row[classIndex]?.trim();
    const gender = genderIndex === -1 ? "" : row[genderIndex]?.trim();

    if (!nis || !name || !className) {
      continue;
    }

    await db
      .insert(students)
      .values({
        nis,
        name,
        className,
        gender: gender || null,
      })
      .onConflictDoUpdate({
        target: students.nis,
        set: {
          name,
          className,
          gender: gender || null,
          updatedAt: new Date(),
        },
      });

    imported += 1;
  }

  if (imported === 0) {
    return NextResponse.json(
      {
        message:
          "Template CSV sudah terbaca, tetapi belum ada baris siswa yang valid. Isi minimal kolom nis, nama_siswa, dan kelas.",
      },
      { status: 400 },
    );
  }

  const [studentCountRow] = await db.select({ total: count() }).from(students);

  return NextResponse.json({
    message: `${imported} data siswa berhasil diimpor.`,
    imported,
    studentCount: Number(studentCountRow?.total ?? 0),
  });
}
