interface Attendence {
  index: number;
  personId: number;
  name: string;
  department: string;
  position: string;
  gender: string;
  date: string;
  week: string;
  timetable: string;
  checkIn: string;
  checkOut: string;
  work: string;
  /** 
   * Note: LV = Apply for Leave/Business Trip; L = Late; E = Early Leave; W = Attended; OT1 = OT1; OT2 = OT2; OT3 = OT3; A = Absent; # = Weekend; Min. Unit: Work-min; OT-min; Attended-min; Late-min; Early-min; Absent-min; Leave-min; Time Format: Work-HH:MM; OT-HH:MM; Attended-HH:MM; Late-MM; Early-MM; Absent-MM; Leave-MM;
   * */ 
  ot: string;
  attended: string;
  late: string;
  early: string;
  absent: string;
  leave: string;
}