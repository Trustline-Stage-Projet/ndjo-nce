import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CrmService } from 'src/app/utilitaire/services/crm.service';

@Component({
  selector: 'app-details-course',
  templateUrl: './details-course.component.html',
  styleUrls: ['./details-course.component.css'],
})
export class DetailsCourseComponent implements OnInit {
  reservation?: any;
  clientDetails: any;
  reservationId!: number;
  vehiculeData: any;
  loading: boolean = false;
  errorMessage!: string;
  successMessage!: string;

  constructor(
    private _modalService: NgbModal,
    private _reservationService: CrmService,
    private route: ActivatedRoute,
    private router: Router
  ) {}
  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.reservationId = +params['id']; // Assurez-vous que 'id' correspond à l'ID de la réservation dans vos routes
    });
    this.getReservation();
  }

  getReservation(): void {
    const id = this.route.snapshot.params['id'];
    this._reservationService.getReservation(id).subscribe((reservation) => {
      this.reservation = reservation;
      this.getClientData();
      this.getVehiculeData();
    });
  }

  getVehiculeData() {
    this._reservationService
      .getVehiculeDetail(this.reservation.vehicule)
      .subscribe((vehicule) => {
        this.vehiculeData = vehicule;
      });
  }

  getClientData() {
    this._reservationService
      .getClientDetails(this.reservation.utilisateur)
      .subscribe((data) => {
        this.clientDetails = data;
      });
  }

  openConfirmationModal(content: any, msg: any, reservationId: any) {
    this._modalService
      .open(content, { centered: true, ariaLabelledBy: 'modal-basic-title' })
      .result.then(
        (result) => {
          if (result === 'confirm') {
            this.loading = true;
            this.notifier(reservationId, msg);
          }
        },
        (reason) => {
          // Modal closed without confirming (cancel or backdrop click)
        }
      );
  }
  
  notifier(reservationId: number, msg: any) {
    setTimeout(() => {
      this._reservationService.notifierRefus(reservationId).subscribe({
        next: (response) => {
          this.loading = false;
          console.log('Refus notifié avec succès.', response);
          // Vous pouvez ajouter des actions supplémentaires ici, par exemple, afficher une notification à l'utilisateur
          this.successMessage = 'la course a ete annuler avec success';
          this._modalService.open(msg, { centered: true });
          this.router.navigate(['/mesCourses']);
        },
        error: (error) => {
          this.loading = false;
          console.error('Erreur lors de la notification de refus', error);
          this.errorMessage =
            "une erreur est survenu lors de l'annulation de la reservation ";
          this._modalService.open(msg, { centered: true });
          // Gestion de l'erreur, par exemple, afficher un message d'erreur à l'utilisateur
        },
      });
    }, 1000);
  }
}
