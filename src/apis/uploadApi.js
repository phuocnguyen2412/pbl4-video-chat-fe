import axios from 'axios';
import axiosClient from '../configs/axiosClient';
import typeOfFile from '../helpers/typeOfFile';

const uploadApi = {
    getPresignedUrl: async function (folder) {
        return axiosClient.post('/upload/get-presigned-url', {
            folder
        });
    },
    upload: async function (file, folder) {
        console.log(file.type);
        const res = await this.getPresignedUrl(folder);
        const formData = new FormData();
        formData.append('file', file); // The image file to upload
        formData.append('api_key', res.data.apiKey);
        formData.append('timestamp', res.data.timestamp);
        formData.append('signature', res.data.signature);
        formData.append('folder', res.data.folder); // Optional: folder where to store the image
        let uploadEndpoint;
        switch (typeOfFile(file)) {
            case 'Picture':
                uploadEndpoint = `https://api.cloudinary.com/v1_1/${res.data.cloudName}/image/upload`;
                break;
            case 'Video':
                uploadEndpoint = `https://api.cloudinary.com/v1_1/${res.data.cloudName}/video/upload`;
                break;
            case 'Document':
                uploadEndpoint = `https://api.cloudinary.com/v1_1/${res.data.cloudName}/raw/upload`;
                break;
            default:
                break;
        }

        // Step 2: Upload the image directly to Cloudinary
        const { status, data } = await axios.post(uploadEndpoint, formData, {
            withCredentials: false
        });
        return {
            status,
            data
        };
    }
};

export default uploadApi;
