'use client';
import { useEffect } from "react";
import PocketBase from 'pocketbase';
import { useRouter } from "next/navigation";

const FileUpload = () => {
  const router = useRouter();
  useEffect(() => {
    const pb = new PocketBase('https://pocketbase-production.up.railway.app');
    const upload = async () => {
      // const authData = await pb.admins.authWithPassword('icemelt7@gmail.com', 'iK8tX7Y7rBq2GVf');
      const fileInput = document.getElementById('fileInput');
      if (!fileInput) return;

      const formData = new FormData();

      fileInput.addEventListener('change', async () => {
        for (let file of (fileInput as any).files) {
          formData.append('excelfile', file);
        }
        const createdRecord = await pb.collection('excelfiles').create(formData);
        console.log(createdRecord);
        router.refresh();
      });
    }
    upload();
  }, []);
  return <form>
    <input type="file" name="file" id="fileInput"  />
    <input className="rounded bg-indigo-600 px-2 py-1 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600" type="submit" value="Upload" />
  </form>
}

export default FileUpload;
