import { serverUrl } from "@/constants";
import axios from "axios";

// inside a form or component
export const handleZipUpload = async (
  formData: FormData
) => {
    console.log(formData)
  try {
    const response = await axios.post(`${serverUrl}/upload-zip`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    console.log("Upload successful:", response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        alert(`Upload failed: ${error.response.statusText}`);
      } else if (error.request) {
        alert("No response received from the server.");
      }
    } else {
      alert("An unexpected error occurred during upload.");
    }
  }
};
