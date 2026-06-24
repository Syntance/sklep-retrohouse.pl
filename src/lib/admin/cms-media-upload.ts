import "server-only";

import { adminUpload } from "@/lib/admin/medusa-admin";
import { isR2UploadConfigured, uploadFilesToR2 } from "@/lib/admin/r2-upload";

/** CMS hero — preferuje bezpośredni R2 (Medusa /admin/uploads często zwraca unknown_error przy S3). */
export async function uploadCmsMediaFiles(files: File[]): Promise<string[]> {
	if (isR2UploadConfigured()) {
		return uploadFilesToR2(files, "cms");
	}
	return adminUpload(files);
}
