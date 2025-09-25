export interface FileItem {
	id: string;
	name: string;
	folder: boolean;
	createdAt: Date;
	updatedAt: Date;
	parentId?: string;
}

export interface UploadProgress {
	filename: string;
	progress: number;
	status: 'uploading' | 'completed' | 'error';
}

export interface FilesResponse {
	items: FileItem[];
}
