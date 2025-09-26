import { Component, ViewChild } from '@angular/core';
import {
	CurrentFolder,
	FileItem,
	UploadProgress,
} from './types/file-manager.types';
import { UploadComponent } from './components/upload/upload.component';
import { FileManagerService } from './services/file-manager.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FileItemComponent } from './components/file-item/file-item.component';
import { BreadcrumbComponent } from './components/breadcrumb/breadcrumb.component';

@Component({
	selector: 'ic-root',
	imports: [
		CommonModule,
		FormsModule,
		UploadComponent,
		FileItemComponent,
		BreadcrumbComponent,
	],
	templateUrl: './app.component.html',
	styleUrl: './app.component.scss',
})
export class AppComponent {
	@ViewChild('uploadComponent') uploadComponent!: UploadComponent;

	showUpload = false;

	activeUploads: UploadProgress[] = [];

	files: FileItem[] = [];

	showNewFolderInput = false;

	newFolderName = '';

	currentFolder: CurrentFolder = {
		name: '',
		parentId: 'root',
		id: '',
	};

	constructor(private fileManagerService: FileManagerService) {}

	ngOnInit() {
		this.getList();
	}

	getList(parentId?: string) {
		this.fileManagerService.getItems(parentId).subscribe({
			next: response => {
				if (!this.currentFolder?.id) {
					this.files = response.items.filter(
						item => item.parentId === null || item.parentId === ''
					);
				} else {
					this.files = response.items;
				}
			},
			error: error => {
				console.error('Failed to load files:', error);
			},
		});
	}

	onFilesSelected(files: File[]) {
		console.log('current', this.currentFolder);
		this.activeUploads = [];

		files.forEach(file => {
			this.fileManagerService
				.uploadFile(file, this.currentFolder.id)
				.subscribe({
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
								this.getList(this.currentFolder.id);
								setTimeout(() => {
									this.showUpload = false;
									this.uploadComponent?.clearProgress();
								}, 1000);
							}
						}, 1000);
					},
					error: error => {
						console.log('error', error);
						if (error.error?.errors) {
							const allMessages = error.error.errors
								.map((err: any) => err.message)
								.join('\n');
							alert(allMessages);
						}
						this.activeUploads = [];
						this.showUpload = false;
						this.uploadComponent?.clearProgress();
					},
				});
		});
	}

	onDeleteItem(file: FileItem) {
		if (confirm(`Are you sure you want to delete "${file.name}"?`)) {
			this.fileManagerService.deleteItem(file.id).subscribe({
				next: () => {
					this.getList(this.currentFolder.id);
				},
				error: error => {
					console.error('Delete failed:', error);
				},
			});
		}
	}

	onDownloadFile(file: FileItem) {
		this.fileManagerService.downloadFile(file.id).subscribe(blob => {
			const url = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = file.name;
			link.click();
			console.log('link', link);
			URL.revokeObjectURL(url);
		});
	}

	createFolder() {
		if (this.newFolderName) {
			this.fileManagerService
				.createFolder(this.newFolderName, this.currentFolder?.id)
				.subscribe(() => {
					this.getList(this.currentFolder.id);
					this.cancelNewFolder();
				});
		}
	}

	cancelNewFolder() {
		this.showNewFolderInput = false;
		this.newFolderName = '';
	}

	onClickFolder(file: FileItem) {
		if (file.folder) {
			const parent = file.parentId ?? 'root';

			this.currentFolder = {
				name: file.name,
				parentId: parent,
				id: file.id,
			};
		}
	}

	onPathChanged(folder: CurrentFolder | null) {
		if (folder) {
			this.getList(folder.id);
		}
	}

	navigateToRoot() {
		this.currentFolder = {
			name: '',
			parentId: 'root',
			id: '',
		};
		this.getList('');
	}

	navigateToFolder(folder: CurrentFolder | null) {
		if (folder) {
			this.currentFolder = {
				name: folder.name,
				parentId: folder.parentId,
				id: folder.id,
			};
			this.getList(folder.id);
		}
	}
}
