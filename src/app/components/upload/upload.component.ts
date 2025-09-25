import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadProgress } from '../../types/file-manager.types';

@Component({
	selector: 'app-upload',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './upload.component.html',
	styleUrls: ['./upload.component.scss'],
})
export class UploadComponent {
	@Output() filesSelected = new EventEmitter<File[]>();

	isDragging = false;
	uploadProgress: UploadProgress[] = [];

	onDragOver(event: DragEvent) {
		event.preventDefault();
		this.isDragging = true;
	}

	onDragLeave(event: DragEvent) {
		event.preventDefault();
		this.isDragging = false;
	}

	onDrop(event: DragEvent) {
		event.preventDefault();
		this.isDragging = false;

		const files = Array.from(event.dataTransfer?.files || []);
		if (files.length > 0) {
			this.filesSelected.emit(files);
		}
	}

	onFileSelect(event: Event) {
		const input = event.target as HTMLInputElement;
		const files = Array.from(input.files || []);
		if (files.length > 0) {
			this.filesSelected.emit(files);
		}
		input.value = '';
	}

	updateProgress(progress: UploadProgress[]) {
		this.uploadProgress = progress;
	}

	clearProgress() {
		this.uploadProgress = [];
	}
}
