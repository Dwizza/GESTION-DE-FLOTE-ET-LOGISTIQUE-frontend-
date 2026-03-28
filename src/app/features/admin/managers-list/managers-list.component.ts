import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ManagerManagementService } from '../../../core/services/manager-management.service';
import { ManagerResponse } from '../../../core/models/manager.model';

@Component({
    selector: 'app-managers-list',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './managers-list.component.html'
})
export class ManagersListComponent implements OnInit {
    private managerManagementService = inject(ManagerManagementService);
    private fb = inject(FormBuilder);

    managers: ManagerResponse[] = [];
    isLoading = true;
    isModalOpen = false;

    // Pagination
    currentPage = 0;
    pageSize = 6;
    totalElements = 0;
    totalPages = 0;
    isLastPage = false;

    managerForm: FormGroup = this.fb.group({
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
    });

    isSubmitting = false;

    ngOnInit(): void {
        this.loadManagers();
    }

    loadManagers() {
        this.isLoading = true;
        this.managerManagementService.getManagersPaginated(this.currentPage, this.pageSize).subscribe({
            next: (response) => {
                this.managers = response.content;
                this.totalElements = response.totalElements;
                this.totalPages = response.totalPages;
                this.isLastPage = response.last;
                this.isLoading = false;
            },
            error: (err: any) => {
                console.error('Error fetching managers', err);
                this.isLoading = false;
            }
        });
    }

    onPageChange(page: number) {
        if (page >= 0 && page < this.totalPages) {
            this.currentPage = page;
            this.loadManagers();
        }
    }

    openModal() {
        this.isModalOpen = true;
        this.managerForm.reset();
    }

    closeModal() {
        this.isModalOpen = false;
    }

    onSubmit() {
        if (this.managerForm.invalid) {
            this.managerForm.markAllAsTouched();
            return;
        }

        this.isSubmitting = true;
        this.managerManagementService.createManager(this.managerForm.value).subscribe({
            next: () => {
                this.isSubmitting = false;
                this.closeModal();
                this.loadManagers();
            },
            error: (err) => {
                console.error('Error creating manager', err);
                this.isSubmitting = false;
            }
        });
    }

    deleteManager(id: string) {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce responsable?')) {
            this.managerManagementService.deleteManager(id).subscribe({
                next: () => this.loadManagers(),
                error: (err) => console.error('Error deleting manager', err)
            });
        }
    }
}
