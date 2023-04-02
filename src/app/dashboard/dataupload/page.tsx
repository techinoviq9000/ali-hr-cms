import PocketBase from 'pocketbase';
import FileUpload from './fileupload';

async function getData() {
  const pb = new PocketBase('https://pocketbase-production.up.railway.app');
  const authData = await pb.admins.authWithPassword('icemelt7@gmail.com', 'iK8tX7Y7rBq2GVf');
  const records = await pb.collection('excelfiles').getFullList(200 /* batch size */, {
    sort: '-created',
  });
  // The return value is *not* serialized
  // You can return Date, Map, Set, etc.

  return records;
}

const DataUploadPage = async () => {
  const data = await getData();
  return <div><h1>Please Select Employee excel file</h1>
    <div>current files: 
      {data.map((item) => {
        return <div key={item.id}>{item.id}</div>
      })}
    </div>
    <FileUpload />
  </div>
}

export default DataUploadPage;