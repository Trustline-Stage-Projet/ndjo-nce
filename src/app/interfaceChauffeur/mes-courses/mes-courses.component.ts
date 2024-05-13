import { Vehicule } from '../../utilitaire/models/gve';
import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CrmService } from 'src/app/utilitaire/services/crm.service';

@Component({
  selector: 'app-mes-courses',
  templateUrl: './mes-courses.component.html',
  styleUrls: ['./mes-courses.component.css']
})
export class MesCoursesComponent implements OnInit {
  searchTerm: string = '';
  searchResult: any[] = [];
  pageTitle = 'Liste des Courses';
  Result: any[] = [];
  reservations: any | undefined;
  currentPage: number = 1;
  itemsPerPage: number = 10;
  resultCount: {
    beforeToday: number;
    today: number;
    afterToday: number;
  } = {
      beforeToday: 0,
      today: 0,
      afterToday: 0
  };
  userInfo: any;
  triDateAscendant = true; // Contrôle le tri ascendant ou descendant pour la date
  triStatutAscendant = true;
  vehiculesDetails : any
  vehicule : any


  constructor(
    private _reservationService: CrmService,
    private _modalService: NgbModal, ){}

  ngOnInit(): void {

    this._reservationService.getUserInfo().subscribe(
      (userData: any) => {
        this.userInfo = userData;
        this.getReservations(userData.user_id);
      },
      (error) => {
        console.error('Erreur', error);
      }
    );
  }

  getReservations(id_user: any): void {
    this._reservationService.getReservationsByUserId(id_user).subscribe({
      next: (reservations) => {
        this.reservations = reservations;
        this.Result = reservations;
        // Nouveau: Création d'une structure pour stocker les détails de chaque véhicule
        this.vehiculesDetails = {}; // Supposons que cela soit un objet pour le moment

        reservations.forEach((reservation: { vehicule: any; }) => {
          // Appel pour obtenir les détails du véhicule pour chaque réservation
          this.getVehicule(reservation.vehicule); // Assurez-vous que 'vehiculeId' est le bon champ
        });

        this.calculateCounts();
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des réservations:', error);
      }
    });
  }


  getVehicule(vehiculeId: any): void {
    this._reservationService.getVehiculeDetail(vehiculeId).subscribe((data) => {
      // Format les données reçues pour correspondre au format 'marque modèle (annee_fabrication)'
      const formattedDetails = `${data.marque} ${data.modele} (${data.annee_fabrication})`;
      // Stocke les détails formatés dans 'vehiculesDetails', en utilisant l'ID du véhicule comme clé
     this.vehicule = this.vehiculesDetails[vehiculeId] = formattedDetails;
    });
  }
  calculateCounts(): void {
    const today = new Date();
    const formattedToday = today.toISOString().split('T')[0];

    this.resultCount.beforeToday = this.reservations.filter(
      (reservation: any) => new Date(reservation.datePriseEnCharge) < today
    ).length;

    this.resultCount.today = this.reservations.filter(
      (reservation: any) => reservation.datePriseEnCharge === formattedToday
    ).length;

    this.resultCount.afterToday = this.reservations.filter(
      (reservation: any) => new Date(reservation.datePriseEnCharge) > today
    ).length;
  }

    // methode pour faire la recherche
    onSearchChange(event: Event): void {
      this.searchTerm = (event.target as HTMLInputElement).value;
      if (this.searchTerm.trim() === '') {
        this.searchResult = [];
      } else {
        this._reservationService.searchReservations(this.searchTerm).subscribe(
          (reservations) => {
            this.searchResult = reservations;
          },
          (error) => {
            console.error(error);
          }
        );
      }
    }

    getAlls() {
      this.pageTitle = 'Toutes les Courses';
      this.Result = this.reservations; // Mettez toutes les réservations dans Result
      this.searchTerm = ''; // Réinitialisez searchTerm s'il est utilisé pour la recherche
    }


  getReservationsBeforeToday(): void {
    this.pageTitle = 'Liste des Courses antérieures';
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Réglez l'heure à 00:00:00:00 pour la comparaison
    this.Result = this.reservations.filter((reservation: any) => {
      const reservationDate = new Date(reservation.datePriseEnCharge);
      reservationDate.setHours(0, 0, 0, 0);
      return reservationDate < today;
    });
  }

  getReservationsToday(): void {
    this.pageTitle = 'Liste des Courses du jour';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    this.Result = this.reservations.filter((reservation: any) => {
      const reservationDate = new Date(reservation.datePriseEnCharge);
      reservationDate.setHours(0, 0, 0, 0);
      return reservationDate.getTime() === today.getTime();
    });
  }

  getReservationsAfterToday(): void {
    this.pageTitle = 'Liste des Courses à venir';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    this.Result = this.reservations.filter((reservation: any) => {
      const reservationDate = new Date(reservation.datePriseEnCharge);
      reservationDate.setHours(0, 0, 0, 0);
      return reservationDate > today;
    });
  }

  trierParDate(): void {
    this.reservations.sort((a: { datePriseEnCharge: string | number | Date; }, b: { datePriseEnCharge: string | number | Date; }) => {
      const dateA = new Date(a.datePriseEnCharge).getTime();
      const dateB = new Date(b.datePriseEnCharge).getTime();
      return this.triDateAscendant ? dateA - dateB : dateB - dateA;
    });
    this.triDateAscendant = !this.triDateAscendant; // Inverse l'ordre pour le prochain clic
  }

  getReservationsForCurrentPage(): any[] {
    const dataToPaginate = this.searchTerm ? this.searchResult : this.Result;
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return dataToPaginate.slice(startIndex, endIndex);
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    const totalPages = Math.ceil((this.searchTerm ? this.searchResult : this.Result).length / this.itemsPerPage);
    if (this.currentPage < totalPages) {
      this.currentPage++;
    }
  }
  getPaginationArray(): number[] {
    const totalPages = Math.ceil((this.searchTerm ? this.searchResult : this.Result).length / this.itemsPerPage);
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  setCurrentPage(page: number): void {
    if (page >= 1 && page <= Math.ceil((this.searchTerm ? this.searchResult : this.Result).length / this.itemsPerPage)) {
      this.currentPage = page;
    }
  }
}
