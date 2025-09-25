import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, delay, map } from 'rxjs';
import { FileItem, UploadProgress } from '../types/file-manager.types';
import { HttpClient, HttpEventType, HttpRequest } from '@angular/common/http';

@Injectable({
	providedIn: 'root',
})
export class FileManagerService {
	private readonly apiUrl = 'http://localhost:3001/api/items';

	constructor(private http: HttpClient) {}

	uploadFile(file: File, parentId?: string): Observable<UploadProgress> {
		const formData = new FormData();
		formData.append('files', file);

		if (parentId) {
			formData.append('parentId', parentId);
		}

		const request = new HttpRequest('POST', this.apiUrl, formData, {
			reportProgress: true,
		});

		return this.http.request(request).pipe(
			map(event => {
				switch (event.type) {
					case HttpEventType.UploadProgress:
						const progress = event.total
							? Math.round((100 * event.loaded) / event.total)
							: 0;
						return {
							filename: file.name,
							progress,
							status: 'uploading' as const,
						};

					case HttpEventType.Response:
						return {
							filename: file.name,
							progress: 100,
							status: 'completed' as const,
						};

					default:
						return {
							filename: file.name,
							progress: 0,
							status: 'uploading' as const,
						};
				}
			})
		);
	}
}
