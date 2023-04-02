import fs from 'fs';
import { NextResponse } from 'next/server';
import PocketBase from 'pocketbase';
import * as XLSX from 'xlsx';

const pb = new PocketBase('https://pocketbase-production.up.railway.app');


export async function POST() {
  const authData = await pb.admins.authWithPassword('icemelt7@gmail.com', 'iK8tX7Y7rBq2GVf');
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
  // const xlData = utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
  // console.log(xlData);

  return NextResponse.json(sheet_name_list);
}
