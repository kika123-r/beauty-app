const CLOUD_NAME = 'dsvgjdbmp';
const UPLOAD_PRESET = 'beautytime_uploads';

export const uploadImage = async (file, folder = 'services') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', `beautytime/${folder}`);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) throw new Error('Upload failed');
  const data = await res.json();
  return data.secure_url;
};

export const uploadServiceImage = async (salonId, serviceId, file) => {
  return await uploadImage(file, `salons/${salonId}/services`);
};

export const uploadWorkerImage = async (salonId, workerId, file) => {
  return await uploadImage(file, `salons/${salonId}/workers`);
};
