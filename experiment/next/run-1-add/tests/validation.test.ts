import { describe, expect, it } from "vitest";
import { validateAttendanceEdit } from "@/lib/validation";

describe("validateAttendanceEdit", () => {
  it("正しい入力は保存できる", () => {
    expect(
      validateAttendanceEdit({ clockIn: "09:00", clockOut: "18:00", breaks: [{ start: "12:00", end: "13:00" }] }),
    ).toEqual({ ok: true, action: "save", clockIn: 540, clockOut: 1080, breaks: [{ start: 720, end: 780 }] });
  });

  it("退勤が出勤より前ならエラー", () => {
    const r = validateAttendanceEdit({ clockIn: "18:00", clockOut: "09:00", breaks: [] });
    expect(r.ok).toBe(false);
    expect(!r.ok && r.errors).toContain("退勤は出勤より後の時刻にしてください。");
  });

  it("休憩が勤務時間の外ならエラー", () => {
    expect(validateAttendanceEdit({ clockIn: "09:00", clockOut: "18:00", breaks: [{ start: "08:00", end: "08:30" }] }).ok).toBe(false);
  });

  it("休憩が重なっていたらエラー", () => {
    const r = validateAttendanceEdit({
      clockIn: "09:00",
      clockOut: "18:00",
      breaks: [
        { start: "12:00", end: "13:00" },
        { start: "12:30", end: "13:30" },
      ],
    });
    expect(!r.ok && r.errors).toContain("休憩の時間帯が重なっています。");
  });

  it("出勤がないのに退勤があるとエラー", () => {
    expect(validateAttendanceEdit({ clockIn: "", clockOut: "18:00", breaks: [] }).ok).toBe(false);
  });

  it("退勤を空にすると打刻漏れのまま保存できる", () => {
    const r = validateAttendanceEdit({ clockIn: "09:00", clockOut: "", breaks: [] });
    expect(r.ok && r.action === "save" && r.clockOut).toBeNull();
  });

  it("すべて空なら削除", () => {
    expect(validateAttendanceEdit({ clockIn: "", clockOut: "", breaks: [{ start: "", end: "" }] })).toEqual({
      ok: true,
      action: "delete",
    });
  });
});
