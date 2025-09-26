import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CurrentFolder, FileItem } from '../../types/file-manager.types';

@Component({
	selector: 'app-breadcrumb',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './breadcrumb.component.html',
	styleUrl: './breadcrumb.component.scss',
})
export class BreadcrumbComponent {
	@Input() currentFolder: CurrentFolder = {
		name: '',
		parentId: 'root',
		id: '',
	};

	path: CurrentFolder[] = [];

	@Output() pathChanged = new EventEmitter<CurrentFolder | null>();
	@Output() rootClick = new EventEmitter<void>();
	@Output() pathClick = new EventEmitter<CurrentFolder>();

	ngOnChanges() {
		if (this.currentFolder?.name.length > 0) {
			const folderExists = this.path.some(
				folder => folder.name === this.currentFolder.name
			);

			if (!folderExists) {
				const sameLevelFolderIndex = this.path.findIndex(
					folder => folder.parentId === this.currentFolder.parentId
				);

				if (sameLevelFolderIndex !== -1) {
					this.path[sameLevelFolderIndex] = this.currentFolder;
				} else {
					this.path.push(this.currentFolder);
				}
				this.emitCurrentFolder();
			}
		}
	}

	emitCurrentFolder() {
		const currentFolder =
			this.path.length > 0 ? this.path[this.path.length - 1] : null;
		this.pathChanged.emit(currentFolder);
	}

	onRootClick(event: Event) {
		this.path = [];
		event.stopPropagation();
		this.rootClick.emit();
	}

	onPathClick(folder: CurrentFolder, event: Event) {
		console.log('clicked path', folder);
		const folderIndex = this.path.indexOf(folder);
		if (folderIndex !== -1) {
			this.path.splice(folderIndex + 1);
		}
		event.stopPropagation();
		this.pathClick.emit(folder);
	}
}
