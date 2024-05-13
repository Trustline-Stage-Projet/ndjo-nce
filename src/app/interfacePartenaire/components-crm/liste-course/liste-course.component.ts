import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CrmService } from 'src/app/utilitaire/services/crm.service';

@Component({
  selector: 'app-liste-course',
  templateUrl: './liste-course.component.html',
  styleUrls: ['./liste-course.component.css']
})
export class ListeCourseComponent implements OnInit {

  @ViewChild('content') modalContent: any;
  chauffeurs: any;
  data: any
  calForm: FormGroup;
  coutVente: any
  cout: any
  loading: boolean = false;
  errorMessage = '';
  successMessage = '';
  showResults: boolean = false;
  compensationEnabled = true;
  afficherChauffeurInterne = false;
  searchTerm: string = '';
  searchResult: any[] = [];
  pageTitle = 'Liste des Courses';
  Result: any[] = [];
  form: FormGroup;
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
  vehicule: any;
  constructor(
    private _reservationService: CrmService,
    private _modalService: NgbModal,
    private fb: FormBuilder,
    ){
      this.form = this.fb.group({
        reservationId: ['', Validators.required],
        utilisateur_id: [''],
        email: ['', [Validators.email]]
      }, { validators: this.validateUtilisateurOrEmail });

      this.calForm = this.fb.group({
        commission: 10,
        compensation: 0,
        coutDeVente: 0,
      })

    }

  ngOnInit(): void {

    this._reservationService.getUserInfo().subscribe(
      (userData: any) => {
        this.userInfo = userData;
        this.getReservations(userData.user_id);
        this.getChauffeur(userData.user_id);
      },
      (error) => {
        console.error('Erreur', error);
      }
    );
  }

  // getReservations(id_user:any): void {
  //   this._reservationService.getReservationsByUserId(id_user).subscribe({
  //     next: (data) => {
  //       this.reservations = data;
  //       console.log('reservation', this.reservations)
  //       this.Result = data;
  //       this.calculateCounts();
  //     },
  //     error: (error) => {
  //       console.error('Erreur lors de la récupération des réservations:', error);
  //     }
  //   });
  // }

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

  getFormattedStatus(status: string): string {
    switch (status) {
      case 'en_attente':
        return 'En Attente';
      case 'en_traitement':
        return 'En Traitement';
      case 'affecter_a_chauffeur':
        return 'Affecté à Chauffeur';
      case 'affecter_a_partenaire':
        return 'Affecté à Partenaire';
      case 'non_affecter':
        return 'Non Affecté';
      case 'confirmer':
          return 'Confirmer';
      case 'chauffeur_notifier':
        return 'Chauffeur Notifié';
      case 'en_cours':
        return 'En Cours';
      case 'terminer':
        return 'Terminé';
      default:
        return status; // Retourne le statut original si non reconnu
    }
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
  getChauffeur(entreprise: any): void {
      this._reservationService.getChauffeursParPartenaire(entreprise).subscribe({
          next: (data) => {
            console.log(data)
            this.chauffeurs = data;
          },
          error: (e) => console.error(e)
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
  reload() {
    window.location.reload()
  }

  compenserCourse() {
    this.compensationEnabled = true;
    this.calForm.get('compensation')?.reset(); // Réinitialisez la valeur de compensation (si nécessaire)
  }

  appliquerCommission() {
    this.compensationEnabled = false;
    this.calForm.get('commission')?.reset(); // Réinitialisez la valeur de commission (si nécessaire)
  }

  calculate() {
    if (this.compensationEnabled) {
      this.coutVente = this.cout + this.calForm.value.compensation;

    } else {
      const commission = this.cout * (this.calForm.value.commission / 100);
      this.coutVente = this.cout - commission;

    }
    this.showResults = true;
  }
  uploadCalcul() {
    const Data = {
      ...this.data,
      prixVentePartenaire: this.coutVente,
      commission: this.calForm.get('commission')?.value,
      compensation: this.calForm.get('compensation')?.value,

    };
    this._reservationService.updateReservation(this.data.id, Data).subscribe((updated) => {
    });
  }

  validateUtilisateurOrEmail(formGroup: FormGroup): { [key: string]: boolean } | null {
    const utilisateurIdControl = formGroup.get('utilisateur_id');
    const emailControl = formGroup.get('email');

    if (!utilisateurIdControl || !emailControl) {
      return null;
    }

    const utilisateurIdValue = utilisateurIdControl.value;
    const emailValue = emailControl.value;

    if (!utilisateurIdValue && !emailValue) {
      return { 'utilisateurOrEmailRequired': true };
    }

    return null;
  }

  onSubmit(content: any): void {

    if (this.form.valid) {
      const { reservationId, ...data } = this.form.value;


      console.log('donnee',this.form.value)
      this.loading = true;
      setTimeout(() => {

        this._reservationService.envoyerEmailReservation(reservationId, data).subscribe({
          next: (response) => {
            this.loading = false;
            this._modalService.open(content, { centered: true });
            this.successMessage = response.message;
            // Vous pouvez ici fermer le modal si nécessaire ou afficher un message de succès dans le modal
          },
          error: (error) => {
            this.loading = false;
            this._modalService.open(content, { centered: true });
            this.errorMessage = error.error.error;
            // Afficher le message d'erreur dans le modal ou comme vous préférez
          }
        });
      }, 1000);
    }
  }




  choisirAction(action: string, reservation: any) {
    // Réinitialiser les états des actions
    this.afficherChauffeurInterne = false;
    this.showResults = false
    this.calForm.patchValue({
      commission: 10, // Remplacez null par la valeur par défaut de la commission si elle existe
      compensation: 0, // Remplacez null par la valeur par défaut de la compensation si elle existe
    });
    this.data = reservation

    this.form.patchValue({
      reservationId: reservation.id // Utilisez patchValue pour pré-remplir uniquement ce champ
    });
    this.cout = reservation.coutDeVente
    // Définir l'action choisie
    if (action === 'interne') {
      this.afficherChauffeurInterne = true;
    }
    // Afficher le modal
    this.openModal();
  }


  openModal() {
    this._modalService.open(this.modalContent, { centered: true });
  }

  retour() {
    this.calForm.patchValue({
      commission: 10, // Remplacez null par la valeur par défaut de la commission si elle existe
      compensation: 0, // Remplacez null par la valeur par défaut de la compensation si elle existe
    });
    this.showResults = false
  }


}
