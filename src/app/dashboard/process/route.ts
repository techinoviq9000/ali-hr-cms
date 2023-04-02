import fs from 'fs';
import chunk from 'lodash/chunk';
import Papa from 'papaparse';
import { NextResponse } from 'next/server';
import PocketBase from 'pocketbase';
import * as XLSX from 'xlsx';

const pb = new PocketBase('https://pocketbase-production.up.railway.app');

/* given the old range and a new range spec, produce the new range */
function change_range(old, range) {
  var oldrng = XLSX.utils.decode_range(old), newrng;
  if(typeof range == "string") {
    if(range.charAt(0) == ":") newrng = {e:XLSX.utils.decode_cell(range.substr(1))};
    else if(range.charAt(range.length - 1) == ":") newrng = {s:XLSX.utils.decode_cell(range.substr(0, range.length - 1))};
    else newrng = XLSX.utils.decode_range(range);
  } else newrng = range;
  if(newrng.s) {
    if(newrng.s.c != null) oldrng.s.c = newrng.s.c;
    if(newrng.s.r != null) oldrng.s.r = newrng.s.r;
  }
  if(newrng.e) {
    if(newrng.e.c != null) oldrng.e.c = newrng.e.c;
    if(newrng.e.r != null) oldrng.e.r = newrng.e.r;
  }

  return XLSX.utils.encode_range(oldrng);
}

/* call change_sheet and modify worksheet */
function set_sheet_range(sheet, range) {
  sheet['!ref'] = change_range(sheet['!ref'], range);
}

function update_sheet_range(ws) {
  var range = {s:{r:Infinity, c:Infinity},e:{r:0,c:0}};
  Object.keys(ws).filter(function(x) { return x.charAt(0) != "!"; }).map(XLSX.utils.decode_cell).forEach(function(x) {
    range.s.c = Math.min(range.s.c, x.c); range.s.r = Math.min(range.s.r, x.r);
    range.e.c = Math.max(range.e.c, x.c); range.e.r = Math.max(range.e.r, x.r);
  });
  ws['!ref'] = XLSX.utils.encode_range(range);
}

export async function POST() {
  if (pb.authStore.model?.email !== 'icemelt7@gmail.com') {
    const authData = await pb.admins.authWithPassword('icemelt7@gmail.com', 'iK8tX7Y7rBq2GVf');
  }
  const records = await pb.collection('excelfiles').getFullList(200 /* batch size */, {
    sort: '-created',
    filter: 'processed = false',
  });

  const record = records[0];
  const url = pb.getFileUrl(record, record.excelfile);
  const data = await (await fetch(url)).arrayBuffer();
  var workbook = XLSX.read(data);
  var sheet_name_list = workbook.SheetNames;
  console.log(sheet_name_list);
  let _json = [];
  sheet_name_list.forEach(function(y) { /* iterate through sheets */ 
    var worksheet = workbook.Sheets[y];
    _json.push(XLSX.utils.sheet_to_csv(worksheet));
  });
  const final = {};
  _json.forEach((item, index) => {
    const dataJSON = Papa.parse(item);
    final[index] = dataJSON;
    console.log(dataJSON);
  });

  // get employees rows
  const timetable = final[2].data[0];
  console.log(timetable);
  const rows = chunk(timetable, 18);

  const attendenceData: Attendence[] = [];
  const names = new Set();
  rows.forEach((row, i) => {
    const index = row[0] as number;
    const personId = row[1] as number;
    const name = row[2] as string;
    const department = row[3] as string;
    const position = row[4] as string;
    const gender = row[5] as string;
    const date = row[6] as string;
    const week = row[7] as string;
    const timetable = row[8] as string;
    const checkIn = row[9] as string;
    const checkOut = row[10] as string;
    const work = row[11] as string;
    const ot = row[12] as string;
    const attended = row[13] as string;
    const late = row[14] as string;
    const early = row[15] as string;
    const absent = row[16] as string;
    const leave = row[17] as string;

    attendenceData.push({
      index,
      personId,
      name,
      department,
      position,
      gender,
      date,
      week,
      timetable,
      checkIn,
      checkOut,
      work,
      ot,
      attended,
      late,
      early,
      absent,
      leave,
    });

    names.add(name);
  });

  const nameArr = Array.from(names);
  for (let i = 0; i < nameArr.length; i++) {
    const name = nameArr[i];
    console.log(name);
    const data = {
      name
    };
    const resultList = await pb.collection('employees').getList(1, 50, {
      filter: `name = '${name}'`,
    });
    console.log(resultList.items);
    console.log(resultList.totalItems);
    if (resultList.totalItems === 0) {
      const record = await pb.collection('employees').create(data);
    }
  }
  
  const allEmployees = await pb.collection('employees').getFullList();
  // Now parse the attendence data
  for (let i = 0; i < 5; /* attendenceData.length; */ i++) {
    const data = attendenceData[i];
    const employeeId = allEmployees.find((item) => item.name === data.name)?.id;
    
    const dataCreate = {
      checkin: data.date.replace(/\//g, '-') + ' ' + data.checkIn,
      checkout: data.date.replace(/\//g, '-') + ' ' + data.checkOut,
      employee: employeeId,
    };
    console.log(dataCreate);
    // const record = await pb.collection('attendencelogs').create(data);
  }

  // const dataJSON = Papa.parse(csv);
  // const xlData = utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
  // console.log(xlData);

  return NextResponse.json(rows);
}
