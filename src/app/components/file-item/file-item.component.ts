import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileItem } from '../../types/file-manager.types';

@Component({
	selector: 'app-file-item',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './file-item.component.html',
	styleUrls: ['./file-item.component.scss'],
})
export class FileItemComponent {
	@Input() file!: FileItem;
	@Output() delete = new EventEmitter<FileItem>();
	@Output() download = new EventEmitter<FileItem>();

	onDelete(event: Event) {
		event.stopPropagation();
		this.delete.emit(this.file);
	}

	onDownload(event: Event) {
		event.stopPropagation();
		this.download.emit(this.file);
	}
}
