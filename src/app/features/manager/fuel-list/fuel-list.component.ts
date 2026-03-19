import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FuelService } from '../../../core/services/fuel.service';
import { TruckService } from '../../../core/services/truck.service';
import { CarburantTransactionResponse } from '../../../core/models/fuel.model';
import { TruckResponse } from '../../../core/models/truck.model';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-manager-fuel-list',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './fuel-list.component.html'
})
export class ManagerFuelListComponent implements OnInit {
    private fuelService = inject(FuelService);
    private truckService = inject(TruckService);
    private fb = inject(FormBuilder);

    transactions: CarburantTransactionResponse[] = [];
    trucks: TruckResponse[] = [];

    isLoading = true;
    isModalOpen = false;
    isSubmitting = false;
    editMode = false;
    selectedId: string | null = null;

    fuelForm: FormGroup = this.fb.group({
        reference: ['', Validators.required],
        truckId: ['', Validators.required],
        dateHeure: ['', Validators.required],
        quantite: [0, [Validators.required, Validators.min(0.1)]],
        cout: [0, [Validators.required, Validators.min(0.1)]],
        stationName: ['', Validators.required],
        receiptNumber: ['']
    });

    ngOnInit(): void {
        this.loadData();
    }

    loadData() {
        this.isLoading = true;
        this.fuelService.getFuelTransactions().subscribe({
            next: (data: CarburantTransactionResponse[]) => {
                this.transactions = data;
                this.isLoading = false;
            },
            error: (err: any) => {
                console.error('Error fetching fuel transactions', err);
                this.isLoading = false;
                Swal.fire({
                    icon: 'error',
                    title: 'Erreur',
                    text: 'Impossible de charger les transactions.',
                    background: '#1a1c23', color: '#f4f5f7'
                });
            }
        });

        this.truckService.getTrucks().subscribe((t: TruckResponse[]) => this.trucks = t);
    }

    openModal(transaction?: CarburantTransactionResponse) {
        this.isModalOpen = true;
        this.editMode = !!transaction;

        if (transaction) {
            this.selectedId = transaction.id;
            this.fuelForm.patchValue({
                reference: transaction.reference,
                truckId: transaction.truckId,
                dateHeure: transaction.dateHeure.split('T')[0],
                quantite: transaction.quantite,
                cout: transaction.cout,
                stationName: transaction.stationName,
                receiptNumber: transaction.receiptNumber
            });
        } else {
            this.selectedId = null;
            this.fuelForm.reset({
                quantite: 0,
                cout: 0,
                dateHeure: new Date().toISOString().split('T')[0]
            });
        }
    }

    closeModal() {
        this.isModalOpen = false;
        this.fuelForm.reset();
    }

    onSubmit() {
        if (this.fuelForm.invalid) {
            this.fuelForm.markAllAsTouched();
            return;
        }

        this.isSubmitting = true;
        const val = this.fuelForm.value;

        const payload = {
            ...val,
            dateHeure: val.dateHeure.includes('T') ? val.dateHeure : `${val.dateHeure}T12:00:00`
        };

        if (this.editMode && this.selectedId) {
            this.fuelService.updateFuelTransaction(this.selectedId, payload).subscribe({
                next: () => {
                    this.isSubmitting = false;
                    this.closeModal();
                    this.loadData();
                    Swal.fire({ icon: 'success', title: 'Mis à jour', background: '#1a1c23', color: '#f4f5f7', timer: 2000 });
                },
                error: (err) => {
                    this.isSubmitting = false;
                    Swal.fire({ icon: 'error', title: 'Erreur', text: err.error?.message || 'Erreur lors de la mise à jour', background: '#1a1c23', color: '#f4f5f7' });
                }
            });
        } else {
            this.fuelService.createFuelTransaction(payload).subscribe({
                next: () => {
                    this.isSubmitting = false;
                    this.closeModal();
                    this.loadData();
                    Swal.fire({ icon: 'success', title: 'Enregistré', background: '#1a1c23', color: '#f4f5f7', timer: 2000 });
                },
                error: (err) => {
                    console.error('Error recording fuel transaction', err);
                    this.isSubmitting = false;
                    Swal.fire({ icon: 'error', title: 'Erreur', text: err.error?.message || 'Erreur lors de l’enregistrement', background: '#1a1c23', color: '#f4f5f7' });
                }
            });
        }
    }

    deleteTransaction(id: string) {
        Swal.fire({
            title: 'Supprimer cet enregistrement ?',
            text: "Cette action est irréversible.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#3b82f6',
            confirmButtonText: 'Oui, supprimer',
            cancelButtonText: 'Annuler',
            background: '#1a1c23', color: '#f4f5f7'
        }).then((result) => {
            if (result.isConfirmed) {
                this.fuelService.deleteFuelTransaction(id).subscribe({
                    next: () => {
                        this.loadData();
                        Swal.fire({ icon: 'success', title: 'Supprimé', background: '#1a1c23', color: '#f4f5f7', timer: 1500 });
                    },
                    error: (err) => {
                        Swal.fire({ icon: 'error', title: 'Erreur', text: 'Impossible de supprimer cet enregistrement', background: '#1a1c23', color: '#f4f5f7' });
                    }
                });
            }
        });
    }
}
