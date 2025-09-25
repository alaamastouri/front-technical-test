import { Component, ViewChild } from '@angular/core';
import { FileItem, UploadProgress } from './types/file-manager.types';
import { UploadComponent } from './components/upload/upload.component';
import { FileManagerService } from './services/file-manager.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FileItemComponent } from './components/file-item/file-item.component';

@Component({
	selector: 'ic-root',
	imports: [CommonModule, FormsModule, UploadComponent, FileItemComponent],
	templateUrl: './app.component.html',
	styleUrl: './app.component.scss',
})
export class AppComponent {
	@ViewChild('uploadComponent') uploadComponent!: UploadComponent;

	showUpload = false;

	activeUploads: UploadProgress[] = [];

	files: FileItem[] = [];

	constructor(private fileManagerService: FileManagerService) {}

	ngOnInit() {
		this.fileManagerService.getItems().subscribe({
			next: response => {
				this.files = response.items;
			},
			error: error => {
				console.error('Failed to load files:', error);
			},
		});
	}

	onFilesSelected(files: File[]) {
		this.activeUploads = [];

		files.forEach(file => {
			this.fileManagerService.uploadFile(file).subscribe({
				next: progress => {
					const existingIndex = this.activeUploads.findIndex(
						p => p.filename === progress.filename
					);
					if (existingIndex >= 0) {
						this.activeUploads[existingIndex] = progress;
					} else {
						this.activeUploads.push(progress);
					}

					this.uploadComponent?.updateProgress([...this.activeUploads]);
				},
				complete: () => {
					setTimeout(() => {
						this.activeUploads = this.activeUploads.filter(
							p => p.filename !== file.name
						);
						this.uploadComponent?.updateProgress([...this.activeUploads]);

						if (this.activeUploads.length === 0) {
							setTimeout(() => {
								this.showUpload = false;
								this.uploadComponent?.clearProgress();
							}, 1000);
						}
					}, 1000);
				},
			});
		});
	}
}
