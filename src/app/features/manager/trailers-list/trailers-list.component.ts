import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TrailerService } from '../../../core/services/trailer.service';
import { TrailerResponse } from '../../../core/models/trailer.model';

@Component({
    selector: 'app-manager-trailers-list',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './trailers-list.component.html'
})
export class ManagerTrailersListComponent implements OnInit {
    private trailerService = inject(TrailerService);
    private fb = inject(FormBuilder);

    trailers: TrailerResponse[] = [];
    isLoading = true;
    isModalOpen = false;
    isDetailModalOpen = false;
    isSubmitting = false;
    selectedTrailer: TrailerResponse | null = null;

    // Pagination
    currentPage = 0;
    pageSize = 10;
    totalElements = 0;
    totalPages = 0;
    isLastPage = false;

    trailerForm: FormGroup = this.fb.group({
        type: ['', Validators.required],
        maxWeight: [0, [Validators.required, Validators.min(1)]],
        maxVolume: [0, [Validators.required, Validators.min(1)]],
        status: ['AVAILABLE', Validators.required]
    });

    ngOnInit(): void {
        this.loadTrailers();
    }

    loadTrailers() {
        this.isLoading = true;
        this.trailerService.getTrailersPaginated(this.currentPage, this.pageSize).subscribe({
            next: (response) => {
                this.trailers = response.content;
                this.totalElements = response.totalElements;
                this.totalPages = response.totalPages;
                this.isLastPage = response.last;
                this.isLoading = false;
            },
            error: (err: any) => {
                console.error('Error fetching trailers', err);
                this.isLoading = false;
            }
        });
    }

    onPageChange(page: number) {
        if (page >= 0 && page < this.totalPages) {
            this.currentPage = page;
            this.loadTrailers();
        }
    }

    openModal() {
        this.isModalOpen = true;
        this.trailerForm.reset({ status: 'AVAILABLE', maxWeight: 0, maxVolume: 0 });
    }

    closeModal() {
        this.isModalOpen = false;
    }

    openDetailModal(trailer: TrailerResponse) {
        this.selectedTrailer = trailer;
        this.isDetailModalOpen = true;
    }

    closeDetailModal() {
        this.isDetailModalOpen = false;
        this.selectedTrailer = null;
    }

    onSubmit() {
        if (this.trailerForm.invalid) {
            this.trailerForm.markAllAsTouched();
            return;
        }

        this.isSubmitting = true;
        this.trailerService.createTrailer(this.trailerForm.value).subscribe({
            next: () => {
                this.isSubmitting = false;
                this.closeModal();
                this.loadTrailers();
            },
            error: (err) => {
                console.error('Error creating trailer', err);
                this.isSubmitting = false;
            }
        });
    }

    deleteTrailer(id: string) {
        if (confirm('Voulez-vous vraiment retirer cette remorque de la base de données?')) {
            this.trailerService.deleteTrailer(id).subscribe({
                next: () => this.loadTrailers(),
                error: (err) => console.error('Error deleting trailer', err)
            });
        }
    }

    getStatusColor(status: string): string {
        switch (status) {
            case 'AVAILABLE': return 'badge-available';
            case 'IN_USE': return 'badge-intuse';
            case 'IN_MAINTENANCE': return 'badge-maintenance';
            case 'BROKEN': return 'badge-broken';
            default: return 'badge-maintenance';
        }
    }
}
