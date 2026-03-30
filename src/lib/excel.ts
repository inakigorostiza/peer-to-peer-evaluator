import * as XLSX from "xlsx";
import {
  groupsExcelRowSchema,
  studentsExcelRowSchema,
  type GroupsExcelRow,
  type StudentsExcelRow,
} from "@/lib/validators";

export interface ParseError {
  row: number;
  message: string;
}

export interface ParseResult<T> {
  data: T[];
  errors: ParseError[];
}

function parseFile(buffer: Buffer): Record<string, unknown>[] {
  const workbook = XLSX.read(buffer, { type: "buffer", codepage: 65001 });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);
}

export function parseGroupsFile(buffer: Buffer): ParseResult<GroupsExcelRow> {
  const rows = parseFile(buffer);
  const data: GroupsExcelRow[] = [];
  const errors: ParseError[] = [];

  rows.forEach((row, index) => {
    const result = groupsExcelRowSchema.safeParse(row);
    if (result.success) {
      data.push(result.data);
    } else {
      result.error.issues.forEach((err) => {
        errors.push({
          row: index + 2, // +2 for 1-indexed + header row
          message: `${err.path.join(".")}: ${err.message}`,
        });
      });
    }
  });

  return { data, errors };
}

export function parseStudentsFile(buffer: Buffer): ParseResult<StudentsExcelRow> {
  const rows = parseFile(buffer);
  const data: StudentsExcelRow[] = [];
  const errors: ParseError[] = [];

  rows.forEach((row, index) => {
    // Skip rows with empty User Name (blank student entries)
    const userName = row["User Name"];
    if (!userName || (typeof userName === "string" && userName.trim() === "")) {
      return;
    }

    const result = studentsExcelRowSchema.safeParse(row);
    if (result.success) {
      data.push(result.data);
    } else {
      result.error.issues.forEach((err) => {
        errors.push({
          row: index + 2,
          message: `${err.path.join(".")}: ${err.message}`,
        });
      });
    }
  });

  return { data, errors };
}
